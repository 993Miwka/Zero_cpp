/**
 * MobileWeb - Scroll & Intersection Animations
 * Performance-optimized animations using Intersection Observer API
 */

// ============================================
// Animation Controller
// ============================================

class AnimationController {
    constructor() {
        this.observers = [];
        this.animatedElements = new Set();
        this.init();
    }
    
    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupStaggeredAnimations();
        this.setupHoverAnimations();
    }
    
    // ============================================
    // Scroll Animations
    // ============================================
    
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .scroll-animate-fade'
        );
        
        if (animatedElements.length === 0) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        this.animatedElements.add(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        animatedElements.forEach(el => observer.observe(el));
        this.observers.push(observer);
    }
    
    // ============================================
    // Parallax Effects
    // ============================================
    
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax, [data-parallax]');
        
        if (parallaxElements.length === 0) return;
        
        const handleScroll = () => {
            const scrollPosition = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallaxSpeed) || 0.5;
                const offset = scrollPosition * speed;
                
                el.style.transform = `translateY(${offset}px)`;
            });
        };
        
        // Use requestAnimationFrame for smooth animations
        let ticking = false;
        const requestTick = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
        window.addEventListener('resize', requestTick);
    }
    
    // ============================================
    // Staggered Animations
    // ============================================
    
    setupStaggeredAnimations() {
        const staggerGroups = document.querySelectorAll('[data-stagger-group]');
        
        if (staggerGroups.length === 0) return;
        
        staggerGroups.forEach(group => {
            const children = Array.from(group.children);
            const delayIncrement = parseInt(group.dataset.staggerDelay) || 100;
            
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            children.forEach((child, index) => {
                                const delay = index * delayIncrement;
                                child.style.animationDelay = `${delay}ms`;
                                child.classList.add('animate-stagger');
                            });
                        }
                    });
                },
                { threshold: 0.1 }
            );
            
            observer.observe(group);
            this.observers.push(observer);
        });
    }
    
    // ============================================
    // Hover Animations
    // ============================================
    
    setupHoverAnimations() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.feature-card, .testimonial-card, .blog-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hover-active');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hover-active');
            });
        });
    }
    
    // ============================================
    // GSAP-like Animations (Vanilla JS)
    // ============================================
    
    animate(element, properties, options = {}) {
        const {
            duration = 300,
            easing = 'ease',
            delay = 0,
            onComplete = null
        } = options;
        
        const startTime = performance.now();
        const startValues = {};
        const endValues = {};
        
        // Get initial values
        Object.keys(properties).forEach(key => {
            startValues[key] = parseFloat(getComputedStyle(element)[key]) || 0;
            endValues[key] = properties[key];
        });
        
        const animateFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Apply easing
            const easedProgress = this.applyEasing(progress, easing);
            
            // Update properties
            Object.keys(properties).forEach(key => {
                const value = startValues[key] + (endValues[key] - startValues[key]) * easedProgress;
                element.style[key] = typeof properties[key] === 'number' 
                    ? `${value}px` 
                    : value;
            });
            
            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        setTimeout(() => {
            requestAnimationFrame(animateFrame);
        }, delay);
    }
    
    applyEasing(progress, easing) {
        const easings = {
            linear: (p) => p,
            ease: (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
            easeIn: (p) => p * p,
            easeOut: (p) => p * (2 - p),
            easeInOut: (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
            bounce: (p) => {
                for (let a = 0, b = 1; 1; a += b, b /= 2) {
                    if (p >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * p) / 4, 2) + Math.pow(b, 2);
                    }
                }
            },
            elastic: (p) => {
                const c5 = (2 * Math.PI) / 4.5;
                return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c5) + 1;
            }
        };
        
        return (easings[easing] || easings.ease)(progress);
    }
    
    // ============================================
    // Sequence Animations
    // ============================================
    
    sequence(animations, options = {}) {
        const {
            delayBetween = 0,
            onComplete = null
        } = options;
        
        let completed = 0;
        
        animations.forEach((animation, index) => {
            const startDelay = index * delayBetween;
            
            setTimeout(() => {
                this.animate(
                    animation.element,
                    animation.properties,
                    {
                        ...animation.options,
                        onComplete: () => {
                            completed++;
                            if (completed === animations.length && onComplete) {
                                onComplete();
                            }
                        }
                    }
                );
            }, startDelay);
        });
    }
    
    // ============================================
    // Cleanup
    // ============================================
    
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.animatedElements.clear();
    }
}

// ============================================
// Hero Animations
// ============================================

class HeroAnimations {
    constructor() {
        this.heroSection = document.querySelector('.hero');
        this.heroElements = {
            tagline: document.querySelector('.hero .tagline'),
            title: document.querySelector('.hero .hero-title'),
            description: document.querySelector('.hero .hero-description'),
            buttons: document.querySelectorAll('.hero .hero-buttons .btn'),
            device: document.querySelector('.hero .device-mockup'),
            floatingCards: document.querySelectorAll('.hero .floating-card')
        };
        
        this.init();
    }
    
    init() {
        if (!this.heroSection) return;
        
        this.setupEntranceAnimations();
        this.setupParallaxEffects();
        this.setupFloatingAnimations();
    }
    
