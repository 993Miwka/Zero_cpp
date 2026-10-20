/**
 * MobileWeb - Testimonials Slider
 * Touch-enabled, responsive slider component
 */

class Slider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            slidesToShow: options.slidesToShow || 1,
            slidesToScroll: options.slidesToScroll || 1,
            loop: options.loop || true,
            autoplay: options.autoplay || false,
            autoplaySpeed: options.autoplaySpeed || 5000,
            dots: options.dots || true,
            arrows: options.arrows || true,
            swipe: options.swipe || true,
            ...options
        };
        
        this.slides = [];
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.autoplayInterval = null;
        this.touchStartTime = 0;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error(`Slider container with ID "${this.containerId}" not found`);
            return;
        }
        
        this.setupSlides();
        this.setupControls();
        this.setupDots();
        this.setupEventListeners();
        
        if (this.options.autoplay) {
            this.startAutoplay();
        }
        
        // Initialize first slide
        this.updateSlider();
    }
    
    setupSlides() {
        this.slides = Array.from(this.container.querySelectorAll('.testimonial-card, .slide'));
        
        if (this.slides.length === 0) {
            console.warn('No slides found in slider');
            return;
        }
        
        // Set initial styles
        this.slides.forEach((slide, index) => {
            slide.style.flex = `0 0 ${100 / this.options.slidesToShow}%`;
            slide.style.transition = 'transform 0.3s ease';
            slide.dataset.index = index;
        });
    }
    
    setupControls() {
        this.prevBtn = document.getElementById('prevTestimonial') || 
                      this.container.querySelector('.slider-btn.prev');
        this.nextBtn = document.getElementById('nextTestimonial') || 
                      this.container.querySelector('.slider-btn.next');
        
        if (this.prevBtn && this.options.arrows) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn && this.options.arrows) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }
    
    setupDots() {
        this.dotsContainer = document.getElementById('sliderDots') || 
                            this.container.querySelector('.slider-dots');
        
        if (this.dotsContainer && this.options.dots) {
            this.dotsContainer.innerHTML = '';
            
            this.slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'dot' + (index === 0 ? ' active' : '');
                dot.addEventListener('click', () => this.goTo(index));
                this.dotsContainer.appendChild(dot);
            });
            
            this.dots = Array.from(this.dotsContainer.querySelectorAll('.dot'));
        }
    }
    
    setupEventListeners() {
        if (this.options.swipe && 'ontouchstart' in window) {
            this.setupTouchEvents();
        }
        
        // Pause autoplay on hover
        if (this.options.autoplay) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupTouchEvents() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
            this.startX = e.touches[0].clientX;
            this.currentX = this.startX;
            this.isDragging = true;
            
            // Pause autoplay during touch
            this.pauseAutoplay();
        }, { passive: false });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            
            this.currentX = e.touches[0].clientX;
            const diff = this.currentX - this.startX;
            
            // Move slides
            this.slides.forEach((slide, index) => {
                const offset = this.getSlideOffset(index);
                const position = offset + diff;
                slide.style.transform = `translateX(${position}px)`;
            });
        }, { passive: false });
        
        this.container.addEventListener('touchend', (e) => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            
            const diff = this.currentX - this.startX;
            const touchDuration = Date.now() - this.touchStartTime;
            
            // Check if it's a swipe (fast movement)
            const isSwipe = touchDuration < 300 && Math.abs(diff) > 50;
            
            if (isSwipe) {
                if (diff < -50) {
                    this.next();
                } else if (diff > 50) {
                    this.prev();
                }
            } else {
                // Return to current position
                this.updateSlider();
            }
            
            // Resume autoplay
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        }, { passive: false });
        
        // Prevent default touch behavior
        this.container.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    getSlideOffset(index) {
        const slideWidth = this.container.offsetWidth / this.options.slidesToShow;
        const offset = (index - this.currentIndex) * slideWidth;
        return offset;
    }
    
    goTo(index) {
        if (index < 0 || index >= this.slides.length) {
            if (!this.options.loop) return;
            
            if (index < 0) {
                index = this.slides.length - 1;
            } else if (index >= this.slides.length) {
                index = 0;
            }
        }
        
        this.currentIndex = index;
        this.updateSlider();
    }
    
    next() {
        this.goTo(this.currentIndex + this.options.slidesToScroll);
    }
    
    prev() {
        this.goTo(this.currentIndex - this.options.slidesToScroll);
    }
    
    updateSlider() {
        const slideWidth = this.container.offsetWidth / this.options.slidesToShow;
        
        this.slides.forEach((slide, index) => {
            const offset = (index - this.currentIndex) * slideWidth;
            slide.style.transform = `translateX(${offset}px)`;
        });
        
        // Update dots
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }
    }
    
    startAutoplay() {
        if (this.autoplayInterval) return;
        
        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.options.autoplaySpeed);
    }
    
    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    handleResize() {
        // Update slider on resize
        this.updateSlider();
    }
    
    destroy() {
        this.pauseAutoplay();
        
        if (this.prevBtn) {
            this.prevBtn.removeEventListener('click', this.prev);
        }
        
        if (this.nextBtn) {
            this.nextBtn.removeEventListener('click', this.next);
        }
        
        window.removeEventListener('resize', this.handleResize);
    }
}

// ============================================
// Initialize Testimonials Slider
// ============================================

let testimonialsSlider;

const initTestimonialsSlider = () => {
    const container = document.getElementById('testimonialsSlider');
    
    if (container) {
        // Check if we're on mobile
        const isMobile = window.innerWidth < 768;
        
        testimonialsSlider = new Slider('testimonialsSlider', {
            slidesToShow: isMobile ? 1 : 3,
            slidesToScroll: 1,
            loop: true,
            autoplay: true,
            autoplaySpeed: 6000,
            dots: true,
            arrows: true,
            swipe: true
        });
        
        // Update on resize
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth < 768;
            const slidesToShow = newIsMobile ? 1 : 3;
            
            if (testimonialsSlider.options.slidesToShow !== slidesToShow) {
                testimonialsSlider.options.slidesToShow = slidesToShow;
                testimonialsSlider.slides.forEach(slide => {
                    slide.style.flex = `0 0 ${100 / slidesToShow}%`;
                });
                testimonialsSlider.updateSlider();
            }
        });
    }
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsSlider);
} else {
    initTestimonialsSlider();
}

// Export for other modules
window.MobileWebSlider = Slider;
