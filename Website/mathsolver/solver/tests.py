from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from .models import Equation
from .services import extract_equation_from_image, solve_equation

class EquationTestCase(TestCase):
    def test_equation_model(self):
        equation = Equation.objects.create(
            equation_text="2x + 3 = 7",
            solution="x = 2"
        )
        self.assertEqual(str(equation), "2x + 3 = 7 = x = 2")

    # More tests would go here for image upload, equation solving, etc.