    setupEntranceAnimations() {
        // Animate elements sequentially
        const tl = [];
        
        if (this.heroElements.tagline) {
            tl.push({
                element: this.heroElements.tagline,
                properties: { opacity: 1, transform: 'translateY(0)' },
                options: { duration: 500, easing: 'easeOut' }
            });
        }
        
        if (this.heroElements.title) {
            tl.push({
                element: this.heroElements.title,
                properties: { opacity: 1, transform: 'translateY(0)' },
                options: { duration: 600, easing: 'easeOut', delay: 100 }
            });
        }
        
        if (this.heroElements.description) {
            tl.push({
                element: this.heroElements.description,
                properties: { opacity: 1, transform: 'translateY(0)' },
                options: { duration: 500, easing: 'easeOut', delay: 200 }
            });
        }
        
        if (this.heroElements.buttons.length > 0) {
            this.heroElements.buttons.forEach((btn, index) => {
                tl.push({
                    element: btn,
                    properties: { opacity: 1, transform: 'translateY(0)' },
                    options: { duration: 500, easing: 'easeOut', delay: 300 + (index * 100) }
                });
            });
        }
        
        if (this.heroElements.device) {
            tl.push({
                element: this.heroElements.device,
                properties: { opacity: 1, transform: 'translateY(0)' },
                options: { duration: 600, easing: 'easeOut', delay: 400 }
            });
        }
        
        // Use requestAnimationFrame for smooth animations
        if (tl.length > 0) {
            const animationController = new AnimationController();
            animationController.sequence(tl, { delayBetween: 50 });
        }
    }
    
    setupParallaxEffects() {
        if (!this.heroSection) return;
        
        const handleScroll = () => {
            const scrollPosition = window.pageYOffset;
            const heroHeight = this.heroSection.offsetHeight;
            
            // Only apply parallax when hero is in view
            if (scrollPosition < heroHeight) {
                const progress = scrollPosition / heroHeight;
                
                if (this.heroElements.device) {
                    this.heroElements.device.style.transform = `translateY(${progress * 50}px)`;
                }
                
                if (this.heroElements.floatingCards.length > 0) {
                    this.heroElements.floatingCards.forEach((card, index) => {
                        card.style.transform = `translateY(${progress * (30 + index * 10)}px)`;
                    });
                }
            }
        };
        
        let ticking = false;
        const requestTick = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    setupFloatingAnimations() {
        if (this.heroElements.floatingCards.length === 0) return;
        
        this.heroElements.floatingCards.forEach((card, index) => {
            const duration = 6 + index * 2;
            const delay = index * 0.5;
            
            const animate = () => {
                const startTime = Date.now();
                const animateFrame = () => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const progress = (elapsed % duration) / duration;
                    
                    // Float up and down
                    const yOffset = Math.sin(progress * Math.PI * 2) * 20;
                    // Rotate slightly
                    const rotation = Math.sin(progress * Math.PI * 2) * 10;
                    
                    card.style.transform = `translateY(${yOffset}px) rotate(${rotation}deg)`;
                    
                    requestAnimationFrame(animateFrame);
                };
                
                requestAnimationFrame(animateFrame);
            };
            
            setTimeout(animate, delay * 1000);
        });
    }
}

// ============================================
// Card Animations
// ============================================

class CardAnimations {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card, .testimonial-card, .blog-card, .portfolio-card');
        this.init();
    }
    
    init() {
        if (this.cards.length === 0) return;
        
        this.setupHoverEffects();
        this.setupIntersectionAnimations();
    }
    
    setupHoverEffects() {
        this.cards.forEach(card => {
            // Mouse enter
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'all 0.3s ease';
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
            });
            
            // Mouse leave
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }
    
    setupIntersectionAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        this.cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
}

// ============================================
// Button Animations
// ============================================

class ButtonAnimations {
    constructor() {
        this.buttons = document.querySelectorAll('.btn, button, [role="button"]');
        this.init();
    }
    
    init() {
        if (this.buttons.length === 0) return;
        
        this.setupRippleEffect();
        this.setupHoverEffects();
    }
    
    setupRippleEffect() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Create ripple element
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                
                // Position ripple at click location
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    setupHoverEffects() {
        this.buttons.forEach(btn => {
            if (btn.classList.contains('btn-primary')) {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 6px 16px rgba(98, 0, 234, 0.4)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                    btn.style.boxShadow = '';
                });
            }
        });
    }
}

// ============================================
// Initialize All Animations
// ============================================

let animationController;
let heroAnimations;
let cardAnimations;
let buttonAnimations;

const initAnimations = () => {
    // Initialize animation controller
    animationController = new AnimationController();
    
    // Initialize hero animations
    heroAnimations = new HeroAnimations();
    
    // Initialize card animations
    cardAnimations = new CardAnimations();
    
    // Initialize button animations
    buttonAnimations = new ButtonAnimations();
    
    // Log initialization
    console.log('%c Animations Initialized ', 'background: #03dac6; color: white; font-size: 16px; padding: 5px;');
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

// Export for other modules
window.MobileWebAnimations = {
    AnimationController,
    HeroAnimations,
    CardAnimations,
    ButtonAnimations,
    animationController,
    heroAnimations,
    cardAnimations,
    buttonAnimations
};
