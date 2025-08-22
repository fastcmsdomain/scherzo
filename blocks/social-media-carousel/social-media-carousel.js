import INSTAGRAM_CONFIG from './api-config.js';

// Configuration object for the social media carousel
const CAROUSEL_CONFIG = {
  VISIBLE_SLIDES: 3,
  TOTAL_SLIDES: 6,
  SLIDE_WIDTH: 400,
  AUTO_SCROLL_INTERVAL: 5000,
  INSTAGRAM_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  ERROR_MESSAGE: 'Error loading Instagram feed',
  LOADING_MESSAGE: 'Loading social media feed...',
  BACKGROUND_COLORS: ['#FFD700', '#98FB98', '#87CEEB', '#FFA07A', '#DDA0DD', '#F0E68C'],
};

/**
 * Check if cache is valid
 * @param {Object} cache - Cache object from localStorage
 * @returns {boolean} Whether cache is valid
 */
function isValidCache(cache) {
  if (!cache) return false;
  const now = Date.now();
  return now - cache.timestamp < INSTAGRAM_CONFIG.CACHE.DURATION;
}

/**
 * Get cached Instagram feed
 * @returns {Array|null} Cached feed data or null if invalid
 */
function getCachedFeed() {
  try {
    const cache = JSON.parse(localStorage.getItem(INSTAGRAM_CONFIG.CACHE.KEY));
    return isValidCache(cache) ? cache.data : null;
  } catch (error) {
    return null;
  }
}

/**
 * Cache Instagram feed data
 * @param {Array} data - Feed data to cache
 */
function cacheFeed(data) {
  const cache = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(INSTAGRAM_CONFIG.CACHE.KEY, JSON.stringify(cache));
}

/**
 * Format date to display in a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Create navigation arrows for the carousel
 * @param {HTMLElement} block - The carousel block element
 * @returns {Object} Object containing prev and next arrow elements
 */
function createNavigation(block) {
  const prevArrow = document.createElement('button');
  const nextArrow = document.createElement('button');

  prevArrow.className = 'carousel-nav prev';
  nextArrow.className = 'carousel-nav next';

  prevArrow.innerHTML = '‹';
  nextArrow.innerHTML = '›';

  prevArrow.setAttribute('aria-label', 'Previous slides');
  nextArrow.setAttribute('aria-label', 'Next slides');

  block.appendChild(prevArrow);
  block.appendChild(nextArrow);

  return { prevArrow, nextArrow };
}

/**
 * Create a slide element for the carousel
 * @param {Object} post - Instagram post data
 * @param {number} index - Index of the slide
 * @returns {HTMLElement} Slide element
 */
function createSlide(post, index) {
  const slide = document.createElement('div');
  slide.className = 'carousel-slide';
  const colorIndex = index % CAROUSEL_CONFIG.BACKGROUND_COLORS.length;
  slide.style.backgroundColor = CAROUSEL_CONFIG.BACKGROUND_COLORS[colorIndex];

  slide.innerHTML = `
<div class="instagram-icon">${CAROUSEL_CONFIG.INSTAGRAM_ICON}</div>
<img src="${post.media_url}" alt="${post.caption || ''}" loading="lazy">
<p class="post-description">${post.caption || ''}</p>
<p class="post-date">${formatDate(post.timestamp)}</p>
`;

  return slide;
}

/**
 * Initialize the carousel functionality
 * @param {HTMLElement} block - The carousel block element
 * @param {Array} posts - Array of Instagram posts
 */
function initializeCarousel(block, posts) {
  let currentIndex = 0;
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'carousel-container';

  // Create slides
  posts.forEach((post, index) => {
    const slide = createSlide(post, index);
    slidesContainer.appendChild(slide);
  });

  block.appendChild(slidesContainer);

  // Create navigation
  const { prevArrow, nextArrow } = createNavigation(block);

  // Navigation functionality
  function updateSlides() {
    slidesContainer.style.transform = `translateX(-${currentIndex * CAROUSEL_CONFIG.SLIDE_WIDTH}px)`;
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % (posts.length - CAROUSEL_CONFIG.VISIBLE_SLIDES + 1);
    updateSlides();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + (posts.length - CAROUSEL_CONFIG.VISIBLE_SLIDES + 1))
% (posts.length - CAROUSEL_CONFIG.VISIBLE_SLIDES + 1);
    updateSlides();
  }

  // Event listeners
  nextArrow.addEventListener('click', nextSlide);
  prevArrow.addEventListener('click', prevSlide);

  // Auto scroll
  let autoScrollInterval = setInterval(nextSlide, CAROUSEL_CONFIG.AUTO_SCROLL_INTERVAL);

  // Pause auto scroll on hover
  block.addEventListener('mouseenter', () => {
    clearInterval(autoScrollInterval);
  });

  block.addEventListener('mouseleave', () => {
    autoScrollInterval = setInterval(nextSlide, CAROUSEL_CONFIG.AUTO_SCROLL_INTERVAL);
  });
}

/**
 * Fetch Instagram feed data from the API
 * @returns {Promise} Promise that resolves with Instagram feed data
 */
async function fetchInstagramFeed() {
// Check cache first
  const cachedData = getCachedFeed();
  if (cachedData) {
    return cachedData;
  }

  try {
    const url = new URL(`${INSTAGRAM_CONFIG.API_BASE_URL}${INSTAGRAM_CONFIG.ENDPOINTS.MEDIA}`);
    url.searchParams.append('access_token', INSTAGRAM_CONFIG.ACCESS_TOKEN);
    url.searchParams.append('fields', INSTAGRAM_CONFIG.FIELDS.MEDIA);
    url.searchParams.append('limit', CAROUSEL_CONFIG.TOTAL_SLIDES);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const posts = data.data.slice(0, CAROUSEL_CONFIG.TOTAL_SLIDES);

    // Cache the results
    cacheFeed(posts);

    return posts;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Instagram feed:', error);
    throw error;
  }
}

/**
 * Main function to decorate the social media carousel block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  try {
    block.innerHTML = `<div class="loading">${CAROUSEL_CONFIG.LOADING_MESSAGE}</div>`;
    const posts = await fetchInstagramFeed();
    block.innerHTML = '';
    initializeCarousel(block, posts);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(CAROUSEL_CONFIG.ERROR_MESSAGE, error);
    block.innerHTML = `<div class="error">${CAROUSEL_CONFIG.ERROR_MESSAGE}</div>`;
  }
}
