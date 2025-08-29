/**
 * Scroll Hero Configuration
 * Wellington College Prep style animations config
 */

export const SCROLL_HERO_CONFIG = {
  // Animation timing (based on Wellington College values)
  timing: {
    scrubSpeed: 1,           // Main scroll scrub speed
    parallaxSpeed: 1.5,      // Background parallax speed  
    textAnimationSpeed: 1,   // Text entrance/exit speed
    staggerDelay: 0.1,       // Delay between animated elements
    transitionDuration: 0.5  // Duration for image transitions
  },
  
  // Responsive breakpoints (Wellington College breakpoints)
  breakpoints: {
    mobile: 992,
    tablet: 1200,
    desktop: 1600
  },
  
  // Text animation parameters
  textAnimations: {
    entrance: {
      from: { y: 100, opacity: 0, scale: 0.8 },
      to: { y: 0, opacity: 1, scale: 1 },
      ease: 'power2.out'
    },
    exit: {
      to: { y: -150, opacity: 0.2, scale: 0.7 },
      ease: 'none'
    },
    stagger: 0.1 // Delay between text elements
  },
  
  // Background image effects
  backgroundEffects: {
    parallax: {
      yPercent: -50,
      scale: { from: 1.2, to: 1 }
    },
    multiImageStagger: {
      baseDelay: 25, // Percentage of scroll for first image switch
      incrementDelay: 25 // Additional delay for each subsequent image
    }
  },
  
  // Section styling
  sectionStyles: {
    height: '300vh', // Creates scroll space for pin effect
    zIndexIncrement: 1 // Each section gets higher z-index
  },
  
  // Color scheme for different sections
  colorSchemes: {
    friends: '#f7d117',    // Yellow
    skills: '#a6d6c9',     // Teal  
    confidence: '#ff6b6b', // Red
    passions: '#9b59b6',   // Purple
    default: '#ffffff'     // White fallback
  },
  
  // Progress navigation
  progressNav: {
    position: { left: '40px', top: '50%' },
    hideOnMobile: true,
    animationDuration: 0.3
  },
  
  // Performance optimizations
  performance: {
    willChange: ['transform', 'opacity'],
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    enableGPUAcceleration: true
  },
  
  // CDN URLs for GSAP (if not already loaded)
  cdnUrls: {
    gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    scrollTrigger: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
    scrollToPlugin: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js'
  },
  
  // Debug mode
  debug: {
    enabled: false, // Set to true for console logging
    showTriggers: false, // Show ScrollTrigger markers
    logAnimations: false // Log animation events
  }
};

// Utility functions for configuration
export function getResponsiveValue(config, property) {
  const width = window.innerWidth;
  const breakpoints = SCROLL_HERO_CONFIG.breakpoints;
  
  if (width <= breakpoints.mobile) {
    return config.mobile || config.default;
  } else if (width <= breakpoints.tablet) {
    return config.tablet || config.default;
  } else {
    return config.desktop || config.default;
  }
}

export function getSectionColor(sectionName) {
  return SCROLL_HERO_CONFIG.colorSchemes[sectionName] || SCROLL_HERO_CONFIG.colorSchemes.default;
}

export function debugLog(message, data = null) {
  if (SCROLL_HERO_CONFIG.debug.enabled) {
    console.log(`[Scroll Hero] ${message}`, data);
  }
}
