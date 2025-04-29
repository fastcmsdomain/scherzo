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

## Usage

| Social Media Carousel |
|----------------------|
| Instagram Feed |

## Configuration

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
- Throttled event listeners

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on mobile devices
- Fallback styles for older browsers

## Instagram API Integration

To integrate with the Instagram API:

1. Obtain an Instagram API key
2. Replace the mock data in `fetchInstagramFeed()` with actual API calls
3. Handle rate limiting and error cases
4. Cache responses when appropriate

## Troubleshooting

Common issues and solutions:

1. **Carousel not sliding**: Check if JavaScript is enabled and no console errors
2. **Images not loading**: Verify image URLs and network connectivity
3. **Responsive issues**: Check viewport settings and media queries
4. **Performance problems**: Reduce image sizes and optimize transitions

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