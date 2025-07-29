# Download Block

A block for displaying downloadable PDF files with file size information and a consistent visual style.

## Features
- Visual PDF file icon
- File size display
- Hover effects and animations
- Responsive design
- Accessible download links

## Usage
Create a table in your document with a link to the PDF file:

| preview |
|----------|
| [Document Name.pdf](/path/to/document.pdf) |

## Configuration
The block can be customized using CSS variables:

- --download-primary-color: Main text and icon color
- --download-hover-color: Color on hover
- --download-background: Background color
- --download-border-color: Border color
- --download-border-radius: Border radius
- --download-padding: Internal padding
- --download-transition: Animation timing

## Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Clear visual feedback
- Screen reader friendly

## Performance
- Lightweight SVG icons
- Minimal DOM manipulation
- Efficient file size calculation
- Optimized CSS transitions

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting
1. File size not showing
   - Check if the server supports HEAD requests
   - Verify file permissions
2. Styling issues
   - Ensure CSS variables are properly defined
   - Check for CSS conflicts

## Dependencies
- None (vanilla JavaScript) 