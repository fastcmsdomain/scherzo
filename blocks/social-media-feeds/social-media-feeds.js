// Configuration object for social media feeds
const config = {
  itemsPerRow: 4,
  itemWidth: 300,
  youtubeApiKey: 'AIzaSyCWyexvg44ePgSFHVjQhk8mNrhLBv_UbF8',
  youtubeChannelId: 'UCxtLxK0Wg6ouftRItp8gWNQ',
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

  // Use the original YouTube thumbnail URL directly
  const image = document.createElement('img');
  image.src = item.image;
  image.alt = item.title;
  image.width = config.itemWidth;
  imageWrapper.appendChild(image);

  const logo = document.createElement('img');
  logo.classList.add('social-media-logo');
  logo.src = '/blocks/social-media-feeds/youtube-logo.png';
  logo.alt = 'YouTube logo';
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
  block.appendChild(feedContainer);

  const youtubeFeed = await fetchYouTubeFeed();

  youtubeFeed.forEach((item) => {
    const feedItem = createFeedItem(item);
    feedContainer.appendChild(feedItem);
  });
}
