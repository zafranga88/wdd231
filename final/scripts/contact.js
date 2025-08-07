// contact.js - Main script for Patagonia Trail Explorers contact page

// State management for contact page
const ContactState = {
    formData: {},
    faqItems: [],
    emergencyContacts: [],
    userPreferences: {
        theme: 'light',
        language: 'en',
        notifications: true
    }
};

// Utility functions
const ContactUtils = {
    // Local storage utilities (memory-based for Claude artifacts)
    saveToStorage: (key, data) => {
        try {
            // In a real environment, this would use localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(key, JSON.stringify(data));
            } else {
                // Store in memory for Claude artifacts
                window.memoryStorage = window.memoryStorage || {};
                window.memoryStorage[key] = JSON.stringify(data);
            }
        } catch (error) {
            console.error('Storage not available:', error);
        }
    },

    loadFromStorage: (key, defaultValue = null) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : defaultValue;
            } else {
                // Use memory storage for Claude artifacts
                window.memoryStorage = window.memoryStorage || {};
                const stored = window.memoryStorage[key];
                return stored ? JSON.parse(stored) : defaultValue;
            }
        } catch (error) {
            console.error('Storage not available:', error);
            return defaultValue;
        }
    },

    // Form validation utilities
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePhone: (phone) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    // Show notification
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
    }
};

// Data management for contact page
const ContactDataManager = {
    // Initialize all data
    async initialize() {
        try {
            // Load user preferences from storage
            const savedPreferences = ContactUtils.loadFromStorage('patagonia-preferences');
            if (savedPreferences) {
                ContactState.userPreferences = { ...ContactState.userPreferences, ...savedPreferences };
            }
            
            // Load saved form data
            const savedFormData = ContactUtils.loadFromStorage('patagonia-form-draft');
            if (savedFormData) {
                ContactState.formData = savedFormData;
            }
            
            console.log('Contact data initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize contact data:', error);
            return false;
        }
    }
};

// UI management for contact page
const ContactUI = {
    // Handle FAQ toggle functionality
    initializeFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const answer = faqItem.querySelector('.faq-answer');
                const toggle = question.querySelector('.faq-toggle');
                
                // Close all other FAQ items
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question) {
                        const otherItem = otherQuestion.parentElement;
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherToggle = otherQuestion.querySelector('.faq-toggle');
                        
                        otherItem.classList.remove('active');
                        otherAnswer.style.maxHeight = null;
                        otherToggle.textContent = '+';
                    }
                });
                
                // Toggle current FAQ item
                if (faqItem.classList.contains('active')) {
                    faqItem.classList.remove('active');
                    answer.style.maxHeight = null;
                    toggle.textContent = '+';
                } else {
                    faqItem.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    toggle.textContent = '−';
                }
            });
        });
    },

    // Form handling with validation
    initializeForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        // Load saved form data if exists
        if (ContactState.formData && Object.keys(ContactState.formData).length > 0) {
            this.populateForm(ContactState.formData);
        }
        
        // Save form data on input changes
        const formInputs = form.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveFormData();
            });
        });
        
        // Form submission handling
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                return false;
            }
            
            // Clear saved form data on successful submission
            ContactUtils.saveToStorage('patagonia-form-draft', {});
            ContactUtils.showNotification('Message sent successfully!', 'success');
        });
    },

    // Populate form with saved data
    populateForm(data) {
        Object.keys(data).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key] === 'yes';
                } else {
                    element.value = data[key];
                }
            }
        });
    },

    // Save current form data
    saveFormData() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        ContactState.formData = data;
        ContactUtils.saveToStorage('patagonia-form-draft', data);
    },

    // Form validation
    validateForm(form) {
        let isValid = true;
        
        // Required fields validation
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Email validation
        const emailField = form.querySelector('[type="email"]');
        if (emailField && emailField.value) {
            if (!ContactUtils.validateEmail(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Phone validation
        const phoneField = form.querySelector('[type="tel"]');
        if (phoneField && phoneField.value) {
            if (!ContactUtils.validatePhone(phoneField.value)) {
                this.showFieldError(phoneField, 'Please enter a valid phone number');
                isValid = false;
            }
        }
        
        return isValid;
    },

    // Show field error
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.classList.add('error');
        field.parentNode.appendChild(errorElement);
    },

    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
};

// Event handlers for contact page
const ContactEventHandlers = {
    // Handle user preferences
    updateUserPreferences(key, value) {
        ContactState.userPreferences[key] = value;
        ContactUtils.saveToStorage('patagonia-preferences', ContactState.userPreferences);
        ContactUtils.showNotification('Preferences updated!', 'success');
    },
    handleScrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Navigation handler (reused from index.js)
const ContactNavigation = {
    init() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }
};

// Main contact application
const ContactApp = {
    async init() {
        try {
            console.log('Initializing Contact App...');
            
            // Initialize navigation
            ContactNavigation.init();
            
            // Load all data
            const success = await ContactDataManager.initialize();
            if (!success) {
                console.error('Failed to initialize data');
                return;
            }
            
            // Initialize UI components
            ContactUI.initializeFAQ();
            ContactUI.initializeForm();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update footer
            this.updateFooter();
            
            console.log('Contact page initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize contact page:', error);
            ContactUtils.showNotification('Failed to load page data. Please refresh.', 'error');
        }
    },

    setupEventListeners() {
        // Keyboard navigation for FAQ
        document.addEventListener('keydown', (e) => {
            // Navigate FAQ with arrow keys when focused
            if (e.target.classList.contains('faq-question')) {
                const faqQuestions = Array.from(document.querySelectorAll('.faq-question'));
                const currentIndex = faqQuestions.indexOf(e.target);
                
                if (e.key === 'ArrowDown' && currentIndex < faqQuestions.length - 1) {
                    e.preventDefault();
                    faqQuestions[currentIndex + 1].focus();
                } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                    e.preventDefault();
                    faqQuestions[currentIndex - 1].focus();
                }
            }
        });
        
        // Form auto-save (demonstrate DOM manipulation)
        const form = document.getElementById('contactForm');
        if (form) {
            // Auto-save every 30 seconds
            setInterval(() => {
                ContactUI.saveFormData();
            }, 30000);
        }
    },

    updateFooter() {
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
        
        const lastModifiedElement = document.getElementById('lastModified');
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
        }
    }
};

