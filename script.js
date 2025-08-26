// Global variables
let currentStep = 1;
let formData = {};
let countdownInterval;
let currentCount = 147;
let countAnimationInterval;
let savedFormData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeProgressBar();
    initializeForm(); // Use enhanced form initialization
    initializeConditionalFields(); // Initialize conditional fields
    initializeAnimations();
    initializeCountUpAnimation();
    initializeMicrointeractions();
    updateCurrentCount();
    initializeModal(); // Initialize modal functionality
});

// Countdown Timer
function initializeCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 42); // 42 days from now
    
    function updateCountdown() {
        const now = new Date();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            // Update all countdown elements
            const countdownElements = document.querySelectorAll('#countdown, #countdownDays, #finalCountdown, #modalCountdown');
            countdownElements.forEach(element => {
                if (element.id === 'modalCountdown') {
                    element.textContent = `${days} days`;
                } else {
                    element.textContent = days;
                }
            });
        }
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Progress Bar
function initializeProgressBar() {
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    });
}

// Count-Up Animation for Metrics
function initializeCountUpAnimation() {
    const countElements = document.querySelectorAll('#currentCount, .counter-number');
    
    countElements.forEach(element => {
        const targetValue = parseInt(element.textContent) || 147;
        animateCountUp(element, 0, targetValue, 800);
    });
}

function animateCountUp(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(start + (difference * easeOut));
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

// Form Handlers
function initializeFormHandlers() {
    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');
    
    if (step1Form) {
        step1Form.addEventListener('submit', handleStep1Submit);
    }
    
    if (step2Form) {
        step2Form.addEventListener('submit', handleStep2Submit);
    }
    
    // Initialize multi-select functionality
    initializeMultiSelects();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Auto-save form data
    initializeAutoSave();
}

// Conditional Fields Initialization
function initializeConditionalFields() {
    // Vijay Raja student toggle (Yes/No buttons)
    const toggleButtons = document.querySelectorAll('.toggle-option');
    const vijayStudentInput = document.getElementById('vijayStudent');
    const instituteField = document.getElementById('instituteField');
    
    console.log('Initializing conditional fields...');
    console.log('Toggle buttons found:', toggleButtons.length);
    console.log('Vijay student input found:', !!vijayStudentInput);
    console.log('Institute field found:', !!instituteField);
    
    if (toggleButtons.length > 0 && vijayStudentInput && instituteField) {
        toggleButtons.forEach(button => {
            // Remove any existing event listeners
            button.removeEventListener('click', handleToggleClick);
            button.addEventListener('click', handleToggleClick);
        });
        
        console.log('Toggle event listeners added successfully');
    } else {
        console.log('Some elements not found for toggle functionality');
    }
    
    // Work Area "Other" field
    const workAreaSelect = document.getElementById('workArea');
    const workAreaOtherField = document.getElementById('workAreaOtherField');
    
    if (workAreaSelect && workAreaOtherField) {
        workAreaSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                workAreaOtherField.style.display = 'block';
                setTimeout(() => workAreaOtherField.classList.add('show'), 10);
                document.getElementById('workAreaOther').required = true;
            } else {
                workAreaOtherField.classList.remove('show');
                setTimeout(() => workAreaOtherField.style.display = 'none', 300);
                document.getElementById('workAreaOther').required = false;
                document.getElementById('workAreaOther').value = '';
                clearFieldError(document.getElementById('workAreaOther'));
            }
        });
    }
    
    // Challenge "Other" field
    const challengeSelect = document.getElementById('challenge');
    const challengeOtherField = document.getElementById('challengeOtherField');
    
    if (challengeSelect && challengeOtherField) {
        challengeSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                challengeOtherField.style.display = 'block';
                setTimeout(() => challengeOtherField.classList.add('show'), 10);
                document.getElementById('challengeOther').required = true;
            } else {
                challengeOtherField.classList.remove('show');
                setTimeout(() => challengeOtherField.style.display = 'none', 300);
                document.getElementById('challengeOther').required = false;
                document.getElementById('challengeOther').value = '';
                clearFieldError(document.getElementById('challengeOther'));
            }
        });
    }
    
    // Birthday wishes opt-out
    const noBirthdayWishesCheckbox = document.getElementById('noBirthdayWishes');
    const birthdayField = document.getElementById('birthday');
    const birthdayLabel = document.querySelector('label[for="birthday"]');
    const birthdayWrapper = birthdayField ? birthdayField.closest('.input-wrapper') : null;
    
    if (noBirthdayWishesCheckbox && birthdayField) {
        noBirthdayWishesCheckbox.addEventListener('change', function() {
            if (this.checked) {
                birthdayField.required = false;
                birthdayField.disabled = true;
                birthdayField.value = '';
                clearFieldError(birthdayField);
                
                // Grey out the entire birthday section
                if (birthdayLabel) birthdayLabel.style.opacity = '0.5';
                if (birthdayWrapper) birthdayWrapper.style.opacity = '0.5';
                birthdayField.style.opacity = '0.5';
                
                // Add disabled class for styling
                birthdayField.classList.add('disabled');
                if (birthdayWrapper) birthdayWrapper.classList.add('disabled');
            } else {
                birthdayField.required = true;
                birthdayField.disabled = false;
                
                // Restore normal appearance
                if (birthdayLabel) birthdayLabel.style.opacity = '1';
                if (birthdayWrapper) birthdayWrapper.style.opacity = '1';
                birthdayField.style.opacity = '1';
                
                // Remove disabled class
                birthdayField.classList.remove('disabled');
                if (birthdayWrapper) birthdayWrapper.classList.remove('disabled');
            }
        });
    }
}

