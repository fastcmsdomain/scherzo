import { createOptimizedPicture } from '../../scripts/aem.js';

// Configuration object for social media feeds
const config = {
  itemsPerRow: 4,
  itemWidth: 300,
  youtubeApiKey: 'AIzaSyCWyexvg44ePgSFHVjQhk8mNrhLBv_UbF8',
  youtubeChannelId: 'UCxtLxK0Wg6ouftRItp8gWNQ',
  facebookAccessToken: 'EAA13ZCNJPLfkBOy7NMBWFk1CFyt8FQ2aleiQMzWZBV8phZBIKTZCXZAJwBAw86PXqWVuudkXjyKZCpIvrSZAMo7zW2opVRZAS6vj27ABRfBP1lFKlXd8GHRmVhBPGCyZBstbkjpAZB6iEk7Vz9FGNngNvPDiKIel8Y5tUfVIec9rEMl4uoiVip21XDxl0u18ScOhlAT1Q3kda7kO1Sx8bqvriSIRIYUho96mv1T6iYcXFGSxbVntDA1kjFdhhJNH1dBgZDZD',
  facebookPageId: '61563821452922',
};

/**
 * Fetches YouTube feed
 * @returns {Promise<Array>} Array of YouTube feed items
 */
async function fetchYouTubeFeed() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${config.youtubeApiKey}&channelId=${config.youtubeChannelId}&part=snippet,id&order=date&maxResults=10`;
  
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
  const url = `https://graph.facebook.com/v12.0/${config.facebookPageId}/posts?fields=id,message,full_picture,created_time&access_token=${config.facebookAccessToken}&limit=10`;
  
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
  block.appendChild(feedContainer);

  // Add 'social-media-page' class to the body
  document.body.classList.add('social-media-page');

  const [youtubeFeed, facebookFeed] = await Promise.all([
    fetchYouTubeFeed(),
    fetchFacebookFeed(),
  ]);

  const combinedFeed = [...youtubeFeed, ...facebookFeed]
    .sort((a, b) => b.date - a.date)
    .slice(0, 20);

  combinedFeed.forEach((item) => {
    const feedItem = createFeedItem(item);
    feedContainer.appendChild(feedItem);
  });
}
