# Contact Block

A contact information block with an embedded Google Maps location.

## Features
- Contact information display
- Embedded Google Maps
- Responsive layout
- Dark mode support

## Usage
Create a table with two columns in your document:

| Contact |
|---------|
| # Contact Us |
| Address: Zespół Placówek Oświatowych „Scherzo" |
| Phone: +48 123 456 789 |
| Email: contact@example.com |

## Styling
The block uses CSS variables for customization:
- `--section-width`: Maximum width of the contact section
- `--heading-color`: Color of headings
- `--text-color-dark`: Text color in dark mode
- `--heading-color-dark`: Heading color in dark mode
- `--border-radius`: Border radius for the map container

## Accessibility
- The map iframe includes proper ARIA attributes
- Keyboard navigation supported
- Screen reader friendly structure

## Browser Compatibility
- Works in all modern browsers
- Fallback styling for older browsers 