/* esint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-absolute-path */
import { renderExpressions } from '/plusplus/plugins/expressions/src/expressions.js';

// Import ScrollMagic
let ScrollMagic;
try {
  ScrollMagic = await import('scrollmagic');
} catch (error) {
  // ScrollMagic not available, will fall back to basic scroll implementation
  ScrollMagic = null;
}

// eslint-disable-next-line no-unused-vars
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

  // const slideHeight = window.innerHeight;
  // const footerWrapper = document.querySelector('.footer-wrapper');

  slides.forEach((slide) => {
    const slideItem = createSlideItem(slide);
    container.appendChild(slideItem);
    setSlideBackground(slideItem, slide.image);
  });

  // Fallback basic scroll implementation
  function initializeBasicScroll() {
    function updateSlidePositions() {
      const slideItems = container.querySelectorAll('.slide-builder-item');
      const lastSlide = slideItems[slideItems.length - 1];
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

        const titlePart1 = slideItem.querySelector('.title-part-1');
        const titlePart2 = slideItem.querySelector('.title-part-2');
        const titlePart3 = slideItem.querySelector('.title-part-3');

        if (scrollProgress >= 0 && scrollProgress <= 1) {
          const opacity = Math.min(scrollProgress * 2, 1);
          const translateY = Math.max(50 - scrollProgress * 100, 0);

          if (titlePart1) {
            titlePart1.style.opacity = opacity;
            titlePart1.style.transform = `translateY(${translateY}vh)`;
          }
          if (titlePart2) {
            titlePart2.style.opacity = opacity;
            titlePart2.style.transform = `translateY(${translateY}vh)`;
          }
          if (titlePart3) {
            titlePart3.style.opacity = opacity;
            titlePart3.style.transform = `translateY(${translateY}vh)`;
          }
        }
      });
    }

    function handleScroll() {
      window.requestAnimationFrame(updateSlidePositions);
    }

    window.addEventListener('scroll', handleScroll);
    updateSlidePositions();
  }

  // Enhanced scroll functionality with ScrollMagic
  function initializeScrollMagic() {
    if (!ScrollMagic) {
      // Fallback to basic scroll implementation
      initializeBasicScroll();
      return;
    }

    // Initialize ScrollMagic controller
    const controller = new ScrollMagic.Controller();
    const slideItems = container.querySelectorAll('.slide-builder-item');

    slideItems.forEach((slideItem, index) => {
      const isFirstSlide = index === 0;
      const isLastSlide = index === slideItems.length - 1;

      // Create unique IDs for each slide elements
      const slideId = `slide-${index}`;
      const triggerId = `trigger-${index}`;

      slideItem.setAttribute('id', slideId);

      // Create trigger element
      const triggerElement = document.createElement('div');
      triggerElement.setAttribute('id', triggerId);
      triggerElement.classList.add('slide-trigger');
      slideItem.parentNode.insertBefore(triggerElement, slideItem);

      // Calculate duration based on slide content and position
      let duration = window.innerHeight * 1.5; // 1.5 viewport heights
      if (isFirstSlide) {
        duration = window.innerHeight * 2; // Longer duration for first slide
      } else if (isLastSlide) {
        duration = window.innerHeight; // Shorter duration for last slide
      }

      // Create pinning scene
      new ScrollMagic.Scene({
        triggerElement: `#${triggerId}`,
        duration,
        triggerHook: 1,
      })
        .setPin(`#${slideId}`, {
          pushFollowers: true,
        })
        .addTo(controller);

      // Enhanced title animation with CSS transitions
      const titleParts = slideItem.querySelectorAll('.title-part');

      // Set initial state for title parts
      titleParts.forEach((titlePart, partIndex) => {
        titlePart.style.opacity = '0';
        titlePart.style.transform = 'translateY(10vh) scale(0.95)';
        titlePart.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        titlePart.style.transitionDelay = `${partIndex * 0.2}s`;
      });

      // Create animation scene for title parts
      new ScrollMagic.Scene({
        triggerElement: `#${triggerId}`,
        duration: duration * 0.6,
        triggerHook: 0.8,
      })
        .on('progress', (event) => {
          const { progress } = event;
          titleParts.forEach((titlePart, partIndex) => {
            const partProgress = Math.max(0, Math.min(1, (progress - (partIndex * 0.1)) * 2));
            if (partProgress > 0) {
              titlePart.style.opacity = partProgress;
              titlePart.style.transform = `translateY(${(1 - partProgress) * 10}vh) scale(${0.95 + (partProgress * 0.05)})`;
            }
          });
        })
        .addTo(controller);

      // Background parallax effect with CSS transforms
      const backgroundElement = slideItem.querySelector('.slide-background');
      if (backgroundElement) {
        new ScrollMagic.Scene({
          triggerElement: `#${triggerId}`,
          duration: duration + window.innerHeight,
          triggerHook: 1,
        })
          .on('progress', (event) => {
            const { progress } = event;
            const translateY = progress * -20; // Move up by 20% at full progress
            backgroundElement.style.transform = `translateY(${translateY}%)`;
          })
          .addTo(controller);
      }
    });

    // Footer reveal scene
    const lastSlide = slideItems[slideItems.length - 1];
    if (lastSlide) {
      new ScrollMagic.Scene({
        triggerElement: lastSlide,
        triggerHook: 0.2,
      })
        .on('enter', () => {
          document.body.classList.add('show-footer');
        })
        .on('leave', () => {
          document.body.classList.remove('show-footer');
        })
        .addTo(controller);
    }
  }

  // Initialize the appropriate scroll implementation
  initializeScrollMagic();

  // Set the height of the body to accommodate all slides
  document.body.style.height = 'auto';

  renderExpressions(document.querySelector('.slide-builder'));
}
