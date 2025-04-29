// Configuration object for the Social Media Carousel block
const SOCIAL_MEDIA_CAROUSEL_CONFIG = {
    DEFAULT_ACCOUNT: '@default',
    DEFAULT_COUNT: 6,
    DEFAULT_SHOW_DATE: true,
    CARDS_PER_VIEW: 3,
    ERROR_MESSAGES: {
      API_ERROR: 'Error fetching social media posts. Please try again later.',
      NO_POSTS: 'No social media posts available at this time.',
    },
    CLASSES: {
      CONTAINER: 'social-media-carousel',
      WRAPPER: 'social-media-carousel__wrapper',
      CARD: 'social-media-carousel__card',
      NAVIGATION: 'social-media-carousel__navigation',
      ARROW: 'social-media-carousel__arrow',
      ARROW_LEFT: 'social-media-carousel__arrow--left',
      ARROW_RIGHT: 'social-media-carousel__arrow--right',
      CARD_IMAGE: 'social-media-carousel__card-image',
      CARD_CONTENT: 'social-media-carousel__card-content',
      CARD_DESCRIPTION: 'social-media-carousel__card-description',
      CARD_DATE: 'social-media-carousel__card-date',
      CARD_LINK: 'social-media-carousel__card-link',
      INSTAGRAM_ICON: 'social-media-carousel__instagram-icon',
    },
  };
  
  /**
   * Creates a social media post card element
   * @param {Object} post - The post data
   * @returns {HTMLElement} - The created card element
   */
  function createPostCard(post) {
    const card = document.createElement('div');
    card.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD;
  
    const image = document.createElement('div');
    image.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD_IMAGE;
    image.style.backgroundImage = `url(${post.image})`;
  
    const content = document.createElement('div');
    content.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD_CONTENT;
  
    const description = document.createElement('p');
    description.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD_DESCRIPTION;
    description.textContent = post.description;
  
    const date = document.createElement('span');
    date.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD_DATE;
    date.textContent = new Date(post.lastModified * 1000).toLocaleDateString();
  
    const link = document.createElement('a');
    link.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD_LINK;
    link.href = post.path;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  
    const icon = document.createElement('span');
    icon.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.INSTAGRAM_ICON;
    icon.setAttribute('aria-label', 'View on Instagram');
  
    link.appendChild(icon);
    content.appendChild(description);
    content.appendChild(date);
    content.appendChild(link);
    card.appendChild(image);
    card.appendChild(content);
  
    return card;
  }
  
  /**
   * Creates navigation arrows for the carousel
   * @returns {HTMLElement} - The navigation container
   */
  function createNavigation() {
    const nav = document.createElement('div');
    nav.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.NAVIGATION;
  
    const leftArrow = document.createElement('button');
    leftArrow.className = `${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.ARROW} ${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.ARROW_LEFT}`;
    leftArrow.setAttribute('aria-label', 'Previous posts');
  
    const rightArrow = document.createElement('button');
    rightArrow.className = `${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.ARROW} ${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.ARROW_RIGHT}`;
    rightArrow.setAttribute('aria-label', 'Next posts');
  
    nav.appendChild(leftArrow);
    nav.appendChild(rightArrow);
  
    return nav;
  }
  
  /**
   * Handles carousel navigation
   * @param {HTMLElement} wrapper - The carousel wrapper element
   * @param {HTMLElement} leftArrow - The left arrow button
   * @param {HTMLElement} rightArrow - The right arrow button
   */
  function setupCarouselNavigation(wrapper, leftArrow, rightArrow) {
    let currentIndex = 0;
    const cards = wrapper.querySelectorAll(`.${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CARD}`);
    const totalCards = cards.length;
    const cardsPerView = SOCIAL_MEDIA_CAROUSEL_CONFIG.CARDS_PER_VIEW;
  
    function updateNavigation() {
      leftArrow.disabled = currentIndex === 0;
      rightArrow.disabled = currentIndex >= totalCards - cardsPerView;
    }
  
    function moveCarousel(direction) {
      const cardWidth = cards[0].offsetWidth;
      const moveAmount = direction * cardWidth * cardsPerView;
      
      currentIndex = Math.max(0, Math.min(currentIndex + direction, totalCards - cardsPerView));
      wrapper.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      updateNavigation();
    }
  
    leftArrow.addEventListener('click', () => moveCarousel(-1));
    rightArrow.addEventListener('click', () => moveCarousel(1));
    updateNavigation();
  }
  
  /**
   * Main decorate function for the Social Media Carousel block
   * @param {HTMLElement} block - The block element
   */
  export default async function decorate(block) {
    // Parse configuration from block
    const config = {
      account: block.textContent.match(/account=([^,)]+)/)?.[1] || SOCIAL_MEDIA_CAROUSEL_CONFIG.DEFAULT_ACCOUNT,
      count: parseInt(block.textContent.match(/count=(\d+)/)?.[1] || SOCIAL_MEDIA_CAROUSEL_CONFIG.DEFAULT_COUNT, 10),
      showDate: !block.textContent.includes('showDate=false'),
    };
  
    // Clear block content
    block.textContent = '';
    block.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.CONTAINER;
  
    // Create wrapper for carousel
    const wrapper = document.createElement('div');
    wrapper.className = SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.WRAPPER;
    block.appendChild(wrapper);
  
    try {
      // Fetch social media posts
      const response = await fetch('/query-index.json');
      if (!response.ok) {
        throw new Error(SOCIAL_MEDIA_CAROUSEL_CONFIG.ERROR_MESSAGES.API_ERROR);
      }
  
      const data = await response.json();
      const posts = data.data.slice(0, config.count);
  
      if (posts.length === 0) {
        throw new Error(SOCIAL_MEDIA_CAROUSEL_CONFIG.ERROR_MESSAGES.NO_POSTS);
      }
  
      // Create and append post cards
      posts.forEach((post) => {
        const card = createPostCard(post);
        wrapper.appendChild(card);
      });
  
      // Add navigation
      const navigation = createNavigation();
      block.appendChild(navigation);
  
      // Setup carousel functionality
      setupCarouselNavigation(
        wrapper,
        navigation.querySelector(`.${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.ARROW_LEFT}`),
        navigation.querySelector(`.${SOCIAL_MEDIA_CAROUSEL_CONFIG.CLASSES.ARROW_RIGHT}`),
      );
  
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = error.message;
      block.appendChild(errorMessage);
    }
  } 