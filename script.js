/**
 * Travel Guide Collection - Main JavaScript
 * Browser Support: Chrome, Firefox, Safari (including iOS), Edge
 *
 * Features:
 * - Smooth scrolling
 * - Auto-hiding header with fade effect
 * - Intersection Observer animations
 * - Touch-friendly interactions
 */

(function() {
    'use strict';

    // ===================================
    // Utility Functions
    // ===================================

    /**
     * Cross-browser request animation frame
     */
    const requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback) {
                   window.setTimeout(callback, 1000 / 60);
               };
    })();

    /**
     * Debounce function for performance optimization
     */
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

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ===================================
    // Smooth Scroll Handler
    // ===================================

    function initSmoothScroll() {
        const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

        smoothScrollLinks.forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just '#'
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    // Cross-browser smooth scroll
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const startPosition = window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 1000;
                    let start = null;

                    function animation(currentTime) {
                        if (start === null) start = currentTime;
                        const timeElapsed = currentTime - start;
                        const run = ease(timeElapsed, startPosition, distance, duration);
                        window.scrollTo(0, run);
                        if (timeElapsed < duration) requestAnimFrame(animation);
                    }

                    function ease(t, b, c, d) {
                        t /= d / 2;
                        if (t < 1) return c / 2 * t * t + b;
                        t--;
                        return -c / 2 * (t * (t - 2) - 1) + b;
                    }

                    requestAnimFrame(animation);
                }
            });
        });
    }

    // ===================================
    // Fixed Header with Fade Effect Handler
    // ===================================

    function initFixedHeaderEffect() {
        const header = document.querySelector('header');

        if (!header) return;

        let lastScrollTop = 0;
        let scrollThreshold = 100; // Minimum scroll before hiding
        let deltaThreshold = 5; // Minimum scroll delta to trigger hide/show

        const headerScrollHandler = function() {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            // Handle negative scroll (bouncing on mobile)
            if (currentScroll < 0) {
                return;
            }

            // If at the top of the page, always show header without scrolled state
            if (currentScroll <= scrollThreshold) {
                header.classList.remove('header-hidden');
                header.classList.remove('header-scrolled');
                lastScrollTop = currentScroll;
                return;
            }

            // Calculate scroll direction and delta
            const scrollDelta = currentScroll - lastScrollTop;

            // Only react to significant scroll movements
            if (Math.abs(scrollDelta) < deltaThreshold) {
                return;
            }

            if (scrollDelta > 0) {
                // Scrolling DOWN - hide header
                header.classList.add('header-hidden');
                header.classList.add('header-scrolled');
            } else {
                // Scrolling UP - show header
                header.classList.remove('header-hidden');
                header.classList.add('header-scrolled');
            }

            lastScrollTop = currentScroll;
        };

        // Use requestAnimationFrame for smooth performance
        let ticking = false;

        const requestTick = function() {
            if (!ticking) {
                requestAnimFrame(function() {
                    headerScrollHandler();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Initial check
        headerScrollHandler();

        // Add scroll event listener with passive flag for better performance
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // ===================================
    // Intersection Observer for Animations
    // ===================================

    function initIntersectionObserver() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without support
            console.log('IntersectionObserver not supported, using fallback');
            const cards = document.querySelectorAll('.card');
            cards.forEach(function(card) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observerCallback = function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const target = entry.target;

                    // Animate element into view
                    target.style.opacity = '1';

                    // Set transform with vendor prefixes
                    const transformValue = 'translateY(0)';
                    target.style.webkitTransform = transformValue;
                    target.style.mozTransform = transformValue;
                    target.style.msTransform = transformValue;
                    target.style.oTransform = transformValue;
                    target.style.transform = transformValue;

                    // Optional: Unobserve after animation
                    // observer.unobserve(target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(function(card) {
            observer.observe(card);
        });
    }

    // ===================================
    // Touch Device Detection & Optimization
    // ===================================

    function detectTouchDevice() {
        const isTouchDevice = ('ontouchstart' in window) ||
                             (navigator.maxTouchPoints > 0) ||
                             (navigator.msMaxTouchPoints > 0);

        if (isTouchDevice) {
            document.body.classList.add('touch-device');

            // Add touch feedback to buttons
            const buttons = document.querySelectorAll('.card-button');
            buttons.forEach(function(button) {
                button.addEventListener('touchstart', function() {
                    this.classList.add('touched');
                }, { passive: true });

                button.addEventListener('touchend', function() {
                    const self = this;
                    setTimeout(function() {
                        self.classList.remove('touched');
                    }, 300);
                }, { passive: true });
            });
        }
    }

    // ===================================
    // Safari iOS Fixes
    // ===================================

    function applySafariIOSFixes() {
        // Detect Safari iOS
        const isSafariIOS = /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);

        if (isSafariIOS) {
            document.body.classList.add('safari-ios');

            // Fix 100vh issue on iOS Safari
            const setViewportHeight = function() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
            };

            setViewportHeight();
            window.addEventListener('resize', debounce(setViewportHeight, 100));
            window.addEventListener('orientationchange', debounce(setViewportHeight, 100));
        }
    }

    // ===================================
    // Performance Optimization
    // ===================================

    function optimizePerformance() {
        // Lazy load images if needed
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(function(img) {
                img.src = img.dataset.src;
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            document.body.appendChild(script);
        }

        // Add will-change hints for better performance
        const cards = document.querySelectorAll('.card');
        cards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.willChange = 'transform, box-shadow';
            }, { passive: true });

            card.addEventListener('mouseleave', function() {
                this.style.willChange = 'auto';
            }, { passive: true });
        });
    }

    // ===================================
    // Analytics and Error Tracking
    // ===================================

    function trackCardClicks() {
        const cardButtons = document.querySelectorAll('.card-button');

        cardButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                const cardTitle = this.closest('.card').querySelector('.card-title').textContent;

                // Log for debugging (replace with actual analytics in production)
                console.log('Card clicked:', cardTitle);

                // You can add Google Analytics or other tracking here
                // Example: gtag('event', 'card_click', { 'card_name': cardTitle });
            });
        });
    }

    // ===================================
    // Accessibility Enhancements
    // ===================================

    function enhanceAccessibility() {
        // Add keyboard navigation support
        const cards = document.querySelectorAll('.card');

        cards.forEach(function(card) {
            const button = card.querySelector('.card-button');

            if (button) {
                // Make card focusable
                card.setAttribute('tabindex', '0');

                // Handle keyboard events
                card.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
            }
        });

        // Add focus visible polyfill for better keyboard navigation
        document.addEventListener('keydown', function() {
            document.body.classList.add('keyboard-nav');
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-nav');
        });
    }

    // ===================================
    // Initialize on DOM Ready
    // ===================================

    function init() {
        console.log('Initializing Travel Guide Collection...');

        // Initialize all features
        initSmoothScroll();
        initFixedHeaderEffect();
        initIntersectionObserver();
        detectTouchDevice();
        applySafariIOSFixes();
        optimizePerformance();
        trackCardClicks();
        enhanceAccessibility();

        console.log('Travel Guide Collection initialized successfully!');
    }

    // Cross-browser DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('Page hidden');
        } else {
            console.log('Page visible');
        }
    });

    // Prevent scroll restoration on page reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

})();