// Separate function for toggle click handling
function handleToggleClick() {
    const value = this.getAttribute('data-value');
    const isVijayStudent = value === 'yes';
    
    // Get all toggle buttons in the same group
    const toggleButtons = this.parentElement.querySelectorAll('.toggle-option');
    const vijayStudentInput = document.getElementById('vijayStudent');
    const instituteField = document.getElementById('instituteField');
    
    console.log('Toggle clicked:', value);
    
    // Update button states
    toggleButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
    });
    this.classList.add('selected');
    this.setAttribute('aria-checked', 'true');
    
    // Update hidden input
    if (vijayStudentInput) {
        vijayStudentInput.value = value;
    }
    
    // Show/hide student details section
    if (instituteField) {
        if (isVijayStudent) {
            instituteField.style.display = 'block';
            setTimeout(() => instituteField.classList.add('show'), 10);
            
            // Make fields required
            const instituteInput = document.getElementById('institute');
            const batchYearInput = document.getElementById('batchYear');
            
            if (instituteInput) {
                instituteInput.required = true;
            }
            if (batchYearInput) {
                batchYearInput.required = true;
            }
            
            console.log('Student details section shown');
        } else {
            instituteField.classList.remove('show');
            setTimeout(() => instituteField.style.display = 'none', 300);
            
            // Clear and make fields not required
            const instituteInput = document.getElementById('institute');
            const batchYearInput = document.getElementById('batchYear');
            
            if (instituteInput) {
                instituteInput.required = false;
                instituteInput.value = '';
                clearFieldError(instituteInput);
            }
            if (batchYearInput) {
                batchYearInput.required = false;
                batchYearInput.value = '';
                clearFieldError(batchYearInput);
            }
            
            console.log('Student details section hidden');
        }
    }
}

// Autocomplete Initialization
function initializeAutocomplete() {
    // Load saved suggestions from localStorage
    const suggestions = {
        organizations: JSON.parse(localStorage.getItem('organizationSuggestions') || '[]'),
        roles: JSON.parse(localStorage.getItem('roleSuggestions') || '[]'),
        institutes: JSON.parse(localStorage.getItem('instituteSuggestions') || '[]'),
        cities: JSON.parse(localStorage.getItem('citySuggestions') || '[]'),
        areas: JSON.parse(localStorage.getItem('areaSuggestions') || '[]')
    };
    
    // No default suggestions - let the system learn from user input
    // The institute suggestions will be populated as users submit the form
    
    // Populate datalists
    populateDatalist('organizationSuggestions', suggestions.organizations);
    populateDatalist('roleSuggestions', suggestions.roles);
    populateDatalist('instituteSuggestions', suggestions.institutes);
    populateDatalist('citySuggestions', suggestions.cities);
    populateDatalist('areaSuggestions', suggestions.areas);
}

function populateDatalist(datalistId, suggestions) {
    const datalist = document.getElementById(datalistId);
    if (datalist) {
        datalist.innerHTML = '';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });
    }
}

function saveSuggestion(type, value) {
    if (!value.trim()) return;
    
    const key = `${type}Suggestions`;
    const suggestions = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (!suggestions.includes(value)) {
        suggestions.unshift(value);
        // Keep only last 10 suggestions
        suggestions.splice(10);
        localStorage.setItem(key, JSON.stringify(suggestions));
        
        // Update datalist
        populateDatalist(`${type}Suggestions`, suggestions);
    }
}

// Auto-save Form Data
function initializeAutoSave() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', debounce(saveFormData, 500));
            input.addEventListener('change', saveFormData);
        });
    });
}

function saveFormData() {
    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');
    
    const formData = {};
    
    // Save Step 1 data
    if (step1Form) {
        const step1Data = new FormData(step1Form);
        for (let [key, value] of step1Data.entries()) {
            formData[`step1_${key}`] = value;
        }
    }
    
    // Save Step 2 data
    if (step2Form) {
        const step2Data = new FormData(step2Form);
        for (let [key, value] of step2Data.entries()) {
            formData[`step2_${key}`] = value;
        }
    }
    
    localStorage.setItem('savedFormData', JSON.stringify(formData));
}

function loadSavedFormData() {
    const savedData = JSON.parse(localStorage.getItem('savedFormData') || '{}');
    
    Object.keys(savedData).forEach(key => {
        const [step, fieldName] = key.split('_');
        const formId = step === 'step1' ? 'step1Form' : 'step2Form';
        const form = document.getElementById(formId);
        
        if (form) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.value = savedData[key];
                
                // Trigger conditional field logic
                if (fieldName === 'vijayStudent') {
                    const toggleButtons = document.querySelectorAll('.toggle-option');
                    toggleButtons.forEach(btn => {
                        if (btn.getAttribute('data-value') === savedData[key]) {
                            btn.classList.add('selected');
                        } else {
                            btn.classList.remove('selected');
                        }
                    });
                    
                    if (savedData[key] === 'yes') {
                        const instituteField = document.getElementById('instituteField');
                        if (instituteField) {
                            instituteField.style.display = 'block';
                            document.getElementById('institute').required = true;
                        }
                    }
                }
                if (fieldName === 'workArea' && savedData[key] === 'other') {
                    const event = new Event('change');
                    field.dispatchEvent(event);
                }
                if (fieldName === 'challenge' && savedData[key] === 'other') {
                    const event = new Event('change');
                    field.dispatchEvent(event);
                }
                if (fieldName === 'noBirthdayWishes' && savedData[key] === 'on') {
                    const event = new Event('change');
                    field.dispatchEvent(event);
                }
            }
        }
    });
}

// Form Validation with Enhanced Rules
function initializeFormValidation() {
    const formFields = document.querySelectorAll('input, select, textarea');
    
    formFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required') && !field.disabled;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific field validations
    switch (field.name) {
        case 'fullName':
            if (value && value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters');
                return false;
            }
            break;
            
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'phone':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
            
        case 'linkedin':
            if (value && !isValidLinkedIn(value)) {
                showFieldError(field, 'Please enter a valid LinkedIn URL');
                return false;
            }
            break;
            
        case 'pincode':
            if (value && !isValidPincode(value)) {
                showFieldError(field, 'Please enter a valid 6-digit PIN code');
                return false;
            }
            break;
            
        case 'institute':
            if (field.required && !value) {
                showFieldError(field, 'Please specify which institute');
                return false;
            }
            break;
            
        case 'workAreaOther':
            if (field.required && !value) {
                showFieldError(field, 'Please specify your work area');
                return false;
            }
            break;
            
        case 'challengeOther':
            if (field.required && !value) {
                showFieldError(field, 'Please specify your challenge');
                return false;
            }
            break;
            
        case 'batchYear':
            if (field.required && !value) {
                showFieldError(field, 'Please enter your batch/year');
                return false;
            }
            if (value && !isValidBatchYear(value)) {
                showFieldError(field, 'Please enter a valid year (1990 to current year + 5)');
                return false;
            }
            break;
    }
    
    // Success validation feedback
    if (value && isRequired) {
        showFieldSuccess(field);
    }
    
    return true;
}

