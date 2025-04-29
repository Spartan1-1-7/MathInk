import os
import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.urls import reverse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Equation
from .services import extract_equation_from_image, solve_equation


def index_view(request):
    """View for the homepage"""
    recent_equations = Equation.objects.all()[:5]
    return render(request, 'solver/index.html', {'recent_equations': recent_equations})


def history_view(request):
    """View to display all solved equations"""
    equations = Equation.objects.all()
    return render(request, 'solver/history.html', {'equations': equations})


class SolveEquationView(APIView):
    """API view for solving equations from uploaded images"""
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES['image']
        try:
            # Save the image temporarily
            path = default_storage.save(f'tmp/eq_{image_file.name}', ContentFile(image_file.read()))
            temp_file = os.path.join(settings.MEDIA_ROOT, path)

            # Extract equation from image
            equation_text = extract_equation_from_image(temp_file)
            if not equation_text:
                return Response({
                    'error': 'Could not extract equation from image'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Solve the equation
            solution, steps = solve_equation(equation_text)
            if not solution:
                return Response({
                    'error': 'Could not solve the equation',
                    'equation': equation_text
                }, status=status.HTTP_400_BAD_REQUEST)

            # Save the equation and solution
            equation = Equation(
                image=image_file,
                equation_text=equation_text,
                solution=solution,
                steps=steps
            )
            equation.save()

            return Response({
                'id': equation.id,
                'equation': equation_text,
                'solution': solution,
                'steps': steps if steps else []
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Clean up the temporary file
            if 'temp_file' in locals() and os.path.isfile(temp_file):
                default_storage.delete(path)
