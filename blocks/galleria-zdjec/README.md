# Galleria Zdjec

This Franklin block creates an interactive image gallery with lazy loading and modal functionality.

## Usage

Create a table in your Markdown file with the heading "Galleria Zdjec" and add images to the table cells.

| Galleria Zdjec |
|-----------------|
| ![Image 1](path/to/image1.jpg) |
| ![Image 2](path/to/image2.jpg) |
| ![Image 3](path/to/image3.jpg) |
| ![Image 4](path/to/image4.jpg) |

## Authoring

1. In Google Docs or Microsoft Word, create a table with the heading "Galleria Zdjec".
2. Add images to the table cells.
3. The block will automatically transform the table into an interactive image gallery.

## Styling

The block uses CSS variables for easy customization:

- `--galleria-zdjec-max-width`: Maximum width of the gallery (default: 900px)
- `--galleria-zdjec-thumbnail-size`: Size of thumbnail images (default: 250px)
- `--galleria-zdjec-border-radius`: Border radius for thumbnails and modal (default: 25px)
- `--galleria-zdjec-hover-opacity`: Opacity of thumbnails on hover (default: 0.8)
- `--galleria-zdjec-modal-bg`: Background color of the modal (default: rgba(0, 0, 0, 0.8))
- `--galleria-zdjec-button-bg`: Background color of the "Load More" button (default: #007bff)
- `--galleria-zdjec-button-color`: Text color of the "Load More" button (default: white)

## Behavior

- Displays up to 16 images initially
- Clicking a thumbnail opens a full-size image in a modal
- "Load More" button appears if there are more than 16 images
- Responsive layout adjusts based on screen size

## Dependencies

- AEM Edge Delivery Services (Franklin)
- `aem.js` for optimized image creation

## Accessibility

- Modal can be closed using the Esc key
- Close button has an aria-label for screen readers
- Images use alt text for descriptions

## Suggestions for Improvement

1. Add keyboard navigation for the gallery and modal
2. Implement image preloading for smoother transitions
3. Add touch swipe gestures for mobile devices
4. Integrate with a CDN for optimized image delivery
5. Add option for captions or titles for each image