function showFieldError(field, message) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'flex';
    }
    
    field.classList.add('error');
    field.style.animation = 'fieldShake 0.3s ease-in-out';
    
    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
        navigator.vibrate(100);
    }
}

function showFieldSuccess(field) {
    field.classList.add('success');
    
    // Remove success class after 2 seconds
    setTimeout(() => {
        field.classList.remove('success');
    }, 2000);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
    field.style.animation = '';
}

// Step 1 Form Handler - Replace Step 1 with Step 2
function handleStep1Submit(e) {
    e.preventDefault();
    console.log('🚀 Step 1 form submitted');
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('📝 Step 1 data:', data);
    
    // Validate all fields
    const fields = e.target.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        console.log('❌ Step 1 validation failed');
        // Shake the form container
        const formContainer = e.target.closest('.form-container');
        formContainer.style.animation = 'formShake 0.5s ease-in-out';
        
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        setTimeout(() => {
            formContainer.style.animation = '';
        }, 500);
        
        return;
    }
    
    console.log('✅ Step 1 validation passed');
    
    // Store form data
    window.formData = { ...window.formData, ...data };
    
    // Update progress
    updateProgress(50);
    
    // Success feedback
    showSuccess('Step 1 completed! Loading Step 2...');
    
    // Replace Step 1 with Step 2
    setTimeout(() => {
        const step1Section = document.getElementById('step1');
        const step2Section = document.getElementById('step2');
        
        if (step1Section && step2Section) {
            console.log('🔄 Switching to Step 2');
            // Hide Step 1
            step1Section.style.display = 'none';
            
            // Show Step 2
            step2Section.style.display = 'block';
            
            // Re-initialize conditional fields for Step 2
            initializeConditionalFields();
            
            // Smooth scroll to step 2 instead of top
            setTimeout(() => {
                step2Section.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        } else {
            console.log('❌ Step sections not found');
        }
    }, 500);
}

// Step 2 Form Handler
function handleStep2Submit(e) {
    e.preventDefault();
    console.log('🚀 Step 2 form submitted');
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('📝 Step 2 data:', data);
    
    // Validate required fields
    const requiredFields = [
        'organization', 'role', 'experience', 'workArea', 
        'challenge', 'city', 'area', 'pincode', 'addressLine1'
    ];
    
    let isValid = true;
    for (let fieldName of requiredFields) {
        const field = e.target.querySelector(`[name="${fieldName}"]`);
        if (field && !validateField(field)) {
            isValid = false;
        }
    }
    
    // Validate conditional fields
    const vijayStudent = e.target.querySelector('#vijayStudent');
    if (vijayStudent && vijayStudent.value === 'yes') {
        const instituteField = e.target.querySelector('#institute');
        const batchYearField = e.target.querySelector('#batchYear');
        
        if (instituteField && !validateField(instituteField)) {
            isValid = false;
        }
        
        if (batchYearField && !validateField(batchYearField)) {
            isValid = false;
        }
    }
    
    const workArea = e.target.querySelector('#workArea');
    if (workArea && workArea.value === 'other') {
        const workAreaOtherField = e.target.querySelector('#workAreaOther');
        if (workAreaOtherField && !validateField(workAreaOtherField)) {
            isValid = false;
        }
    }
    
    const challenge = e.target.querySelector('#challenge');
    if (challenge && challenge.value === 'other') {
        const challengeOtherField = e.target.querySelector('#challengeOther');
        if (challengeOtherField && !validateField(challengeOtherField)) {
            isValid = false;
        }
    }
    
    // Validate multi-select fields
    const priorities = formData.getAll('priorities');
    const mattersMost = formData.get('mattersMost');
    
    if (priorities.length === 0) {
        showFieldError(e.target.querySelector('#prioritiesMultiSelect'), 'Please select at least one professional priority');
        isValid = false;
    } else if (priorities.length > 2) {
        showFieldError(e.target.querySelector('#prioritiesMultiSelect'), 'Please select maximum 2 priorities');
        isValid = false;
    }
    
    if (!mattersMost) {
        showFieldError(e.target.querySelector('#mattersMostSingleSelect'), 'Please select what matters most to you');
        isValid = false;
    }
    
    // Validate birthday (unless opted out)
    const noBirthdayWishes = e.target.querySelector('#noBirthdayWishes');
    if (!noBirthdayWishes || !noBirthdayWishes.checked) {
        const birthdayField = e.target.querySelector('#birthday');
        if (birthdayField && !validateField(birthdayField)) {
            isValid = false;
        }
    }
    
    if (!isValid) {
        // Shake the form container
        const formContainer = e.target.closest('.form-container');
        formContainer.style.animation = 'formShake 0.5s ease-in-out';
        
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        setTimeout(() => {
            formContainer.style.animation = '';
        }, 500);
        
        return;
    }
    
    // Save suggestions
    if (data.organization) saveSuggestion('organizations', data.organization);
    if (data.role) saveSuggestion('roles', data.role);
    if (data.institute) saveSuggestion('institutes', data.institute);
    if (data.city) saveSuggestion('cities', data.city);
    if (data.area) saveSuggestion('areas', data.area);
    
    // Store form data
    window.formData = { 
        ...window.formData, 
        ...data,
        priorities: priorities,
        mattersMost: mattersMost
    };
    
    // Update progress with smooth animation
    updateProgress(100);
    
    // Success feedback with badge unlock animation
    setTimeout(() => {
        showSuccessModal();
        unlockInnerCircleBadge();
    }, 500);
}

// Multi-select Initialization with Enhanced Feedback
function initializeMultiSelects() {
    const multiSelects = document.querySelectorAll('.multi-select');
    
    multiSelects.forEach(select => {
        const checkboxes = select.querySelectorAll('input[type="checkbox"]');
        const maxSelections = select.id === 'prioritiesMultiSelect' ? 2 : Infinity; // Limit to 2 for priorities
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const checkedBoxes = select.querySelectorAll('input[type="checkbox"]:checked');
                
                // Check if we're at the limit
                if (checkedBoxes.length > maxSelections) {
                    // Uncheck the current checkbox if it would exceed the limit
                    this.checked = false;
                    return;
                }
                
                // Disable/enable checkboxes based on selection limit
                if (maxSelections !== Infinity) {
                    checkboxes.forEach(cb => {
                        if (!cb.checked) {
                            cb.disabled = checkedBoxes.length >= maxSelections;
                            cb.parentElement.classList.toggle('disabled', checkedBoxes.length >= maxSelections);
                        }
                    });
                }
                
                // Add visual feedback
                if (checkedBoxes.length > 0) {
                    select.style.borderColor = 'var(--gold-500)';
                    select.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                    
                    // Add success pulse
                    select.style.animation = 'successPulse 0.3s ease-in-out';
                    setTimeout(() => {
                        select.style.animation = '';
                    }, 300);
                } else {
                    select.style.borderColor = 'var(--gold-700)';
                    select.style.backgroundColor = 'var(--bg-base)';
                }
            });
        });
    });
    
    // Single-select initialization
    const singleSelects = document.querySelectorAll('.single-select');
    
    singleSelects.forEach(select => {
        const radios = select.querySelectorAll('input[type="radio"]');
        
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                select.style.borderColor = 'var(--gold-500)';
                select.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                
                // Add success pulse
                select.style.animation = 'successPulse 0.3s ease-in-out';
                setTimeout(() => {
                    select.style.animation = '';
                }, 300);
            });
        });
    });
}

