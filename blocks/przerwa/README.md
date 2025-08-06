# Przerwa

A simple spacing block that creates a visual break in content with configurable height.

## Features

- Creates visual spacing between content sections
- Configurable height using CSS variables
- Multiple size variations available
- Responsive design
- Accessibility-friendly (hidden from screen readers)
- Lightweight implementation

## Usage

| Przerwa |
| :------ |

## Variations

The block supports different height variations:

| Przerwa (small) |
| :-------------- |

| Przerwa (medium) |
| :--------------- |

| Przerwa (large) |
| :-------------- |

| Przerwa (xlarge) |
| :--------------- |

## Authoring

To add a spacing break in your document:

1. In Google Docs or Microsoft Word, create a table with one column
2. Add "Przerwa" in the first cell
3. For different sizes, add the variation in parentheses (e.g., "Przerwa (large)")
4. The block will automatically create the appropriate spacing

## Styling

The block uses CSS variables for easy customization:

- `--przerwa-height`: Controls the height of the break (default: 1rem)
- `--przerwa-width`: Controls the width of the break (default: 100%)

### Available Variations

- `small`: 0.5rem height
- `medium`: 1rem height (default)
- `large`: 2rem height  
- `xlarge`: 3rem height

## Behavior

This is a purely visual block with no interactive functionality. It creates empty space to separate content sections.

## Dependencies

None. This block uses only vanilla CSS and JavaScript.

## Accessibility

- The block is hidden from screen readers using appropriate ARIA attributes
- Provides visual spacing without interfering with content flow
- Maintains proper document structure

## Performance

- Minimal CSS and JavaScript footprint
- No external dependencies
- Fast rendering with CSS-only styling

## Browser Compatibility

Compatible with all modern browsers that support CSS custom properties (CSS variables).

## Troubleshooting

### Block not showing spacing
- Verify the table structure in your document
- Check that CSS is properly loaded
- Ensure no conflicting styles override the height

### Spacing too large/small
- Use different size variations (small, medium, large, xlarge)
- Customize using CSS variables for specific requirements

## Suggestions

- Use sparingly to avoid excessive whitespace
- Consider semantic meaning when adding breaks
- Test on different screen sizes for consistent spacing
- Combine with other layout blocks for optimal page structure 