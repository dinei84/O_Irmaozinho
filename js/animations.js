// Animations and Interactive Effects

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Initialize scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effect for hero section
function initParallaxEffect() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (scrolled < heroSection.offsetHeight) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Card hover effects
function initCardEffects() {
    const cards = document.querySelectorAll('.article-card, .value-card, .chronicle-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Button ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

// Typing animation for hero title
function initTypingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.textContent;
    const highlightText = heroTitle.querySelector('.hero-highlight');
    
    if (highlightText) {
        const beforeText = text.substring(0, text.indexOf(highlightText.textContent));
        const afterText = text.substring(text.indexOf(highlightText.textContent) + highlightText.textContent.length);
        
        heroTitle.innerHTML = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < beforeText.length) {
                heroTitle.innerHTML += beforeText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else if (i === beforeText.length) {
                heroTitle.innerHTML += `<span class="hero-highlight">${highlightText.textContent}</span>`;
                i++;
                setTimeout(typeWriter, 100);
            } else if (i - beforeText.length - 1 < afterText.length) {
                heroTitle.innerHTML += afterText.charAt(i - beforeText.length - 1);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typing animation after a delay
        setTimeout(typeWriter, 500);
    }
}

// Loading animation
function initLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p class="loader-text">Carregando...</p>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    window.addEventListener('load', () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 300);
    });
}

// Scroll progress indicator
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = `${scrollPercent}%`;
    });
}

// Image lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Form animations
function initFormAnimations() {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

// Counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

function initCounterAnimations() {
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
                counterObserver.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmoothScrolling();
    initParallaxEffect();
    initCardEffects();
    initButtonEffects();
    initTypingAnimation();
    initScrollProgress();
    initLazyLoading();
    initFormAnimations();
    initCounterAnimations();
});

// Add CSS for animations
const animationStyles = `
    <style>
        /* Ripple Effect */
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* Page Loader */
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--color-white);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.3s ease;
        }
        
        .loader-content {
            text-align: center;
        }
        
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--color-light-gray);
            border-top: 4px solid var(--color-primary-orange);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto var(--spacing-md);
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loader-text {
            color: var(--color-gray);
            font-family: var(--font-heading);
        }
        
        /* Scroll Progress */
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--color-primary-orange), var(--color-secondary-cyan));
            z-index: var(--z-fixed);
            transition: width 0.1s ease;
        }
        
        /* Lazy Loading */
        img.lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        img.lazy.loaded {
            opacity: 1;
        }
        
        /* Form Focus Animation */
        .form-group {
            position: relative;
            margin-bottom: var(--spacing-lg);
        }
        
        .form-group.focused label {
            transform: translateY(-20px) scale(0.8);
            color: var(--color-primary-orange);
        }
        
        .form-group label {
            position: absolute;
            top: 12px;
            left: 12px;
            transition: all 0.3s ease;
            pointer-events: none;
            color: var(--color-gray);
        }
        
        /* Animation delays for staggered effects */
        .fade-in:nth-child(1) { transition-delay: 0.1s; }
        .fade-in:nth-child(2) { transition-delay: 0.2s; }
        .fade-in:nth-child(3) { transition-delay: 0.3s; }
        .fade-in:nth-child(4) { transition-delay: 0.4s; }
        .fade-in:nth-child(5) { transition-delay: 0.5s; }
        .fade-in:nth-child(6) { transition-delay: 0.6s; }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);