// Enhanced Validation Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    // Check if it starts with + and has 10-15 digits, or just has 10-15 digits
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleanPhone);
}

function isValidLinkedIn(url) {
    if (!url) return true; // Optional field
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedInRegex.test(url);
}

function isValidPincode(pincode) {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
}

function isValidBatchYear(batchYear) {
    // Allow years from 1990 to current year + 5
    const currentYear = new Date().getFullYear();
    const year = parseInt(batchYear);
    return year >= 1990 && year <= currentYear + 5;
}

// Progress Update with Smooth Animation
function updateProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        // Animate progress bar
        progressFill.style.transition = 'width 0.6s ease-out';
        progressFill.style.width = percentage + '%';
    }
    
    // Update progress steps with animation
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (percentage >= 50 && index === 0) {
            step.classList.remove('active');
            step.classList.add('completed');
            step.style.animation = 'stepComplete 0.5s ease-out';
        } else if (percentage >= 100 && index === 1) {
            step.classList.remove('active');
            step.classList.add('completed');
            step.style.animation = 'stepComplete 0.5s ease-out';
        }
    });
}

// Update Current Count with Throttled Animation
function updateCurrentCount() {
    const currentCountElement = document.getElementById('currentCount');
    if (currentCountElement) {
        // Throttle updates to feel real
        countAnimationInterval = setInterval(() => {
            const increment = Math.floor(Math.random() * 2) + 1;
            currentCount += increment;
            
            if (currentCount >= 500) {
                currentCount = 500;
                clearInterval(countAnimationInterval);
            }
            
            // Animate the count change
            animateCountUp(currentCountElement, parseInt(currentCountElement.textContent), currentCount, 600);
        }, 8000); // Update every 8 seconds
    }
}

// Success Modal with Enhanced Animation
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    const memberNumber = document.getElementById('memberNumber');
    
    if (modal && memberNumber) {
        // Generate random member number between 148-500
        const randomMemberNumber = Math.floor(Math.random() * (500 - 148 + 1)) + 148;
        
        // Animate the member number
        animateCountUp(memberNumber, 0, randomMemberNumber, 900);
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation
        modal.style.animation = 'modalEntrance 0.5s ease-out';
    }
}

// Close Modal - Enhanced Version
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        // Force hide the modal
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        
        // Remove any backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Force remove any fixed positioning
        document.body.style.position = '';
        document.body.style.top = '';
        
        console.log('Modal closed successfully');
    } else {
        console.log('Modal not found');
    }
}

// Emergency close function - can be called from console
function forceCloseModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
        console.log('Modal forcefully removed');
    }
}

// Global function for debugging
window.closeModal = closeModal;
window.forceCloseModal = forceCloseModal;

// Enhanced Modal Functionality
function initializeModal() {
    const modal = document.getElementById('successModal');
    const closeButton = document.querySelector('.modal-close');
    
    if (modal && closeButton) {
        // Close on button click
        closeButton.addEventListener('click', closeModal);
        
        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }
}

