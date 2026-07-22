// Configuration object for social media feeds
const config = {
  itemsPerRow: 4,
  itemWidth: 300,
};

/**
 * Fetches the combined YouTube/Facebook/Instagram feed.
 *
 * The feed itself is fetched server-side by a scheduled GitHub Action
 * (see .github/workflows/social-media-feed.yml), which writes the result to
 * social-media-feed.json at the repo root. API tokens live only in GitHub
 * Actions Secrets and are never shipped to the browser.
 * @returns {Promise<Array>} Array of feed items
 */
async function fetchCombinedFeed() {
  try {
    const response = await fetch('/social-media-feed.json');
    if (!response.ok) return [];
    const data = await response.json();
    return (data.items || []).map((item) => ({ ...item, date: new Date(item.date) }));
  } catch (error) {
    // Error fetching social media feed - return empty array
    return [];
  }
}

/**
 * Creates a search form with input field and a magnifying glass button
 * @param {function} onSearch - The search event handler
 * @returns {HTMLElement} The search form element
 */
function createSearchField(onSearch) {
  const searchForm = document.createElement('form');
  searchForm.classList.add('search-form');
  searchForm.setAttribute('role', 'search');

  const searchLabel = document.createElement('label');
  searchLabel.textContent = 'Szukaj';
  searchLabel.htmlFor = 'social-media-search';
  searchLabel.classList.add('search-label');

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'social-media-search';
  searchInput.name = 'social-media-search';
  searchInput.placeholder = 'Search feeds...';
  searchInput.classList.add('search-input');

  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.classList.add('search-button');
  searchButton.innerHTML = '🔍'; // Magnifying glass emoji
  searchButton.setAttribute('aria-label', 'Search');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    onSearch(searchInput.value);
  });

  searchForm.appendChild(searchLabel);
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);

  return searchForm;
}

/**
 * Creates a filter button
 * @param {string} type - The type of feed ('all', 'youtube', 'facebook', or 'instagram')
 * @param {function} onClick - The click event handler
 * @returns {HTMLElement} The filter button element
 */
function createFilterButton(type, onClick) {
  const button = document.createElement('button');
  button.classList.add('filter-button', `filter-${type}`);
  button.addEventListener('click', onClick);

  if (type !== 'all') {
    const logo = document.createElement('img');
    logo.src = `/blocks/social-media-feeds/${type}-logo.png`;
    logo.alt = `${type} logo`;
    logo.classList.add('filter-logo');
    button.appendChild(logo);
  }

  const text = document.createElement('span');
  text.textContent = type.charAt(0).toUpperCase() + type.slice(1);
  button.appendChild(text);

  return button;
}

/**
 * Creates a feed item element
 * @param {Object} item - Feed item data
 * @returns {HTMLElement} Feed item element
 */
function createFeedItem(item) {
  const feedItem = document.createElement('a');
  feedItem.classList.add('social-media-feed-item');
  feedItem.href = item.link;
  feedItem.target = '_blank';
  feedItem.rel = 'noopener noreferrer';

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image-wrapper');

  const image = document.createElement('img');
  image.src = item.image;
  image.alt = item.title;
  image.loading = 'lazy';
  image.width = config.itemWidth;
  imageWrapper.appendChild(image);

  const logo = document.createElement('img');
  logo.classList.add('social-media-logo');
  logo.src = `/blocks/social-media-feeds/${item.type}-logo.png`;
  logo.alt = `${item.type} logo`;
  imageWrapper.appendChild(logo);

  feedItem.appendChild(imageWrapper);

  const title = document.createElement('h3');
  title.textContent = item.title;
  feedItem.appendChild(title);

  const date = document.createElement('p');
  date.textContent = item.date.toLocaleDateString();
  feedItem.appendChild(date);

  return feedItem;
}

/**
 * Creates a load more button
 * @param {function} onClick - The click event handler
 * @returns {HTMLElement} The load more button element
 */
function createLoadMoreButton(onClick) {
  const button = document.createElement('button');
  button.classList.add('filter-button', 'load-more-button');
  button.textContent = 'Load More';
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Decorates the social media feeds block
 * @param {Element} block The social media feeds block element
 */
export default async function decorate(block) {
  const feedContainer = document.createElement('div');
  feedContainer.classList.add('social-media-feed-container');

  const filterContainer = document.createElement('div');
  filterContainer.classList.add('filter-container');

  const rawFeed = await fetchCombinedFeed();

  const combinedFeed = rawFeed
    .filter((item) => item.image && item.link && !Number.isNaN(item.date.getTime()))
    .sort((a, b) => b.date - a.date);

  let currentFeedIndex = 0;
  const feedsPerPage = 18;

  function renderFeed(feed, append = false) {
    if (!append) {
      feedContainer.innerHTML = '';
      currentFeedIndex = 0;
    }

    const feedsToRender = feed.slice(currentFeedIndex, currentFeedIndex + feedsPerPage);
    feedsToRender.forEach((item) => {
      const feedItem = createFeedItem(item);
      feedContainer.appendChild(feedItem);
    });

    currentFeedIndex += feedsToRender.length;

    // Remove existing load more button if any
    const existingLoadMoreButton = block.querySelector('.load-more-button');
    if (existingLoadMoreButton) {
      existingLoadMoreButton.remove();
    }

    // Add load more button if there are more feeds to show
    if (currentFeedIndex < feed.length) {
      const loadMoreButton = createLoadMoreButton(() => renderFeed(feed, true));
      block.appendChild(loadMoreButton);
    }
  }

  function createFilterHandler(type) {
    return () => {
      const filteredFeed = type === 'all'
        ? combinedFeed
        : combinedFeed.filter((item) => item.type === type);
      renderFeed(filteredFeed);

      // Update active button
      filterContainer.querySelectorAll('.filter-button').forEach((btn) => {
        btn.classList.toggle('active', btn.classList.contains(`filter-${type}`));
      });
    };
  }

  function handleSearch(keyword) {
    const searchTerm = keyword.toLowerCase();
    const filteredFeed = combinedFeed.filter(
      (item) => item.title.toLowerCase().includes(searchTerm),
    );
    renderFeed(filteredFeed);

    // Reset active state on filter buttons
    filterContainer.querySelectorAll('.filter-button').forEach((btn) => {
      btn.classList.remove('active');
    });
  }

  const searchField = createSearchField(handleSearch);
  const allButton = createFilterButton('all', createFilterHandler('all'));
  const facebookButton = createFilterButton('facebook', createFilterHandler('facebook'));
  const instagramButton = createFilterButton('instagram', createFilterHandler('instagram'));
  const youtubeButton = createFilterButton('youtube', createFilterHandler('youtube'));

  filterContainer.appendChild(searchField);
  filterContainer.appendChild(allButton);
  filterContainer.appendChild(facebookButton);
  filterContainer.appendChild(instagramButton);
  filterContainer.appendChild(youtubeButton);

  block.appendChild(filterContainer);
  block.appendChild(feedContainer);

  // Initially render all feeds and set 'all' button as active
  renderFeed(combinedFeed);
  allButton.classList.add('active');

  // Add 'social-media-page' class to the body
  document.body.classList.add('social-media-page');
}