// ES Module exports for modular code organization
export {
    ContactApp,
    ContactDataManager,
    ContactEventHandlers,
    ContactUI,
    ContactUtils,
    ContactState
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ContactApp.init();
});

// Additional utility functions for enhanced functionality
const ContactExtensions = {
    // Advanced form handling with custom validation rules
    setupAdvancedValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        // Custom validation rules
        const validationRules = {
            firstName: {
                minLength: 2,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'First name must contain only letters and be at least 2 characters'
            },
            lastName: {
                minLength: 2,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Last name must contain only letters and be at least 2 characters'
            },
            phone: {
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
            },
            message: {
                minLength: 10,
                maxLength: 1000,
                message: 'Message must be between 10 and 1000 characters'
            }
        };
        
        // Apply validation to form fields
        Object.keys(validationRules).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(field, validationRules[fieldName]);
                });
                
                field.addEventListener('input', () => {
                    // Clear error on input
                    ContactUI.clearFieldError(field);
                });
            }
        });
    },
    
    validateField(field, rules) {
        const value = field.value.trim();
        
        if (rules.minLength && value.length < rules.minLength) {
            ContactUI.showFieldError(field, rules.message);
            return false;
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            ContactUI.showFieldError(field, rules.message);
            return false;
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            ContactUI.showFieldError(field, rules.message);
            return false;
        }
        
        ContactUI.clearFieldError(field);
        return true;
    },
    
    // Accessibility enhancements
    setupAccessibilityFeatures() {
        // Add ARIA labels and roles
        this.enhanceARIA();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Focus management
        this.setupFocusManagement();
    },
    
    enhanceARIA() {
        // Add role to FAQ items
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.setAttribute('role', 'region');
        });
        
        // Add ARIA labels to form fields
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            if (field.hasAttribute('required')) {
                field.setAttribute('aria-required', 'true');
            }
        });
    },
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Enhanced FAQ navigation with Home/End keys
            if (e.target.classList.contains('faq-question')) {
                const faqItems = Array.from(document.querySelectorAll('.faq-question'));
                const currentIndex = faqItems.indexOf(e.target);
                
                if (e.key === 'Home') {
                    e.preventDefault();
                    faqItems[0].focus();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    faqItems[faqItems.length - 1].focus();
                }
            }
        });
    },
    
    setupFocusManagement() {
        // Ensure proper focus indication
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });
    },
    
    // Enhanced form functionality
    setupFormEnhancements() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        // Character counter for message field
        const messageField = form.querySelector('#message');
        if (messageField) {
            this.addCharacterCounter(messageField, 1000);
        }
        
        // Form progress indicator
        this.addFormProgress(form);
    },
    
    addCharacterCounter(field, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.textContent = `0 / ${maxLength}`;
        
        field.parentNode.appendChild(counter);
        
        field.addEventListener('input', () => {
            const length = field.value.length;
            counter.textContent = `${length} / ${maxLength}`;
            
            if (length > maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        });
    },
    
    addFormProgress(form) {
        const requiredFields = form.querySelectorAll('[required]');
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        progressBar.innerHTML = '<div class="progress-bar"></div>';
        
        form.insertBefore(progressBar, form.firstChild);
        
        const updateProgress = () => {
            const filledFields = Array.from(requiredFields).filter(field => field.value.trim());
            const progress = (filledFields.length / requiredFields.length) * 100;
            
            const bar = progressBar.querySelector('.progress-bar');
            bar.style.width = `${progress}%`;
        };
        
        requiredFields.forEach(field => {
            field.addEventListener('input', updateProgress);
        });
        
        updateProgress();
    }

};

// Initialize extensions when the main app is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to initialize first
    setTimeout(() => {
        ContactExtensions.setupAdvancedValidation();
        ContactExtensions.setupAccessibilityFeatures();
        ContactExtensions.setupFormEnhancements();
    }, 1000);
});

// Error handling for the entire contact page
window.addEventListener('error', (e) => {
    console.error('Contact page error:', e.error);
    ContactUtils.showNotification('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    ContactUtils.showNotification('A network error occurred. Please check your connection.', 'error');
});
