// ========================================
// FlowCRM Landing Page - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initNavbar();
  initMobileMenu();
  initProductTour();
  initTestimonialsCarousel();
  initScrollAnimations();
  initCounterAnimations();
  initLeadCardAnimations();
});

// ========================================
// Navbar Scroll Behavior
// ========================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu-content a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile menu if open
          closeMobileMenu();
        }
      }
    });
  });
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  mobileMenu.querySelectorAll('a, button').forEach(item => {
    item.addEventListener('click', closeMobileMenu);
  });
}

function closeMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ========================================
// Product Tour Tabs
// ========================================
function initProductTour() {
  const tabs = document.querySelectorAll('.tour-tab');
  const panels = document.querySelectorAll('.tour-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panels with animation
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          // Add small delay for transition effect
          setTimeout(() => {
            panel.classList.add('active');
          }, 50);
        }
      });
    });
  });
}

// ========================================
// Testimonials Carousel
// ========================================
function initTestimonialsCarousel() {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const totalSlides = cards.length;
  let currentSlide = 0;
  let autoplayInterval;

  // Create dots
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  function goToSlide(index) {
    currentSlide = index;
    if (currentSlide >= totalSlides) currentSlide = 0;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    updateCarousel();
    resetAutoplay();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Start autoplay
  resetAutoplay();

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  track.addEventListener('mouseleave', resetAutoplay);

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
}

// ========================================
// Testimonials Carousel
// ========================================
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
    });
  });
}

// ========================================
// Pricing Toggle
// ========================================
function initPricingToggle() {
  const toggle = document.getElementById('pricing-toggle');
  const labels = document.querySelectorAll('.toggle-label');
  const prices = document.querySelectorAll('.pricing-price .price');

  if (!toggle) return;

  let isYearly = false;

  toggle.addEventListener('click', () => {
    isYearly = !isYearly;
    toggle.classList.toggle('active', isYearly);

    // Update labels
    labels.forEach(label => {
      const period = label.dataset.period;
      label.classList.toggle('active',
        (period === 'yearly' && isYearly) ||
        (period === 'monthly' && !isYearly)
      );
    });

    // Update prices with animation
    prices.forEach(price => {
      const monthly = price.dataset.monthly;
      const yearly = price.dataset.yearly;

      price.style.opacity = '0';
      setTimeout(() => {
        price.textContent = `$${isYearly ? yearly : monthly}`;
        price.style.opacity = '1';
      }, 150);
    });
  });

  // Initialize monthly as active
  labels[0].classList.add('active');
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Staggered animation
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);

        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// Counter Animations
// ========================================
function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter');
  const metricBars = document.querySelectorAll('.metric-bar-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate counters
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.target);
          animateCounter(counter, target);
        });

        // Animate metric bars
        metricBars.forEach(bar => {
          const width = bar.dataset.width;
          setTimeout(() => {
            bar.style.width = width;
          }, 200);
        });

        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const metricsSection = document.querySelector('.metrics');
  if (metricsSection) {
    observer.observe(metricsSection);
  }
}

function animateCounter(element, target) {
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

// ========================================
// Lead Card Animations (Hero Mockup)
// ========================================
function initLeadCardAnimations() {
  const mockupCounters = document.querySelectorAll('.mockup-sidebar .animated-counter');

  if (mockupCounters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        mockupCounters.forEach(counter => {
          const target = parseInt(counter.dataset.target);
          animateMockupCounter(counter, target);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    observer.observe(heroSection);
  }
}

function animateMockupCounter(element, target) {
  const duration = 2500;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * target);

    element.textContent = '$' + current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = '$' + target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

// ========================================
// Parallax Effect for Hero
// ========================================
function initParallax() {
  const heroVisual = document.querySelector('.hero-visual');

  if (!heroVisual) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrollY < heroHeight) {
      const parallaxValue = scrollY * 0.1;
      heroVisual.style.transform = `translateY(${parallaxValue}px)`;
    }
  });
}

// ========================================
// Chart Bar Animation (Mockup)
// ========================================
function animateChartBars() {
  const chartBars = document.querySelectorAll('.metric-chart .chart-bar');

  chartBars.forEach((bar, index) => {
    const originalHeight = bar.style.height;
    bar.style.height = '0';

    setTimeout(() => {
      bar.style.transition = 'height 0.5s ease';
      bar.style.height = originalHeight;
    }, index * 100);
  });
}

// Trigger chart animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(animateChartBars, 500);
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const hero = document.querySelector('.hero');
if (hero) {
  heroObserver.observe(hero);
}

// ========================================
// Parallax Effect for Hero
// ========================================
function initPricingCardReveal() {
  const cards = document.querySelectorAll('.pricing-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

// Initialize pricing card reveal
initPricingCardReveal();

// ========================================
// Typing Effect for Badge (Optional Enhancement)
// ========================================
function initTypingEffect() {
  const badge = document.querySelector('.hero-badge');

  if (!badge) return;

  // Add subtle pulse animation
  setInterval(() => {
    badge.style.transform = 'scale(1.02)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  }, 3000);
}

// ========================================
// Initialize Additional Effects
// ========================================
initParallax();
initTypingEffect();

// ========================================
// Console Easter Egg
// ========================================
console.log('%c FlowCRM ', 'background: linear-gradient(135deg, #8b5cf6, #14b8a6); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c Build your pipeline. Close more deals. 🚀', 'color: #8b5cf6; font-size: 14px;');