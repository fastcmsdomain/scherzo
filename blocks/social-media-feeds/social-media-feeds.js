// Configuration object for social media feeds
const config = {
  itemsPerRow: 4,
  itemWidth: 300,
  youtubeApiKey: 'AIzaSyCWyexvg44ePgSFHVjQhk8mNrhLBv_UbF8',
  youtubeChannelId: 'UCxtLxK0Wg6ouftRItp8gWNQ',
  facebookAccessToken: 'EAALKZAwHGvLABOZCmjDQsZAExCjXP2kjypkCgZBq2zilElECypKqHWMEWu2P72YRJbGpheUuf9vXlD0Eul4jCD1HZBe2ugNFlQDSTFgmDRd2YzZCXjTJ15CKosi04J63e1vAChfiHb6SDNS4qJDoS4Fu6gZBVDgpP1YnziPfCHa44e7LRYNZCNFqmkdcqg3PHhSr',
  facebookPageId: '475019282357334',
};

/**
 * Fetches YouTube feed
 * @returns {Promise<Array>} Array of YouTube feed items
 */
async function fetchYouTubeFeed() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${config.youtubeApiKey}&channelId=${config.youtubeChannelId}&part=snippet,id&order=date&maxResults=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items.map((item) => ({
      type: 'youtube',
      title: item.snippet.title,
      image: item.snippet.thumbnails.medium.url,
      date: new Date(item.snippet.publishedAt),
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('Error fetching YouTube feed:', error);
    return [];
  }
}

/**
 * Fetches Facebook feed
 * @returns {Promise<Array>} Array of Facebook feed items
 */
async function fetchFacebookFeed() {
  const url = `https://graph.facebook.com/v12.0/${config.facebookPageId}/posts?fields=id,message,full_picture,created_time&access_token=${config.facebookAccessToken}&limit=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.map((item) => ({
      type: 'facebook',
      title: item.message ? item.message.substring(0, 100) : 'No message',
      image: item.full_picture,
      date: new Date(item.created_time),
      link: `https://www.facebook.com/${config.facebookPageId}/posts/${item.id}`,
    }));
  } catch (error) {
    console.error('Error fetching Facebook feed:', error);
    return [];
  }
}

/**
 * Creates a filter button
 * @param {string} type - The type of feed ('all', 'youtube', or 'facebook')
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
 * Decorates the social media feeds block
 * @param {Element} block The social media feeds block element
 */
export default async function decorate(block) {
  const feedContainer = document.createElement('div');
  feedContainer.classList.add('social-media-feed-container');

  const filterContainer = document.createElement('div');
  filterContainer.classList.add('filter-container');

  const [youtubeFeed, facebookFeed] = await Promise.all([
    fetchYouTubeFeed(),
    fetchFacebookFeed(),
  ]);

  const combinedFeed = [...youtubeFeed, ...facebookFeed]
    .sort((a, b) => b.date - a.date)
    .slice(0, 20);

  function renderFeed(feed) {
    feedContainer.innerHTML = '';
    feed.forEach((item) => {
      const feedItem = createFeedItem(item);
      feedContainer.appendChild(feedItem);
    });
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

  const allButton = createFilterButton('all', createFilterHandler('all'));
  const youtubeButton = createFilterButton('youtube', createFilterHandler('youtube'));
  const facebookButton = createFilterButton('facebook', createFilterHandler('facebook'));

  filterContainer.appendChild(allButton);
  filterContainer.appendChild(youtubeButton);
  filterContainer.appendChild(facebookButton);

  block.appendChild(filterContainer);
  block.appendChild(feedContainer);

  // Initially render all feeds and set 'all' button as active
  renderFeed(combinedFeed);
  allButton.classList.add('active');

  // Add 'social-media-page' class to the body
  document.body.classList.add('social-media-page');
}
