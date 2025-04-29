# MathSolver AI

MathSolver AI is a web application that allows users to upload images of mathematical equations and uses artificial intelligence to solve them. The application provides detailed step-by-step solutions and maintains a history of solved equations.

## Features

- **Image Upload**: Upload images containing mathematical equations
- **Equation Recognition**: Uses OCR (Optical Character Recognition) to extract equations from images
- **Equation Solving**: Processes the extracted equations to provide solutions
- **Step-by-Step Solutions**: Shows detailed steps for solving the equation
- **History Tracking**: Keeps a record of all solved equations for future reference
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5 (for responsive design)
- Font Awesome (for icons)

### Backend
- Django (Python web framework)
- Django REST Framework (for API development)
- Pillow (for image processing)
- Tesseract OCR (for extracting text from images)
- SymPy (for symbolic mathematics and solving equations)
- SQLite (database)

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Tesseract OCR installed on your system

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd mathsolver
