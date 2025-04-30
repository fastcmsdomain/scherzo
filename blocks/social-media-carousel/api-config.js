/**
 * Instagram API Configuration
 * To get your access token:
 * 1. Go to https://developers.facebook.com/apps/
 * 2. Create a new app or select existing app
 * 3. Add Instagram Basic Display product
 * 4. Configure OAuth and add test users
 * 5. Generate token from Basic Display section
 */
export default {
  // Your Instagram access token from Facebook Developer Console
  // Token format: IGQWRPxxx... (long string)
  ACCESS_TOKEN: 'EAALKZAwHGvLABOZCmjDQsZAExCjXP2kjypkCgZBq2zilElECypKqHWMEWu2P72YRJbGpheUuf9vXlD0Eul4jCD1HZBe2ugNFlQDSTFgmDRd2YzZCXjTJ15CKosi04J63e1vAChfiHb6SDNS4qJDoS4Fu6gZBVDgpP1YnziPfCHa44e7LRYNZCNFqmkdcqg3PHhSr',

  // Base URL for Instagram Graph API
  API_BASE_URL: 'https://graph.instagram.com/v18.0',
  
  // Endpoints
  ENDPOINTS: {
    ME: '/me',
    MEDIA: '/me/media',
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