from django.db import models

class Equation(models.Model):
    image = models.ImageField(upload_to='equations/', blank=True, null=True)
    equation_text = models.CharField(max_length=255)
    solution = models.TextField()
    steps = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.equation_text} = {self.solution}"
