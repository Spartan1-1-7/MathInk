from django.contrib import admin
from .models import Equation

@admin.register(Equation)
class EquationAdmin(admin.ModelAdmin):
    list_display = ('id', 'equation_text', 'solution', 'created_at')
    search_fields = ('equation_text', 'solution')
    list_filter = ('created_at',)