// Enhanced Error Display with Shake Animation
function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles with design system colors
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error);
        color: var(--bg-base);
        padding: 15px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        box-shadow: var(--shadow-medium);
        animation: notificationSlideIn 0.3s ease;
        border: 1px solid rgba(255, 107, 107, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Add shake animation
    setTimeout(() => {
        notification.style.animation = 'notificationShake 0.5s ease-in-out';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Enhanced Success Display
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles with design system colors
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: var(--bg-base);
        padding: 15px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        box-shadow: var(--shadow-medium);
        animation: notificationSlideIn 0.3s ease;
        border: 1px solid rgba(61, 220, 151, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// VR What More Badge Unlock Animation
function unlockInnerCircleBadge() {
    // Badge removed from HTML, function kept for compatibility
    console.log('Badge unlock animation triggered');
}

function createSparkleEffect(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--gold-400);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation: sparkleFloat 0.8s ease-out forwards;
            `;
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.remove();
                }
            }, 800);
        }, i * 50);
    }
}

// Enhanced Animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Special animation for value proposition section
                if (entry.target.classList.contains('value-proposition')) {
                    animateValueProposition(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Animate stats on scroll
    const statItems = document.querySelectorAll('.stat-item');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-up');
            }
        });
    }, observerOptions);
    
    statItems.forEach(item => {
        statObserver.observe(item);
    });
    
    // Initialize hero section interactions
    initializeHeroInteractions();
}

// Hero Section Interactions
function initializeHeroInteractions() {
    // Scroll indicator functionality
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.value-proposition');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Add keyboard support
        scrollIndicator.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Make it focusable
        scrollIndicator.setAttribute('tabindex', '0');
        scrollIndicator.setAttribute('role', 'button');
        scrollIndicator.setAttribute('aria-label', 'Scroll to next section');
    }
    
    // Particle system interactions
    initializeParticleInteractions();
    
    // CTA button enhancements
    initializeCTAEnhancements();
}

// Particle System Interactions
function initializeParticleInteractions() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach(particle => {
        // Add hover effect to particles
        particle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.5)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            this.style.transition = 'all 0.3s ease';
        });
        
        particle.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.background = '';
            this.style.transition = '';
        });
    });
    
    // Parallax effect on scroll
    window.addEventListener('scroll', debounce(function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        particles.forEach((particle, index) => {
            const speed = 0.5 + (index * 0.1);
            particle.style.transform = `translateY(${rate * speed}px)`;
        });
    }, 16));
}

// CTA Button Enhancements
function initializeCTAEnhancements() {
    const ctaPrimary = document.querySelector('.cta-primary');
    const ctaSecondary = document.querySelector('.cta-secondary');
    
    if (ctaPrimary) {
        // Add ripple effect
        ctaPrimary.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
        
        // Add keyboard support
        ctaPrimary.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (ctaSecondary) {
        // Add ripple effect
        ctaSecondary.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
        
        // Add keyboard support
        ctaSecondary.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
}

// Ripple Effect for Buttons
function createRippleEffect(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation to CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Enhanced scroll tracking
function initializeScrollTracking() {
    let scrollDepth = 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    window.addEventListener('scroll', debounce(function() {
        const currentScroll = window.pageYOffset;
        scrollDepth = Math.max(scrollDepth, currentScroll);
        
        // Track scroll depth for analytics
        const scrollPercentage = Math.round((scrollDepth / maxScroll) * 100);
        
        // Update progress bar if exists
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = scrollPercentage + '%';
        }
        
        // Track engagement
        if (scrollPercentage > 50 && !window.scrollHalfTracked) {
            trackEvent('scroll_half_page');
            window.scrollHalfTracked = true;
        }
        
        if (scrollPercentage > 90 && !window.scrollFullTracked) {
            trackEvent('scroll_full_page');
            window.scrollFullTracked = true;
        }
    }, 100));
}

// Enhanced microinteractions
function initializeMicrointeractions() {
    // CTA button hover sheen effect
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Form field focus effects
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        field.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Progress bar tick marks
    const progressLine = document.querySelector('.progress-line');
    if (progressLine) {
        for (let i = 0; i <= 100; i += 25) {
            const tick = document.createElement('div');
            tick.className = 'progress-tick';
            tick.style.cssText = `
                position: absolute;
                left: ${i}%;
                top: -2px;
                width: 4px;
                height: 8px;
                background: var(--gold-700);
                border-radius: 2px;
            `;
            progressLine.appendChild(tick);
        }
    }
    
    // Initialize scroll tracking
    initializeScrollTracking();
}

// Value Proposition Animation
function animateValueProposition(section) {
    const trustItems = section.querySelectorAll('.trust-item');
    const growthCircles = section.querySelectorAll('.growth-circle');
    
    // Animate trust indicators
    trustItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            item.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 100);
        }, index * 150);
    });
    
    // Animate growth circles
    growthCircles.forEach((circle, index) => {
        setTimeout(() => {
            circle.style.opacity = '0';
            circle.style.transform = 'scale(0.5) rotate(180deg)';
            circle.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                circle.style.opacity = '1';
                circle.style.transform = circle.style.transform.includes('scale(1.1)') ? 'scale(1.1)' : 
                                       circle.style.transform.includes('scale(1.2)') ? 'scale(1.2)' : 'scale(1)';
            }, 200);
        }, 450 + (index * 300));
    });
}

// Form Field Enhancement
function enhanceFormFields() {
    // Add floating labels
    const formFields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        field.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if field has value on load
        if (field.value) {
            field.parentElement.classList.add('focused');
        }
        
        // Ensure dropdown text is visible
        if (field.tagName === 'SELECT') {
            field.addEventListener('change', function() {
                this.style.color = 'var(--text-primary)';
                this.style.backgroundColor = 'var(--bg-base)';
            });
            
            // Set initial color
            if (field.value) {
                field.style.color = 'var(--text-primary)';
            }
        }
    });
}

// Call form enhancement after DOM loads
document.addEventListener('DOMContentLoaded', enhanceFormFields);

// Form Functionality Test
function testFormFunctionality() {
    console.log('🧪 Testing Form Functionality...');
    
    // Test Step 1 Form
    const step1Form = document.getElementById('step1Form');
    if (step1Form) {
        console.log('✅ Step 1 Form found');
        
        // Test required fields
        const requiredFields = step1Form.querySelectorAll('[required]');
        console.log(`✅ Step 1 has ${requiredFields.length} required fields`);
        
        // Test form submission
        const submitButton = step1Form.querySelector('button[type="submit"]');
        if (submitButton) {
            console.log('✅ Step 1 submit button found');
        }
    } else {
        console.log('❌ Step 1 Form not found');
    }
    
    // Test Step 2 Form
    const step2Form = document.getElementById('step2Form');
    if (step2Form) {
        console.log('✅ Step 2 Form found');
        
        // Test required fields
        const requiredFields = step2Form.querySelectorAll('[required]');
        console.log(`✅ Step 2 has ${requiredFields.length} required fields`);
        
        // Test toggle functionality
        const toggleButtons = step2Form.querySelectorAll('.toggle-option');
        console.log(`✅ Found ${toggleButtons.length} toggle buttons`);
        
        // Test conditional fields
        const conditionalFields = step2Form.querySelectorAll('.conditional-field');
        console.log(`✅ Found ${conditionalFields.length} conditional fields`);
        
        // Test form submission
        const submitButton = step2Form.querySelector('button[type="submit"]');
        if (submitButton) {
            console.log('✅ Step 2 submit button found');
        }
    } else {
        console.log('❌ Step 2 Form not found');
    }
    
    // Test modal
    const modal = document.getElementById('successModal');
    if (modal) {
        console.log('✅ Success modal found');
    } else {
        console.log('❌ Success modal not found');
    }
    
    console.log('🧪 Form functionality test completed');
}

// Enhanced form initialization
function initializeForm() {
    console.log('🚀 Initializing form functionality...');
    
    // Test form functionality
    testFormFunctionality();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize conditional fields
    initializeConditionalFields();
    
    // Initialize autocomplete
    initializeAutocomplete();
    
    // Initialize auto-save
    initializeAutoSave();
    
    // Load saved data
    loadSavedFormData();
    
    console.log('✅ Form initialization completed');
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add Enhanced CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes notificationSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes notificationShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes fieldShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        75% { transform: translateX(3px); }
    }
    
    @keyframes formShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes stepComplete {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes stepTransition {
        0% { 
            opacity: 0;
            transform: translateY(20px);
        }
        100% { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes sectionEntrance {
        0% { 
            opacity: 0;
            transform: translateY(30px);
        }
        100% { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes badgeUnlock {
        0% { transform: scale(0.9); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes sparkleFloat {
        0% { 
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% { 
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% { 
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
    
    @keyframes modalEntrance {
        0% { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .error-notification button,
    .success-notification button {
        background: none;
        border: none;
        color: var(--bg-base);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    }
    
    .form-group.focused label {
        color: var(--gold-500);
        transform: translateY(-20px) scale(0.8);
    }
    
    .form-group.focused input,
    .form-group.focused select,
    .form-group.focused textarea {
        border-color: var(--gold-500);
        box-shadow: var(--focus-glow);
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: var(--error);
        animation: fieldShake 0.3s ease-in-out;
    }
    
    .form-group input.success,
    .form-group select.success,
    .form-group textarea.success {
        border-color: var(--success);
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
document.head.appendChild(style);

// Analytics tracking (placeholder)
function trackEvent(eventName, data = {}) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, data);
    
    // You can integrate with Google Analytics, Facebook Pixel, etc.
    // Example:
    // gtag('event', eventName, data);
    // fbq('track', eventName, data);
}

// Track form submissions
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            trackEvent('form_submit', {
                form_id: form.id,
                step: form.id === 'step1Form' ? 1 : 2
            });
        });
    });
    
    // Track CTA clicks
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('cta_click', {
                button_text: this.textContent.trim(),
                section: this.closest('section').id
            });
        });
    });
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const optimizedScrollHandler = debounce(function() {
    // Scroll-based animations and updates
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler); 

// Collapsible Sections
function toggleSection(sectionName) {
    const section = document.querySelector(`[data-section="${sectionName}"]`);
    const isExpanded = section.classList.contains('expanded');
    
    // Close all sections first
    document.querySelectorAll('.collapsible-section').forEach(s => {
        s.classList.remove('expanded');
    });
    
    // Open the clicked section if it wasn't expanded
    if (!isExpanded) {
        section.classList.add('expanded');
    }
}

// Auto-expand first section on load
document.addEventListener('DOMContentLoaded', function() {
    const firstSection = document.querySelector('.collapsible-section');
    if (firstSection) {
        firstSection.classList.add('expanded');
    }
});

// Inline Validation
function setupInlineValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', function() {
            validateFieldInline(this);
        });
        
        // Clear validation on input
        input.addEventListener('input', function() {
            clearInlineValidation(this);
        });
    });
}

function validateFieldInline(field) {
    const wrapper = field.closest('.input-wrapper');
    const message = wrapper.nextElementSibling;
    
    // Remove existing validation classes
    wrapper.classList.remove('validating', 'valid', 'invalid');
    if (message) message.classList.remove('show', 'valid', 'invalid');
    
    // Add validating class
    wrapper.classList.add('validating');
    
    // Simulate validation delay
    setTimeout(() => {
        const isValid = validateField(field);
        
        wrapper.classList.remove('validating');
        wrapper.classList.add(isValid ? 'valid' : 'invalid');
        
        if (message) {
            message.classList.add('show');
            message.classList.add(isValid ? 'valid' : 'invalid');
            message.textContent = isValid ? '✓ Valid' : getErrorMessage(field);
        }
    }, 300);
}

function clearInlineValidation(field) {
    const wrapper = field.closest('.input-wrapper');
    const message = wrapper.nextElementSibling;
    
    wrapper.classList.remove('validating', 'valid', 'invalid');
    if (message) message.classList.remove('show', 'valid', 'invalid');
}

function getErrorMessage(field) {
    const fieldName = field.name || field.id;
    const fieldType = field.type;
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        return `Please fill this field`;
    }
    
    switch (fieldType) {
        case 'email':
            return !isValidEmail(field.value) ? 'Please enter a valid email' : '';
        case 'tel':
            return !isValidPhone(field.value) ? 'Please enter a valid phone number' : '';
        default:
            return 'Please check this field';
    }
}

// Pre-fill Connection Logic
function setupConnectionPrefill() {
    const connectionToggle = document.getElementById('vijayRajaStudent');
    const prefillMessage = document.createElement('div');
    prefillMessage.className = 'connection-prefill';
    prefillMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <span>Based on your previous responses, we've pre-filled your connection details.</span>
        </div>
    `;
    
    // Check if user indicated being a VR student in previous interactions
    const wasVRStudent = localStorage.getItem('wasVRStudent') === 'true';
    
    if (wasVRStudent && connectionToggle) {
        const connectionSection = connectionToggle.closest('.form-group-section');
        connectionSection.insertBefore(prefillMessage, connectionSection.firstChild);
        prefillMessage.classList.add('show');
        
        // Pre-check "Yes"
        connectionToggle.checked = true;
        connectionToggle.dispatchEvent(new Event('change'));
    }
}

// Improved Challenge Input
function setupChallengeInput() {
    const challengeSelect = document.getElementById('challenge');
    const challengeContainer = challengeSelect.closest('.form-group');
    
    // Create new challenge input structure
    const challengeHTML = `
        <div class="challenge-input-group">
            <div class="challenge-options">
                <label class="challenge-option" data-value="growth">
                    <input type="radio" name="challenge" value="growth">
                    <span>Scaling Growth</span>
                </label>
                <label class="challenge-option" data-value="leadership">
                    <input type="radio" name="challenge" value="leadership">
                    <span>Leadership Development</span>
                </label>
                <label class="challenge-option" data-value="innovation">
                    <input type="radio" name="challenge" value="innovation">
                    <span>Innovation & Creativity</span>
                </label>
                <label class="challenge-option" data-value="strategy">
                    <input type="radio" name="challenge" value="strategy">
                    <span>Strategic Planning</span>
                </label>
                <label class="challenge-option" data-value="team">
                    <input type="radio" name="challenge" value="team">
                    <span>Team Building</span>
                </label>
                <label class="challenge-option" data-value="technology">
                    <input type="radio" name="challenge" value="technology">
                    <span>Technology Adoption</span>
                </label>
                <label class="challenge-option" data-value="market">
                    <input type="radio" name="challenge" value="market">
                    <span>Market Competition</span>
                </label>
                <label class="challenge-option" data-value="other">
                    <input type="radio" name="challenge" value="other">
                    <span>Other</span>
                </label>
            </div>
            <div class="form-group conditional-field" id="challengeOtherField" style="display: none;">
                <label for="challengeOther">Tell us more about your challenge</label>
                <div class="input-wrapper">
                    <textarea id="challengeOther" name="challengeOther" 
                              placeholder="Describe your biggest challenge in detail..."
                              rows="3"></textarea>
                </div>
            </div>
        </div>
    `;
    
    challengeContainer.innerHTML = challengeHTML;
    
    // Add event listeners for challenge options
    const challengeOptions = document.querySelectorAll('.challenge-option');
    challengeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            challengeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Handle "Other" option
            const challengeOtherField = document.getElementById('challengeOtherField');
            if (this.dataset.value === 'other') {
                challengeOtherField.style.display = 'block';
                document.getElementById('challengeOther').focus();
            } else {
                challengeOtherField.style.display = 'none';
            }
        });
    });
}

