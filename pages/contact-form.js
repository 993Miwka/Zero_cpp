/**
 * Contact Form Validation and Submission
 * Client-side form handling with validation
 */

class ContactForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.formSuccess = document.querySelector('.form-success');
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.resetBtn = this.form.querySelector('button[type="reset"]');
        
        this.fields = {
            name: this.form.querySelector('#name'),
            email: this.form.querySelector('#email'),
            phone: this.form.querySelector('#phone'),
            company: this.form.querySelector('#company'),
            subject: this.form.querySelector('#subject'),
            message: this.form.querySelector('#message'),
            newsletter: this.form.querySelector('#newsletter')
        };
        
        this.validators = {
            name: (value) => value.trim().length >= 2,
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            subject: (value) => value !== '',
            message: (value) => value.trim().length >= 10
        };
        
        this.errorMessages = {
            name: 'Please enter your name (minimum 2 characters)',
            email: 'Please enter a valid email address',
            subject: 'Please select a subject',
            message: 'Please enter a message (minimum 10 characters)'
        };
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.setupValidation();
        this.setupSubmit();
        this.setupReset();
        this.setupRealTimeValidation();
    }
    
    setupValidation() {
        // Add required field indicators
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field && field.required) {
                const label = this.form.querySelector(`label[for="${key}"]`);
                if (label) {
                    label.innerHTML += ' <span class="required-indicator">*</span>';
                }
            }
        });
    }
    
    setupSubmit() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    setupReset() {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetForm());
        }
    }
    
    setupRealTimeValidation() {
        // Validate on blur
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field && this.validators[key]) {
                field.addEventListener('blur', () => this.validateField(key));
            }
        });
        
        // Validate on input for better UX
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field && this.validators[key]) {
                field.addEventListener('input', () => {
                    if (field.classList.contains('error')) {
                        this.validateField(key);
                    }
                });
            }
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        Object.keys(this.validators).forEach(key => {
            if (!this.validateField(key)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Scroll to first error
            const firstError = this.form.querySelector('.form-group.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        // Prepare form data
        const formData = this.getFormData();
        
        // Submit form
        this.submitForm(formData);
    }
    
    validateField(key) {
        const field = this.fields[key];
        const value = field.value;
        const isValid = this.validators[key](value);
        const formGroup = field.closest('.form-group');
        
        if (isValid) {
            field.classList.remove('error');
            if (formGroup) {
                formGroup.classList.remove('has-error');
            }
            return true;
        } else {
            field.classList.add('error');
            if (formGroup) {
                formGroup.classList.add('has-error');
            }
            return false;
        }
    }
    
    getFormData() {
        return {
            name: this.fields.name.value.trim(),
            email: this.fields.email.value.trim(),
            phone: this.fields.phone.value.trim(),
            company: this.fields.company.value.trim(),
            subject: this.fields.subject.value,
            message: this.fields.message.value.trim(),
            newsletter: this.fields.newsletter.checked,
            timestamp: new Date().toISOString()
        };
    }
    
    async submitForm(formData) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Store form data for offline sync (if service worker is available)
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const swRegistration = await navigator.serviceWorker.ready;
                await swRegistration.sync.register('sync-form-data');
            }
            
            // Show success message
            this.showSuccess();
            
            // Log to analytics (if available)
            if (window.gtag) {
                window.gtag('event', 'form_submission', {
                    form_id: 'contact_form',
                    ...formData
                });
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Something went wrong. Please try again.');
            this.setLoadingState(false);
        }
    }
    
    showSuccess() {
        // Hide form
        this.form.style.display = 'none';
        
        // Show success message
        if (this.formSuccess) {
            this.formSuccess.classList.add('active');
            this.formSuccess.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset form
        this.resetForm();
        
        // Show toast notification
        if (window.MobileWeb && window.MobileWeb.Toast) {
            window.MobileWeb.Toast.success('Message sent successfully!');
        }
    }
    
    showError(message) {
        if (window.MobileWeb && window.MobileWeb.Toast) {
            window.MobileWeb.Toast.error(message);
        } else {
            alert(message);
        }
    }
    
    setLoadingState(isLoading) {
        if (this.submitBtn) {
            this.submitBtn.disabled = isLoading;
            this.submitBtn.classList.toggle('loading', isLoading);
            
            if (isLoading) {
                this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else {
                this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        }
    }
    
    resetForm() {
        this.form.reset();
        
        // Remove error states
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field) {
                field.classList.remove('error');
                const formGroup = field.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('has-error');
                }
            }
        });
        
        // Reset loading state
        this.setLoadingState(false);
    }
}

// ============================================
// FAQ Accordion
// ============================================

class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }
    
    init() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.addEventListener('click', () => this.toggleItem(item, question, answer));
            }
        });
    }
    
    toggleItem(item, question, answer) {
        const isActive = question.classList.contains('active');
        
        // Close all other items
        this.faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                const otherQuestion = otherItem.querySelector('.faq-question');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                
                if (otherQuestion && otherAnswer) {
                    otherQuestion.classList.remove('active');
                    otherAnswer.classList.remove('active');
                }
            }
        });
        
        // Toggle current item
        if (isActive) {
            question.classList.remove('active');
            answer.classList.remove('active');
        } else {
            question.classList.add('active');
            answer.classList.add('active');
        }
    }
}

// ============================================
// Initialize
// ============================================

let contactForm;
let faqAccordion;

const initContactPage = () => {
    // Initialize contact form
    contactForm = new ContactForm('contactForm');
    
    // Initialize FAQ accordion
    faqAccordion = new FAQAccordion();
    
    // Log initialization
    console.log('%c Contact Page Initialized ', 'background: #03dac6; color: white; font-size: 16px; padding: 5px;');
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
} else {
    initContactPage();
}

// Export for other modules
window.ContactForm = ContactForm;
window.FAQAccordion = FAQAccordion;
