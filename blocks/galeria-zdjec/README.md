# Galeria Zdjec Block

A responsive image gallery block with thumbnail grid layout and modal view functionality.

## Features
- Responsive grid layout with 4 images per row
- Thumbnail images with captions
- Modal view for full-size images
- Keyboard navigation support
- Touch-friendly controls
- Accessible design

## Usage
The block transforms a series of images into an interactive gallery. Images should be added in the document with optional captions.

| Galeria Zdjec |
|---------------|
| ![Image 1](path/to/image1.jpg) |
| Caption 1 |
| ![Image 2](path/to/image2.jpg) |
| Caption 2 |

## Configuration
The block uses CSS variables for easy customization:

- --gallery-gap: Space between thumbnails (default: 2rem)
- --thumbnail-width: Width of thumbnails (default: 300px)
- --thumbnail-height: Height of thumbnails (default: 250px)
- --shadow-color: Color of thumbnail shadow
- --modal-bg: Modal background color
- --modal-control-color: Color of modal controls

## Accessibility
- Keyboard navigation support (Enter, Escape, Arrow keys)
- ARIA labels for all interactive elements
- Focus management for modal dialog
- Screen reader friendly structure

## Performance
- Optimized image loading
- Minimal DOM manipulation
- Efficient event handling
- Smooth transitions

## Browser Compatibility
- Works in all modern browsers
- Fallback support for older browsers
- Responsive design for all screen sizes

## Troubleshooting
- Ensure images are properly formatted and optimized
- Check image paths are correct
- Verify proper document structure for captions 