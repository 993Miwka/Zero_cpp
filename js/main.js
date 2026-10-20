/**
 * MobileWeb - Main JavaScript
 * Core functionality for the mobile-optimized website
 */

// ============================================
// DOM Elements
// ============================================
const DOM = {
    menuToggle: document.getElementById('menuToggle'),
    sideMenu: document.getElementById('sideMenu'),
    closeMenu: document.getElementById('closeMenu'),
    overlay: document.getElementById('overlay'),
    backToTop: document.getElementById('backToTop'),
    newsletterForm: document.getElementById('newsletterForm'),
    toast: document.getElementById('toast'),
    toastMessage: document.querySelector('.toast-message'),
    statNumbers: document.querySelectorAll('.stat-number'),
    navLinks: document.querySelectorAll('.nav-links a'),
    bottomNavLinks: document.querySelectorAll('.bottom-nav a'),
    sideMenuNavLinks: document.querySelectorAll('.side-menu .nav-links a')
};

// ============================================
// State
// ============================================
const state = {
    isMenuOpen: false,
    hasAnimatedStats: false,
    currentPage: 'home'
};

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit execution rate
 */
const debounce = (func, wait = 100) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

/**
 * Throttle function to limit execution rate
 */
const throttle = (func, limit = 100) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if element is in viewport
 */
const isInViewport = (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= (0 + offset)
    );
};

/**
 * Smooth scroll to element
 */
const smoothScroll = (target, offset = 0) => {
    const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
    
    if (element) {
        const position = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
    }
};

/**
 * Format number with commas
 */
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Generate unique ID
 */
const generateId = () => {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// ============================================
// Toast Notification System
// ============================================

const Toast = {
    show: (message, type = 'success', duration = 3000) => {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        
        DOM.toastMessage.textContent = message;
        DOM.toast.innerHTML = icons[type] + '<span class="toast-message">' + message + '</span>';
        DOM.toast.classList.add('show');
        
        setTimeout(() => {
            Toast.hide();
        }, duration);
    },
    
    hide: () => {
        DOM.toast.classList.remove('show');
    },
    
    success: (message, duration) => {
        Toast.show(message, 'success', duration);
    },
    
    error: (message, duration) => {
        Toast.show(message, 'error', duration);
    },
    
    warning: (message, duration) => {
        Toast.show(message, 'warning', duration);
    },
    
    info: (message, duration) => {
        Toast.show(message, 'info', duration);
    }
};

// ============================================
// Mobile Navigation
// ============================================

const MobileNav = {
    open: () => {
        DOM.sideMenu.classList.add('active');
        DOM.overlay.classList.add('active');
        DOM.menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        state.isMenuOpen = true;
    },
    
    close: () => {
        DOM.sideMenu.classList.remove('active');
        DOM.overlay.classList.remove('active');
        DOM.menuToggle.classList.remove('active');
        document.body.style.overflow = '';
        state.isMenuOpen = false;
    },
    
    toggle: () => {
        if (state.isMenuOpen) {
            MobileNav.close();
        } else {
            MobileNav.open();
        }
    },
    
    init: () => {
        // Menu toggle button
        DOM.menuToggle?.addEventListener('click', MobileNav.toggle);
        
        // Close menu button
        DOM.closeMenu?.addEventListener('click', MobileNav.close);
        
        // Overlay click
        DOM.overlay?.addEventListener('click', MobileNav.close);
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isMenuOpen) {
                MobileNav.close();
            }
        });
        
        // Update active nav link
        MobileNav.updateActiveLink();
    },
    
    updateActiveLink: () => {
        const currentPath = window.location.pathname;
        
        // Update side menu links
        DOM.sideMenuNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = currentPath.includes(href.replace('index.html', ''));
            link.classList.toggle('active', isActive);
        });
        
        // Update bottom nav links
        DOM.bottomNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = currentPath.includes(href.replace('index.html', ''));
            link.classList.toggle('active', isActive);
        });
    }
};

// ============================================
// Back to Top Button
// ============================================

