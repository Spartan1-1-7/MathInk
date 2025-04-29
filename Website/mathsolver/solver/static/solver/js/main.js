/**
 * Math Equation Solver - Main JavaScript
 * Handles the equation image upload, form submission, and result display
 * Modern and dynamic interface with animations and enhanced user experience
 */

// Initialize the equation solver functionality
function initEquationSolver() {
    // DOM elements
    const equationForm = document.getElementById('equationForm');
    const equationImage = document.getElementById('equationImage');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const removePreviewBtn = document.getElementById('removePreview');
    const submitBtn = document.getElementById('submitBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const processingProgress = document.getElementById('processingProgress');
    const resultsCard = document.getElementById('resultsCard');
    const detectedEquation = document.getElementById('detectedEquation');
    const equationSolution = document.getElementById('equationSolution');
    const solutionSteps = document.getElementById('solutionSteps');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const solveAnotherBtn = document.getElementById('solveAnotherBtn');
    const downloadSolutionBtn = document.getElementById('downloadSolutionBtn');
    const dropZone = document.getElementById('dropZone');

    // Add event listeners
    if (equationForm) {
        // Preview image when selected
        equationImage.addEventListener('change', previewSelectedImage);
        
        // Remove preview when button clicked
        if (removePreviewBtn) {
            removePreviewBtn.addEventListener('click', removeImagePreview);
        }
        
        // Form submission
        equationForm.addEventListener('submit', handleFormSubmit);
        
        // Solve another button
        if (solveAnotherBtn) {
            solveAnotherBtn.addEventListener('click', resetForm);
        }
        
        // Download solution button
        if (downloadSolutionBtn) {
            downloadSolutionBtn.addEventListener('click', downloadSolution);
        }
        
        // Set up drag and drop for the drop zone
        if (dropZone) {
            setupDragAndDrop();
        }
    }

    /**
     * Set up drag and drop functionality
     */
    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropZone.classList.add('dragover');
        }
        
        function unhighlight() {
            dropZone.classList.remove('dragover');
        }
        
        dropZone.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                equationImage.files = files;
                const event = new Event('change');
                equationImage.dispatchEvent(event);
            }
        }
    }

    /**
     * Preview the selected image with animation
     */
    function previewSelectedImage(event) {
        const file = event.target.files[0];
        
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showError('Invalid file type. Please upload a JPG, PNG, or GIF image.');
                equationImage.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('File too large. Maximum size is 5MB.');
                equationImage.value = '';
                return;
            }
            
            // Create preview with animation
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                uploadPreview.style.display = 'block';
                uploadPreview.classList.add('fade-in');
                hideError();
                
                // Enable submit button visual cue
                submitBtn.classList.add('btn-pulse');
                setTimeout(() => {
                    submitBtn.classList.remove('btn-pulse');
                }, 1000);
            };
            reader.readAsDataURL(file);
        } else {
            removeImagePreview();
        }
    }

    /**
     * Remove the image preview with animation
     */
    function removeImagePreview() {
        uploadPreview.classList.add('fade-out');
        
        setTimeout(() => {
            uploadPreview.style.display = 'none';
            uploadPreview.classList.remove('fade-out');
            previewImage.src = '#';
            equationImage.value = '';
        }, 300);
    }

    /**
     * Reset the form to solve another equation
     */
    function resetForm() {
        removeImagePreview();
        
        // Hide results with animation
        resultsCard.classList.add('fade-out');
        
        setTimeout(() => {
            resultsCard.style.display = 'none';
            resultsCard.classList.remove('fade-out', 'show');
            
            // Reset progress bar
            if (processingProgress) {
                processingProgress.style.width = '0%';
            }
            
            // Scroll to top of form
            equationForm.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }

    /**
     * Simulate the progress of equation processing
     */
    function simulateProcessingProgress() {
        if (!processingProgress) return () => {};
        
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) {
                clearInterval(interval);
            } else {
                width += Math.random() * 15;
                if (width > 90) width = 90;
                processingProgress.style.width = width + '%';
            }
        }, 300);
        
        return function() {
            clearInterval(interval);
            processingProgress.style.width = '100%';
        };
    }

    /**
     * Handle form submission with enhanced animations
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Validate form
        if (!equationImage.files[0]) {
            showError('Please select an image first.');
            return;
        }
        
        // Show loading indicator with animation
        loadingIndicator.style.display = 'block';
        loadingIndicator.classList.add('fade-in');
        
        // Hide results if visible
        if (resultsCard.style.display !== 'none') {
            resultsCard.style.display = 'none';
            resultsCard.classList.remove('show');
        }
        
        submitBtn.disabled = true;
        hideError();
        
        // Start progress bar animation
        const completeProgress = simulateProcessingProgress();
        
        // Create form data for submission
        const formData = new FormData();
        formData.append('image', equationImage.files[0]);
        
        // Send the image to the server
        fetch('/api/solve/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Something went wrong. Please try again.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Complete progress bar
            completeProgress();
            
            // Small delay to show 100% progress
            setTimeout(() => {
                // Hide loading indicator with animation
                loadingIndicator.classList.add('fade-out');
                
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                    loadingIndicator.classList.remove('fade-in', 'fade-out');
                    
                    // Show results
                    detectedEquation.textContent = data.equation;
                    equationSolution.textContent = data.solution;
                    
                    // Format steps if available
                    if (data.steps && data.steps.length > 0) {
                        solutionSteps.textContent = data.steps;
                    } else {
                        solutionSteps.textContent = 'No detailed steps available.';
                    }
                    
                    // Show the results card with animation
                    resultsCard.style.display = 'block';
                    setTimeout(() => {
                        resultsCard.classList.add('show');
                    }, 10);
                    
                    resultsCard.scrollIntoView({ behavior: 'smooth' });
                    
                    // Re-enable submit button
                    submitBtn.disabled = false;
                }, 300);
            }, 400);
        })
        .catch(error => {
            // Complete progress bar
            completeProgress();
            
            // Small delay to show 100% progress
            setTimeout(() => {
                // Hide loading indicator
                loadingIndicator.classList.add('fade-out');
                
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                    loadingIndicator.classList.remove('fade-in', 'fade-out');
                    
                    // Show error
                    showError(error.message);
                    
                    // Re-enable submit button
                    submitBtn.disabled = false;
                }, 300);
            }, 400);
        });
    }

    /**
     * Download the solution as a text file
     */
    function downloadSolution() {
        if (!detectedEquation || !equationSolution || !solutionSteps) return;
        
        const equation = detectedEquation.textContent;
        const solution = equationSolution.textContent;
        const steps = solutionSteps.textContent;
        
        const content = `
Math Equation Solution
======================

Equation: ${equation}

Solution: ${solution}

Step-by-Step Explanation:
${steps}

Generated by MathSolver AI on ${new Date().toLocaleString()}
`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `equation-solution-${Date.now()}.txt`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Visual feedback
        downloadSolutionBtn.innerHTML = '<i class="fas fa-check me-2"></i>Downloaded';
        downloadSolutionBtn.classList.add('btn-success');
        downloadSolutionBtn.classList.remove('btn-outline-success');
        
        setTimeout(() => {
            downloadSolutionBtn.innerHTML = '<i class="fas fa-download me-2"></i>Save Solution';
            downloadSolutionBtn.classList.remove('btn-success');
            downloadSolutionBtn.classList.add('btn-outline-success');
        }, 2000);
    }

    /**
     * Show error message with enhanced styling
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';
        errorAlert.classList.add('fade-in');
        
        // Scroll to error
        errorAlert.scrollIntoView({ behavior: 'smooth' });
        
        // Shake animation for better visibility
        errorAlert.classList.add('shake');
        setTimeout(() => {
            errorAlert.classList.remove('shake');
        }, 500);
    }

    /**
     * Hide error message with animation
     */
    function hideError() {
        if (errorAlert.style.display === 'none') return;
        
        errorAlert.classList.add('fade-out');
        setTimeout(() => {
            errorAlert.style.display = 'none';
            errorAlert.classList.remove('fade-in', 'fade-out');
        }, 300);
    }
}

// Add CSS animation classes dynamically
function addAnimationStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .fade-out {
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        }
        
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .btn-pulse {
            animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(styleElement);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add animation styles
    addAnimationStyles();
    
    // Check if we're on the index page that has the equation form
    if (document.getElementById('equationForm')) {
        initEquationSolver();
        
        // Initialize browse button if it exists
        const browseBtn = document.getElementById('browseBtn');
        const equationImage = document.getElementById('equationImage');
        
        if (browseBtn && equationImage) {
            browseBtn.addEventListener('click', function() {
                equationImage.click();
            });
        }
    }
    
    // Add hover effects to tables in history page
    const tables = document.querySelectorAll('.table-hover');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(209, 222, 232, 0.2)';
                this.style.transition = 'background-color 0.3s ease';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    });
});
