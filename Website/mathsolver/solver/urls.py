from django.urls import path
from . import views

app_name = 'solver'

urlpatterns = [
    path('', views.index_view, name='index'),
    path('history/', views.history_view, name='history'),
    path('api/solve/', views.SolveEquationView.as_view(), name='solve_equation'),
]