// Enhanced Success Modal with Sharing
function showSuccessModal(data) {
    const modal = document.getElementById('successModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Create sharing section
    const shareSection = `
        <div class="success-share">
            <h3 class="share-title">Share this exclusive opportunity!</h3>
            <p style="text-align: center; margin-bottom: 20px; color: var(--text-secondary);">
                Help others join the waitlist and get early access to VR What More.
            </p>
            <div class="share-buttons">
                <a href="#" class="share-button whatsapp" onclick="shareToWhatsApp()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                </a>
                <a href="#" class="share-button facebook" onclick="shareToFacebook()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                </a>
                <a href="#" class="share-button linkedin" onclick="shareToLinkedIn()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                </a>
                <a href="#" class="share-button instagram" onclick="shareToInstagram()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                </a>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = `
        <div class="success-animation">
            <div class="success-icon">✓</div>
            <div class="success-particles"></div>
        </div>
        <p>You're on the waitlist! We'll be in touch soon with your personal invitation.</p>
        ${shareSection}
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Sharing Functions
function shareToWhatsApp() {
    const text = "I just joined the exclusive VR What More waitlist! 🚀 Join me and get early access to this amazing opportunity. Check it out: " + window.location.href;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function shareToLinkedIn() {
    const text = "I just joined the exclusive VR What More waitlist! Join me and get early access to this amazing opportunity.";
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function shareToInstagram() {
    // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
    const text = "I just joined the exclusive VR What More waitlist! 🚀 Join me and get early access to this amazing opportunity. Check it out: " + window.location.href;
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard! You can now paste it in your Instagram story or post.');
    });
}

// Animated Storytelling for Journey Section
function setupJourneyAnimations() {
    const journeySection = document.querySelector('.journey-section');
    const steps = document.querySelectorAll('.journey-step');
    const connectors = document.querySelectorAll('.journey-connector');
    
    if (!journeySection) return;
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const journeyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateJourneySequence();
                journeyObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    journeyObserver.observe(journeySection);
}

function animateJourneySequence() {
    const steps = document.querySelectorAll('.journey-step');
    const connectors = document.querySelectorAll('.journey-connector');
    
    // Step 1: Fade in
    setTimeout(() => {
        steps[0].classList.add('animate-in');
    }, 300);
    
    // Connector 1: Extend line
    setTimeout(() => {
        connectors[0].classList.add('animate-in');
    }, 800);
    
    // Step 2: Light up
    setTimeout(() => {
        steps[1].classList.add('animate-in');
    }, 1300);
    
    // Connector 2: Extend line
    setTimeout(() => {
        connectors[1].classList.add('animate-in');
    }, 1800);
    
    // Step 3: Grow into focus
    setTimeout(() => {
        steps[2].classList.add('animate-in');
    }, 2300);
    
    // Add focus animation to step 3
    setTimeout(() => {
        steps[2].classList.add('animate-focus');
    }, 2800);
}

// Enhanced scroll animations with intersection observer
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.journey-step, .journey-connector');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize journey animations
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    setupJourneyAnimations();
    setupScrollAnimations();
});

