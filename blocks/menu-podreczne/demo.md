# Menu Podreczne Demo

This demonstration showcases the Menu Podreczne block's functionality for providing contextual bottom navigation across pages with hierarchical content structure.

## How It Works

The Menu Podreczne block creates a dynamic fixed bottom navigation bar that:

- Automatically detects the current page's position in your site hierarchy
- Shows relevant sibling pages and their subpages
- Appears when you scroll down 300px and hides when scrolling back up
- Groups subpages under collapsible + icons for better organization
- Only displays when there's relevant navigation content to show

## Example Implementation

| Menu Podreczne |
| :------------- |

## Navigation Behavior Examples

### On a Parent Page (e.g., /page-1)
When viewing a parent page that has siblings and children, the menu displays:
- All sibling pages at the same level
- Subpages grouped under their parent with expandable + buttons

Example menu content:
```
Page 1 [+]     Page 2 [+]     Page 3
```

Clicking the + button for Page 1 reveals:
```
Page 1 [−]
├ Page 1-1
├ Page 1-2
└ Page 1-3
```

### On a Subpage (e.g., /page-1/page-1-2)
When viewing a subpage, the menu shows the parent page with all its children:
```
Page 1 [+]
├ Page 1-1
├ Page 1-2 (highlighted as current)
└ Page 1-3
```

### Scroll Interaction
- Scroll down 300px → Menu slides up from bottom
- Scroll back up above 300px → Menu slides down and hides
- Smooth animations provide polished user experience

## Customization Options

The block can be styled using CSS custom properties:

`Customizing Menu Appearance`
`.menu-podreczne {
  --menu-height: 70px;
  --menu-bg-color: #f8f9fa;
  --menu-text-color: #333;
  --menu-link-hover-color: #007bff;
  --menu-active-color: #0056b3;
}`

## Accessibility Features

- Full keyboard navigation support
- ARIA labels and roles for screen readers
- High contrast mode compatibility
- Focus management for submenu interactions
- Escape key closes all open submenus

## Use Cases

**Educational Websites**: Navigate between course modules and lessons
**Documentation Sites**: Move between guide sections and subsections
**Corporate Sites**: Browse service categories and specific offerings
**Blogs**: Access article series and related posts
**Product Catalogs**: Explore product categories and individual items

## Integration Notes

The block automatically integrates with your site's existing navigation structure by:
1. Reading page hierarchy from query-index.json
2. Analyzing current page path to determine context
3. Building relevant navigation dynamically
4. Updating active states based on current location

No manual configuration required - just add the block to your pages and it handles the rest!

## Technical Requirements

- Modern browser with ES6+ support
- Access to site's query-index.json endpoint
- CSS custom properties support
- JavaScript enabled for interactive features

## Performance Optimizations

- Lazy loading of menu content
- Throttled scroll event handlers
- Minimal DOM manipulation
- Efficient memory management
- CSS transforms for smooth animations

| metadata        |                                                                                                            |
| :-------------- | :--------------------------------------------------------------------------------------------------------- |
| title           | Menu Podreczne Demo                                                                                        |
| description     | A demonstration of the Menu Podreczne block for contextual bottom navigation                              |
| json-ld         | article                                                                                                    |
| image           | https://allabout.network/media_188fa5bcd003e5a2d56e7ad3ca233300c9e52f1e5.png                              |
| author          | Szymon Sznajder                                                                                            |
| longdescription | This page showcases the Menu Podreczne block functionality for dynamic bottom navigation in Franklin EDS. | 