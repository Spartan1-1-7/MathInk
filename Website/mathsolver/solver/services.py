import os
import re
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import sympy
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor
from sympy import symbols, Eq, solve

def preprocess_image(image_path):
    """Preprocess the image to make OCR more accurate"""
    try:
        # Open image
        img = Image.open(image_path)
        
        # Convert to grayscale
        img = img.convert('L')
        
        # Increase contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2)
        
        # Apply thresholding
        threshold = 150
        img = img.point(lambda p: p > threshold and 255)
        
        # Apply noise reduction
        img = img.filter(ImageFilter.MedianFilter(size=3))
        
        # Save preprocessed image
        preprocessed_path = f"{os.path.splitext(image_path)[0]}_preprocessed.png"
        img.save(preprocessed_path)
        
        return preprocessed_path
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return image_path

def extract_equation_from_image(image_path):
    """Extract equation text from the image using OCR"""
    try:
        # Preprocess the image
        preprocessed_path = preprocess_image(image_path)
        
        # Use Tesseract OCR to extract text
        text = pytesseract.image_to_string(preprocessed_path)
        
        # Clean up the extracted text
        text = text.strip()
        
        # Remove unnecessary whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Replace common OCR errors for math symbols
        replacements = {
            'x': 'x',  # Ensure 'x' is preserved as variable
            '÷': '/',
            '×': '*',
            '–': '-',
            '−': '-',
            '=': '=',
            '^': '**',
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        # Clean up preprocessed file
        if preprocessed_path != image_path and os.path.exists(preprocessed_path):
            os.remove(preprocessed_path)
        
        return text
    except Exception as e:
        print(f"Error extracting equation: {e}")
        return None

def parse_equation(equation_text):
    """Parse the equation text into a SymPy equation"""
    try:
        # Handle equations with equality sign
        if '=' in equation_text:
            lhs_text, rhs_text = equation_text.split('=', 1)
            
            # Set up transformations for parsing
            transformations = (standard_transformations + 
                             (implicit_multiplication_application,
                              convert_xor))
            
            # Parse left and right hand sides
            lhs = parse_expr(lhs_text.strip(), transformations=transformations)
            rhs = parse_expr(rhs_text.strip(), transformations=transformations)
            
            return lhs, rhs
        else:
            # If there's no equality, assume it's an expression to evaluate
            transformations = (standard_transformations + 
                             (implicit_multiplication_application,
                              convert_xor))
            expr = parse_expr(equation_text.strip(), transformations=transformations)
            return expr, None
    except Exception as e:
        print(f"Error parsing equation: {e}")
        return None, None

def solve_equation(equation_text):
    """Solve the extracted equation using SymPy"""
    try:
        # Parse the equation
        lhs, rhs = parse_equation(equation_text)
        
        if rhs is not None:  # It's an equation
            # Create equation object
            equation = Eq(lhs, rhs)
            
            # Find all symbols in the equation
            symbols_in_eq = list(equation.free_symbols)
            
            if not symbols_in_eq:
                # If no symbols, it's just a statement to verify
                is_true = sympy.simplify(lhs - rhs) == 0
                solution = "True" if is_true else "False"
                steps = f"Checking if {lhs} = {rhs}: {solution}"
                return solution, steps
            
            # Solve for the symbol(s)
            symbol_to_solve = symbols_in_eq[0]  # Default to first symbol
            
            # Check if the equation contains 'x' which is the traditional variable
            for symbol in symbols_in_eq:
                if symbol.name == 'x':
                    symbol_to_solve = symbol
                    break
            
            # Solve the equation
            solutions = solve(equation, symbol_to_solve)
            
            if not solutions:
                return "No solution found", "The equation has no solution."
            
            # Format solution
            solution_text = ", ".join([f"{symbol_to_solve} = {s}" for s in solutions])
            
            # Generate steps
            steps = generate_solution_steps(equation, symbol_to_solve, solutions)
            
            return solution_text, steps
        
        else:  # It's an expression to evaluate
            simplified = sympy.simplify(lhs)
            solution_text = str(simplified)
            steps = f"Simplifying {lhs}: {solution_text}"
            
            return solution_text, steps
    
    except Exception as e:
        print(f"Error solving equation: {e}")
        return None, None

def generate_solution_steps(equation, symbol, solutions):
    """Generate step-by-step solution for the equation"""
    steps = []
    
    # Add the original equation
    steps.append(f"Original equation: {equation}")
    
    # Move all terms with the variable to the left side
    # and all constant terms to the right side
    lhs, rhs = equation.args
    
    # Find terms with the symbol
    lhs_has_symbol = symbol in lhs.free_symbols
    rhs_has_symbol = symbol in rhs.free_symbols
    
    if lhs_has_symbol and rhs_has_symbol:
        # Move all terms with symbol to LHS
        new_lhs = lhs - rhs.subs(symbol, 0)
        new_rhs = rhs.subs(symbol, 0) - lhs.subs(symbol, 0)
        steps.append(f"Rearranging to isolate {symbol}: {new_lhs} = {new_rhs}")
        
        # Factor out the symbol if possible
        factor_lhs = sympy.factor(new_lhs)
        if factor_lhs != new_lhs:
            steps.append(f"Factoring the left side: {factor_lhs} = {new_rhs}")
            new_lhs = factor_lhs
        
        # Solve for the symbol
        coeff = sympy.simplify(new_lhs / symbol)
        if coeff != 1:
            steps.append(f"Dividing both sides by {coeff}: {symbol} = {new_rhs / coeff}")
    
    # Add final solution
    for sol in solutions:
        steps.append(f"Solution: {symbol} = {sol}")
    
    return "\n".join(steps)
