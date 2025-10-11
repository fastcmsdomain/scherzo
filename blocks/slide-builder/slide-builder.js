/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-absolute-path */
/* eslint-disable no-console */
import { renderExpressions } from '/plusplus/plugins/expressions/src/expressions.js';

// Import GSAP and ScrollTrigger via CDN for reliability
let gsap;
let ScrollTrigger;

async function loadGSAP() {
  try {
    // Try to load from CDN first for reliability
    if (!window.gsap) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    if (!window.ScrollTrigger) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    gsap = window.gsap;
    ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    console.log('GSAP and ScrollTrigger loaded successfully via CDN');
    return true;
  } catch (error) {
    console.warn('GSAP not available, falling back to basic scroll:', error);
    gsap = null;
    ScrollTrigger = null;
    return false;
  }
}

export default async function decorate(block) {
  async function fetchSlides() {
    try {
      const response = await fetch('/slides/query-index.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonFeed = await response.json();

      if (!jsonFeed.data || !Array.isArray(jsonFeed.data)) {
        throw new Error('Invalid data format in JSON feed');
      }

      const processedSlides = await Promise.all(jsonFeed.data.map(async (item) => {
        if (!item.path || !item.path.startsWith('/slides/')) {
          return null;
        }

        try {
          const htmlResponse = await fetch(`${item.path}.plain.html`);
          if (!htmlResponse.ok) {
            throw new Error(`Failed to fetch HTML for slide: ${item.path}`);
          }
          const html = await htmlResponse.text();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const textElements = doc.querySelectorAll('.tytul-zdjecia > div > div');
          const titleParts = Array.from(textElements)
            .map((el) => el.textContent.trim())
            .filter((text) => text);

          const imgElement = doc.querySelector('picture source[media="(min-width: 600px)"]');
          let imageSrc = '';
          if (imgElement) {
            imageSrc = imgElement.getAttribute('srcset');
            imageSrc = imageSrc.split('?')[0];
          }
          const absoluteImageSrc = imageSrc ? new URL(imageSrc, window.location.origin).href : '';

          return {
            ...item,
            titleParts,
            image: absoluteImageSrc,
            description: '',
          };
        } catch (error) {
          return null;
        }
      }));

      const filteredSlides = processedSlides.filter((slide) => slide !== null);
      return filteredSlides;
    } catch (error) {
      return [];
    }
  }

  function createSlideItem(slideData) {
    const { image, titleParts } = slideData;

    const slideItem = document.createElement('div');
    slideItem.classList.add('slide-builder-item');
    slideItem.setAttribute('data-bg', image);

    const titleHtml = titleParts.map((part, i) => `<div class="title-part title-part-${i + 1}">${part}</div>`).join('');

    slideItem.innerHTML = `
      <div class="slide-background"></div>
      <div class="text-container">
        ${titleHtml}
      </div>
    `;

    return slideItem;
  }

  function setSlideBackground(slideItem, imageUrl) {
    const backgroundElement = slideItem.querySelector('.slide-background');
    backgroundElement.style.backgroundImage = `url(${imageUrl})`;
    slideItem.classList.add('loaded');
  }

  const container = document.querySelector('.slide-builder');
  if (!container) {
    return;
  }

  const slides = await fetchSlides();

  if (!slides || slides.length === 0) {
    return;
  }

  slides.forEach((slide) => {
    const slideItem = createSlideItem(slide);
    container.appendChild(slideItem);
    setSlideBackground(slideItem, slide.image);
  });

  // Set container height to accommodate overlapping slides
  const totalHeight = slides.length * 100; // 100vh per slide
  container.style.height = `${totalHeight}vh`;

  // Fallback basic scroll implementation
  function initializeBasicScroll() {
    function updateSlidePositions() {
      const slideItems = container.querySelectorAll('.slide-builder-item');
      const lastSlide = slideItems[slideItems.length - 1];
      if (!lastSlide) return;

      const lastSlideRect = lastSlide.getBoundingClientRect();

      // Check if user has scrolled past all slides
      if (lastSlideRect.bottom <= window.innerHeight) {
        document.body.classList.add('show-footer');
      } else {
        document.body.classList.remove('show-footer');
      }

      // Reveal title parts on scroll
      slideItems.forEach((slideItem) => {
        const rect = slideItem.getBoundingClientRect();
        const itemHeight = slideItem.offsetHeight;
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + itemHeight);

        const titleParts = slideItem.querySelectorAll('.title-part');

        if (scrollProgress >= 0 && scrollProgress <= 1) {
          const opacity = Math.min(scrollProgress * 2, 1);
          const translateY = Math.max(50 - scrollProgress * 100, 0);

          titleParts.forEach((titlePart) => {
            if (titlePart) {
              titlePart.style.opacity = opacity;
              titlePart.style.transform = `translateY(${translateY}vh)`;
            }
          });
        }
      });
    }

    function handleScroll() {
      window.requestAnimationFrame(updateSlidePositions);
    }

    window.addEventListener('scroll', handleScroll);
    updateSlidePositions();
  }

  // GSAP ScrollTrigger implementation with proper overlapping
  function initializeGSAPScrollTrigger() {
    if (!gsap || !ScrollTrigger) {
      initializeBasicScroll();
      return;
    }

    const slideItems = container.querySelectorAll('.slide-builder-item');

    slideItems.forEach((slideItem, index) => {
      const backgroundElement = slideItem.querySelector('.slide-background');
      const titleParts = slideItem.querySelectorAll('.title-part');

      // Set unique ID for each slide
      slideItem.setAttribute('id', `slide-${index}`);

      // Create overlapping parallax effect - slides move over each other
      gsap.to(slideItem, {
        yPercent: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: slideItem,
          start: 'bottom bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Enhanced parallax background effect
      if (backgroundElement) {
        gsap.fromTo(
          backgroundElement,
          {
            yPercent: 0,
            scale: 1.2,
          },
          {
            yPercent: -50,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: slideItem,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          },
        );
      }

      // Text animations with scroll sensitivity
      if (titleParts.length > 0) {
        // Set initial state for text parts
        gsap.set(titleParts, {
          opacity: 0,
          y: 100,
          scale: 0.8,
        });

        // Text entrance animation
        const textTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: slideItem,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1,
          },
        });

        titleParts.forEach((titlePart, partIndex) => {
          textTimeline.to(
            titlePart,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
            },
            partIndex * 0.1,
          );
        });

        // Text parallax movement during scroll
        gsap.to(titleParts, {
          y: -150,
          opacity: 0,
          scale: 0.7,
          ease: 'none',
          scrollTrigger: {
            trigger: slideItem,
            start: 'center top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // Scale effect for depth during overlap
      gsap.fromTo(
        slideItem,
        {
          scale: 0.9,
        },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: slideItem,
            start: 'top bottom',
            end: 'top top',
            scrub: 1,
          },
        },
      );
    });

    // Footer reveal animation
    const lastSlide = slideItems[slideItems.length - 1];
    if (lastSlide) {
      ScrollTrigger.create({
        trigger: lastSlide,
        start: 'bottom 80%',
        onEnter: () => {
          gsap.to(document.body, {
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => document.body.classList.add('show-footer'),
          });
        },
        onLeaveBack: () => {
          document.body.classList.remove('show-footer');
        },
      });
    }

    // Add scroll-based performance optimizations
    let ticking = false;

    function optimizeScrollPerformance() {
      if (!ticking) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ticking = false;
        });
        ticking = true;
      }
    }

    // Listen for resize events to refresh ScrollTrigger
    window.addEventListener('resize', optimizeScrollPerformance);

    // Initial refresh
    ScrollTrigger.refresh();

    // Add debug info for development
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('hlx.page')) {
      console.log(`Initialized ${slideItems.length} slides with GSAP ScrollTrigger`);

      // Add ScrollTrigger debug markers in development
      ScrollTrigger.addEventListener('refresh', () => {
        console.log('ScrollTrigger refreshed');
      });
    }
  }

  // Load GSAP and initialize scroll implementation
  const gsapLoaded = await loadGSAP();

  if (gsapLoaded) {
    initializeGSAPScrollTrigger();
  } else {
    initializeBasicScroll();
  }

  // Set the height of the body to accommodate all slides
  document.body.style.height = 'auto';

  renderExpressions(document.querySelector('.slide-builder'));
}