# Social Media Carousel Block

A dynamic carousel block that displays Instagram feed posts with images, descriptions, and dates. The carousel shows 3 posts at a time with navigation arrows and auto-scrolling functionality.

## Features

- Displays 3 visible Instagram posts at a time
- Smooth sliding transitions between posts
- Auto-scrolling with pause on hover
- Responsive design for all screen sizes
- Instagram icon integration
- Loading and error states
- Accessible navigation controls
- Customizable styling through CSS variables
- Instagram API integration with caching
- Rate limiting protection

## Usage

| Social Media Carousel |
|----------------------|
| Instagram Feed |

## Configuration

### Instagram API Setup

1. Configure your Instagram access token in `api-config.js`:
```javascript
export default {
  ACCESS_TOKEN: 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE',
  // ... other configuration
};
```

2. The block will automatically use this token to fetch posts from Instagram.

### CSS Variables

The block's appearance can be customized using these CSS variables:

- `--carousel-height`: Height of the carousel (default: 500px)
- `--carousel-width`: Maximum width of the carousel (default: 1200px)
- `--slide-gap`: Space between slides (default: 20px)
- `--slide-border-radius`: Border radius of slides (default: 12px)
- `--transition-duration`: Duration of slide transitions (default: 0.3s)

### JavaScript Configuration

The carousel behavior can be modified through the `CAROUSEL_CONFIG` object:

- `VISIBLE_SLIDES`: Number of visible slides (default: 3)
- `TOTAL_SLIDES`: Maximum number of slides to display (default: 6)
- `SLIDE_WIDTH`: Width of each slide in pixels (default: 400)
- `AUTO_SCROLL_INTERVAL`: Time between auto-scrolls in milliseconds (default: 5000)
- `BACKGROUND_COLORS`: Array of background colors for slides

## Accessibility

- Keyboard navigation support through arrow buttons
- ARIA labels for navigation controls
- Proper image alt text support
- Focus management for interactive elements

## Performance

- Lazy loading of images
- Optimized transitions
- Efficient DOM updates
- Local storage caching of API responses
- Rate limiting protection
- Throttled event listeners

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on mobile devices
- Fallback styles for older browsers

## Instagram API Integration

The block uses the Instagram Graph API to fetch media. To set up:

1. Create a Facebook Developer account
2. Set up an Instagram Basic Display app
3. Generate an access token
4. Add the token to `api-config.js`
5. Configure rate limiting and caching as needed

### API Features

- Automatic caching of API responses
- Configurable cache duration
- Rate limiting protection
- Error handling and fallbacks
- Configurable API fields

## Troubleshooting

Common issues and solutions:

1. **API Authentication Failed**: 
   - Check your access token in `api-config.js`
   - Verify token has not expired
   - Ensure token has correct permissions

2. **Rate Limiting Issues**:
   - Check `RATE_LIMIT` configuration in `api-config.js`
   - Implement proper caching
   - Monitor API usage

3. **Carousel Display Problems**:
   - Check JavaScript console for errors
   - Verify HTML structure
   - Check CSS variable values

4. **Performance Issues**:
   - Enable caching
   - Optimize image sizes
   - Check network requests

## Cache Configuration

The block implements local storage caching:

- Default cache duration: 5 minutes
- Cache key: 'instagram_feed_cache'
- Automatic cache invalidation
- Configurable through `CACHE` settings in `api-config.js`

## Rate Limiting

To prevent API abuse:

- Maximum requests: 200 per hour
- Window size: 1 hour
- Configurable through `RATE_LIMIT` settings in `api-config.js`
- Automatic request throttling

## Example Implementation

```javascript
// Replace mock data with actual Instagram API integration
async function fetchInstagramFeed() {
  const response = await fetch('your-instagram-api-endpoint');
  const data = await response.json();
  return data.map(post => ({
    image: post.media_url,
    description: post.caption,
    date: post.timestamp
  }));
}
```