const BackToTop = {
    init: () => {
        window.addEventListener('scroll', throttle(BackToTop.handleScroll, 50));
        DOM.backToTop?.addEventListener('click', BackToTop.scrollToTop);
    },
    
    handleScroll: () => {
        if (window.pageYOffset > 300) {
            DOM.backToTop?.classList.add('visible');
        } else {
            DOM.backToTop?.classList.remove('visible');
        }
    },
    
    scrollToTop: () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// ============================================
// Newsletter Form
// ============================================

const Newsletter = {
    init: () => {
        DOM.newsletterForm?.addEventListener('submit', Newsletter.handleSubmit);
    },
    
    handleSubmit: async (e) => {
        e.preventDefault();
        
        const emailInput = DOM.newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            Toast.error('Please enter your email address');
            return;
        }
        
        if (!Newsletter.validateEmail(email)) {
            Toast.error('Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const submitBtn = DOM.newsletterForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            Toast.success('Thank you for subscribing!');
            emailInput.value = '';
        } catch (error) {
            Toast.error('Something went wrong. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// ============================================
// Animated Counter (Stats)
// ============================================

const AnimatedCounter = {
    init: () => {
        // Use Intersection Observer to trigger animation when stats are visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !state.hasAnimatedStats) {
                        AnimatedCounter.animateAll();
                        state.hasAnimatedStats = true;
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    },
    
    animate: (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = formatNumber(Math.floor(current));
        }, 16);
    },
    
    animateAll: () => {
        DOM.statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            if (!isNaN(target)) {
                AnimatedCounter.animate(stat, target);
            }
        });
    }
};

// ============================================
// Scroll Animations
// ============================================

const ScrollAnimations = {
    init: () => {
        // Initialize Intersection Observer for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        // Observe all scroll-animate elements
        const animatedElements = document.querySelectorAll('.scroll-animate');
        animatedElements.forEach(el => observer.observe(el));
    }
};

// ============================================
// Lazy Loading Images
// ============================================

const LazyLoader = {
    init: () => {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                },
                { rootMargin: '50px 0px' }
            );
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
};

// ============================================
// Touch Support for Mobile
// ============================================

const TouchSupport = {
    init: () => {
        // Add touch class to body if touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add('touch-device');
        }
        
        // Prevent default for touch drag on non-scrollable elements
        document.querySelectorAll('.no-touch-drag').forEach(el => {
            el.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }
};

// ============================================
// Keyboard Navigation
// ============================================

const KeyboardNav = {
    init: () => {
        // Add keyboard focus styles
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
};

// ============================================
// Viewport Units Fix for Mobile
// ============================================

const ViewportFix = {
    init: () => {
        // Fix for 100vh on mobile browsers with dynamic toolbars
        const setAppHeight = () => {
            document.documentElement.style.setProperty(
                '--vh', 
                `${window.innerHeight * 0.01}px`
            );
        };
        
        setAppHeight();
        window.addEventListener('resize', debounce(setAppHeight, 100));
        window.addEventListener('orientationchange', debounce(setAppHeight, 100));
    }
};

// ============================================
// Preloader
// ============================================

const Preloader = {
    init: () => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }, 500);
            });
        }
    }
};

// ============================================
// Smooth Scroll for Anchor Links
// ============================================

const SmoothScroll = {
    init: () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        // Close menu if open
                        if (state.isMenuOpen) {
                            MobileNav.close();
                        }
                        smoothScroll(target, 80);
                    }
                }
            });
        });
    }
};

// ============================================
// Detect Connection Speed
// ============================================

const ConnectionDetector = {
    init: () => {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.saveData || connection.effectiveType === 'slow-2g') {
                document.body.classList.add('slow-connection');
                // Disable heavy animations
                document.body.classList.add('reduce-animations');
            }
            
            connection.addEventListener('change', () => {
                if (connection.saveData || connection.effectiveType === 'slow-2g') {
                    document.body.classList.add('slow-connection');
                } else {
                    document.body.classList.remove('slow-connection');
                }
            });
        }
    }
};

// ============================================
// Initialize Everything
// ============================================

const init = () => {
    // Core functionality
    MobileNav.init();
    BackToTop.init();
    Newsletter.init();
    AnimatedCounter.init();
    ScrollAnimations.init();
    LazyLoader.init();
    TouchSupport.init();
    KeyboardNav.init();
    ViewportFix.init();
    Preloader.init();
    SmoothScroll.init();
    ConnectionDetector.init();
    
    // Log initialization
    console.log('%c MobileWeb Initialized ', 'background: #6200ea; color: white; font-size: 16px; padding: 5px;');
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for other modules
window.MobileWeb = {
    Toast,
    MobileNav,
    BackToTop,
    Newsletter,
    AnimatedCounter,
    ScrollAnimations
};