// Initialize all new functionality
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    setupInlineValidation();
    setupConnectionPrefill();
    setupChallengeInput();
    
    // Save VR student status when form is submitted
    const form = document.getElementById('step1Form');
    form.addEventListener('submit', function(e) {
        const isVRStudent = document.getElementById('vijayRajaStudent').checked;
        localStorage.setItem('wasVRStudent', isVRStudent);
    });
});

// Modern UX Patterns - 2024-2025 Trends

// Smart Defaults and Auto-fill Enhancement
function setupSmartDefaults() {
    // Auto-detect and suggest based on user's previous interactions
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    // Smart phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `+91 ${value}`;
                } else if (value.length <= 7) {
                    value = `+91 ${value.slice(0, 3)} ${value.slice(3)}`;
                } else {
                    value = `+91 ${value.slice(0, 3)} ${value.slice(3, 7)} ${value.slice(7, 11)}`;
                }
            }
            e.target.value = value;
        });
    }
    
    // Smart email suggestions
    const emailInput = document.getElementById('email');
    if (emailInput) {
        const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        let suggestionsList = document.createElement('datalist');
        suggestionsList.id = 'emailSuggestions';
        commonDomains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            suggestionsList.appendChild(option);
        });
        emailInput.parentNode.appendChild(suggestionsList);
        emailInput.setAttribute('list', 'emailSuggestions');
    }
    
    // Pre-fill based on previous data
    if (userPreferences.email) {
        emailInput.value = userPreferences.email;
    }
    if (userPreferences.phone) {
        phoneInput.value = userPreferences.phone;
    }
}

// Enhanced Inline Validation with Real-time Feedback
function setupEnhancedValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Real-time validation with debouncing
        let validationTimeout;
        input.addEventListener('input', function() {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                validateFieldRealTime(this);
            }, 300);
        });
        
        // Focus enhancement
        input.addEventListener('focus', function() {
            enhanceFocusState(this);
        });
        
        // Blur validation
        input.addEventListener('blur', function() {
            validateFieldOnBlur(this);
        });
    });
}

