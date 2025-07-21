# Text Alignment in Franklin from Google Docs

This guide explains how to use text alignment formatting in Google Docs that will be properly rendered in your Franklin/Edge Delivery Services website.

## How It Works

When you format text alignment in Google Docs, Franklin automatically converts these formatting options to HTML `data-align` attributes. Our CSS then applies the appropriate styling based on these attributes.

## Supported Alignments

Franklin supports all standard text alignment options:

- **Left align** - Default alignment (data-align="left")  
- **Center align** - Centers text (data-align="center")
- **Right align** - Aligns text to the right (data-align="right") 
- **Justify** - Justifies text to both margins (data-align="justify")

## How to Use in Google Docs

1. **Select the text** you want to align
2. **Use Google Docs alignment tools**:
   - Click the alignment buttons in the toolbar
   - Or use keyboard shortcuts:
     - `Ctrl+Shift+L` (Windows) / `Cmd+Shift+L` (Mac) for left align
     - `Ctrl+Shift+E` (Windows) / `Cmd+Shift+E` (Mac) for center align  
     - `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac) for right align
     - `Ctrl+Shift+J` (Windows) / `Cmd+Shift+J` (Mac) for justify
3. **Publish or preview** your document

## Technical Implementation

### HTML Output
When you center-align text in Google Docs, Franklin generates HTML like:
`<p data-align="center">Your centered text</p>`

### CSS Handling
Our global CSS applies styles to all elements with data-align attributes:

- `[data-align="center"]` - Centers the element
- `[data-align="center"] *` - Ensures child elements inherit the alignment
- Specific element selectors for paragraphs and headings

## Important Notes

### Block-Level Elements
Text alignment works on:
- Paragraphs
- Headings (H1-H6)
- List items
- Block quotes
- Any text content in blocks

### Inheritance
Alignment is inherited by child elements, so if you align a paragraph, any links or formatted text within it will also be aligned.

### Block Variations
Some blocks may override global alignment for design purposes. Check individual block documentation for specific behavior.

## Examples

### Basic Paragraph Alignment
In Google Docs:
1. Type: "This text will be centered"
2. Select the text
3. Click the center alignment button

Result: The text appears centered on your Franklin site.

### Heading Alignment  
In Google Docs:
1. Create a heading: "# Welcome to Our Site"
2. Select the heading
3. Choose right alignment

Result: The heading appears right-aligned on your Franklin site.

## Troubleshooting

### Alignment Not Working?
1. **Check CSS**: Ensure the global alignment styles are included in `styles/styles.css`
2. **Clear Cache**: Clear browser cache and refresh the page
3. **Block Override**: Some blocks may have specific alignment handling - check block-specific CSS
4. **Publish Status**: Ensure your document is published, not just previewed

### Mobile Considerations
Text alignment is responsive and works across all device sizes. However, very long centered or right-aligned text may be less readable on mobile devices.

## Best Practices

1. **Use Sparingly**: Center and right alignment should be used for emphasis, not body text
2. **Readability First**: Left-aligned text is most readable for longer content
3. **Headers**: Center alignment works well for section headers and titles
4. **Mobile Testing**: Always test aligned content on mobile devices

## Related Features

- **Section Styling**: Use section metadata to style entire sections
- **Block Variations**: Many blocks support alignment variations
- **Custom Styling**: Add custom CSS classes for more advanced alignment needs

## Support

For technical issues with text alignment, check:
1. Browser developer tools for data-align attributes
2. CSS specificity conflicts
3. Block-specific documentation

The global text alignment styles ensure consistent behavior across your entire Franklin site while maintaining the familiar authoring experience in Google Docs. 