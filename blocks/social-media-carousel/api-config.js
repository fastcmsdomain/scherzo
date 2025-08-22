/**
 * Instagram API Configuration
 * To get your access token:
 * 1. Go to https://developers.facebook.com/apps/
 * 2. Create a new app or select existing app
 * 3. Add Instagram Basic Display product
 * 4. Under "Basic Display" → "User Token Generator"
 * 5. Click "Generate Token" (token should start with IGQVJY...)
 */
export default {
  // Your Instagram Basic Display API token
  // Token format should start with IGQVJY...
  // Current token is a Facebook token (EAALxxx...) which won't work
  ACCESS_TOKEN: '',

  // Base URL for Instagram Basic Display API
  API_BASE_URL: 'https://graph.instagram.com/me',

  // API Endpoints
  ENDPOINTS: {
    ME: '',
    MEDIA: '/media',
  },

  // Fields to request from the API
  // Available fields: https://developers.facebook.com/docs/instagram-basic-display-api/reference/media
  FIELDS: {
    MEDIA: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
  },

  // Cache settings to prevent excessive API calls
  CACHE: {
    DURATION: 300000, // 5 minutes in milliseconds
    KEY: 'instagram_feed_cache',
  },

  // Rate limiting to stay within API quotas
  // Instagram Basic Display API limits: 200 requests per user per hour
  RATE_LIMIT: {
    MAX_REQUESTS: 200, // Maximum requests per hour
    WINDOW: 3600000, // 1 hour in milliseconds
  },
};