function validateFieldRealTime(field) {
    const wrapper = field.closest('.input-wrapper');
    const message = wrapper.nextElementSibling;
    
    // Remove existing states
    wrapper.classList.remove('valid', 'invalid', 'loading');
    if (message) message.classList.remove('show');
    
    // Add loading state
    wrapper.classList.add('loading');
    
    // Simulate validation delay for better UX
    setTimeout(() => {
        wrapper.classList.remove('loading');
        
        const isValid = validateField(field);
        const fieldType = field.type;
        const fieldValue = field.value.trim();
        
        if (fieldValue === '') {
            wrapper.classList.remove('valid', 'invalid');
            return;
        }
        
        wrapper.classList.add(isValid ? 'valid' : 'invalid');
        
        if (message) {
            message.classList.add('show');
            message.classList.add(isValid ? 'valid' : 'invalid');
            
            if (isValid) {
                message.textContent = getSuccessMessage(fieldType);
            } else {
                message.textContent = getErrorMessage(fieldType, fieldValue);
            }
        }
        
        // Add success animation
        if (isValid) {
            addSuccessAnimation(wrapper);
        }
    }, 500);
}

function getSuccessMessage(fieldType) {
    const messages = {
        'email': '✓ Valid email address',
        'tel': '✓ Valid phone number',
        'text': '✓ Looks good',
        'select-one': '✓ Selection made'
    };
    return messages[fieldType] || '✓ Valid';
}

function getErrorMessage(fieldType, value) {
    const messages = {
        'email': 'Please enter a valid email address',
        'tel': 'Please enter a valid phone number',
        'text': 'This field is required',
        'select-one': 'Please make a selection'
    };
    return messages[fieldType] || 'Please check this field';
}

function enhanceFocusState(field) {
    const wrapper = field.closest('.input-wrapper');
    
    // Add focus animation
    wrapper.style.transform = 'translateY(-2px)';
    
    // Add ripple effect
    addRippleEffect(wrapper);
}

function addRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(212, 175, 55, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function addSuccessAnimation(element) {
    element.style.animation = 'successPulse 0.6s ease-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// Micro-interactions and Haptic Feedback
function setupMicroInteractions() {
    // Button click feedback
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Checkbox and radio interactions
    const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.closest('label');
            if (this.checked) {
                label.style.animation = 'selectionPulse 0.4s ease-out';
                setTimeout(() => {
                    label.style.animation = '';
                }, 400);
            }
        });
    });
}

// Progressive Enhancement and Smart Form Flow
function setupProgressiveEnhancement() {
    // Auto-save form data
    const form = document.getElementById('step1Form');
    if (form) {
        const formData = new FormData(form);
        
        // Save on every input change
        form.addEventListener('input', debounce(function() {
            const currentData = new FormData(form);
            const dataObject = Object.fromEntries(currentData);
            localStorage.setItem('formAutoSave', JSON.stringify(dataObject));
        }, 1000));
        
        // Restore saved data
        const savedData = JSON.parse(localStorage.getItem('formAutoSave') || '{}');
        Object.keys(savedData).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && savedData[key]) {
                field.value = savedData[key];
            }
        });
    }
    
    // Smart field dependencies
    setupFieldDependencies();
}

function setupFieldDependencies() {
    // Show/hide fields based on selections
    const workAreaSelect = document.getElementById('workArea');
    const workAreaOtherField = document.getElementById('workAreaOtherField');
    
    if (workAreaSelect && workAreaOtherField) {
        workAreaSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                workAreaOtherField.style.display = 'block';
                workAreaOtherField.style.animation = 'slideDown 0.3s ease-out';
            } else {
                workAreaOtherField.style.display = 'none';
            }
        });
    }
    
    // Similar logic for challenge field
    const challengeSelect = document.getElementById('challenge');
    const challengeOtherField = document.getElementById('challengeOtherField');
    
    if (challengeSelect && challengeOtherField) {
        challengeSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                challengeOtherField.style.display = 'block';
                challengeOtherField.style.animation = 'slideDown 0.3s ease-out';
            } else {
                challengeOtherField.style.display = 'none';
            }
        });
    }
}

// Enhanced Progress Tracking
function setupEnhancedProgress() {
    const progressFill = document.getElementById('progressFill');
    const form = document.getElementById('step1Form');
    
    if (progressFill && form) {
        const requiredFields = form.querySelectorAll('[required]');
        const totalFields = requiredFields.length;
        
        function updateProgress() {
            const filledFields = Array.from(requiredFields).filter(field => {
                return field.value.trim() !== '' && field.checkValidity();
            }).length;
            
            const progress = (filledFields / totalFields) * 100;
            progressFill.style.width = `${progress}%`;
            
            // Add progress animation
            progressFill.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        // Update progress on any input
        form.addEventListener('input', debounce(updateProgress, 300));
        
        // Initial progress
        updateProgress();
    }
}

// Accessibility Enhancements
function setupAccessibilityEnhancements() {
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#step1';
    skipLink.textContent = 'Skip to form';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--gold-500);
        color: var(--bg-base);
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Enhanced focus management
    const focusableElements = document.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--gold-500)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
}

// Performance Optimizations
function setupPerformanceOptimizations() {
    // Lazy load non-critical elements
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe form sections for lazy loading
    const formSections = document.querySelectorAll('.form-group-section');
    formSections.forEach(section => {
        observer.observe(section);
    });
}

// Initialize all modern UX patterns
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    setupSmartDefaults();
    setupEnhancedValidation();
    setupMicroInteractions();
    setupProgressiveEnhancement();
    setupEnhancedProgress();
    setupAccessibilityEnhancements();
    setupPerformanceOptimizations();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        @keyframes selectionPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .skip-link:focus {
            top: 6px !important;
        }
    `;
    document.head.appendChild(style);
    
    // Setup dynamic text
    setupDynamicText();
});



// Setup dynamic text cycling
function setupDynamicText() {
    const dynamicText = document.querySelector('.dynamic-text');
    if (dynamicText) {
        const texts = dynamicText.getAttribute('data-texts').split(',');
        let currentIndex = 0;
        
        setInterval(() => {
            dynamicText.style.opacity = '0';
            dynamicText.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % texts.length;
                dynamicText.textContent = texts[currentIndex];
                dynamicText.style.opacity = '1';
                dynamicText.style.transform = 'translateY(0)';
            }, 200);
        }, 2000);
    }
}