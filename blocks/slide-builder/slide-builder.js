/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-absolute-path */
import { renderExpressions } from '/plusplus/plugins/expressions/src/expressions.js';

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

      const processedSlides = await Promise.all(jsonFeed.data.map(async (item, index) => {
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

  const slideHeight = window.innerHeight;
  const footerWrapper = document.querySelector('.footer-wrapper');

  slides.forEach((slide, index) => {
    const slideItem = createSlideItem(slide);
    container.appendChild(slideItem);
    setSlideBackground(slideItem, slide.image);
  });

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
  }

  function handleScroll() {
    window.requestAnimationFrame(updateSlidePositions);
  }

  window.addEventListener('scroll', handleScroll);

  // Set initial positions
  updateSlidePositions();

  // Set the height of the body to accommodate all slides
  document.body.style.height = 'auto';

  renderExpressions(document.querySelector('.slide-builder'));
}
