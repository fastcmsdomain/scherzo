# Menu Podreczne

A dynamic fixed bottom navigation bar that displays contextual page navigation with collapsible submenus. The menu appears when users scroll down 300px and hides when scrolling back up, providing easy access to related pages and their subpages.

## Features

- Fixed bottom positioning with 100% viewport width
- Dynamic content based on current page hierarchy
- Scroll-triggered visibility (shows at 300px scroll down)
- Collapsible submenus with + icon toggles
- Responsive design for all screen sizes
- Full accessibility support with ARIA attributes
- Keyboard navigation support (Escape to close submenus)
- Automatic page hierarchy detection from query-index.json
- Smooth animations and transitions
- Dark mode and high contrast support

## Usage

| Menu Podreczne |
| :------------- |

The block automatically fetches navigation data and determines which pages to display based on the current page location in the site hierarchy.

## Navigation Logic

The menu displays:

- **Top-level pages**: When on a parent page, shows all sibling pages at the same level
- **Subpages**: Child pages are grouped under their parent with a collapsible + button
- **Current page highlighting**: Active page is visually emphasized
- **Contextual display**: Only shows when current page has related navigation (siblings or children)

### Example Navigation Structure

```
Page 1 [+]
├── Page 1-1
├── Page 1-2
├── Page 1-3
└── Page 1-14
Page 2 [+]
├── Page 2-1
├── Page 2-2
├── Page 2-3
└── Page 2-4
```

## Authoring

No manual authoring required. The block automatically:

1. Fetches page data from `/query-index.json`
2. Builds navigation hierarchy from page paths
3. Determines relevant navigation for current page
4. Renders appropriate menu items with submenus

## Styling

The block uses CSS custom properties for easy customization:

- `--menu-height`: Height of the navigation bar (default: 60px)
- `--menu-bg-color`: Background color
- `--menu-text-color`: Text color
- `--menu-link-hover-color`: Hover state color
- `--menu-active-color`: Active page color
- `--menu-animation-duration`: Animation timing (default: 0.3s)
- `--menu-spacing`: Internal spacing
- `--menu-z-index`: Stacking order (default: 1000)

### CSS Classes

- `.menu-podreczne`: Main container
- `.menu-podreczne__nav`: Navigation wrapper
- `.menu-podreczne__list`: Menu list container
- `.menu-podreczne__item`: Individual menu items
- `.menu-podreczne__link`: Navigation links
- `.menu-podreczne__submenu-toggle`: Submenu toggle buttons
- `.menu-podreczne__submenu`: Submenu containers
- `.visible`: Menu is visible
- `.hidden`: Menu is hidden
- `.active`: Current page link
- `.expanded`: Expanded submenu

## Behavior

### Scroll Behavior
- Menu appears when scrolling down past 300px
- Menu hides when scrolling up above 300px
- Smooth slide-up/slide-down animations

### Submenu Interaction
- Click + button to expand/collapse submenus
- Submenus expand upward from bottom bar
- Maximum height with scroll for long submenu lists
- Escape key closes all open submenus

### Responsive Features
- Horizontal scrolling on mobile for long menu lists
- Adjusted sizing for tablet and mobile viewports
- Touch-friendly button sizes
- Optimized spacing for different screen sizes

## Dependencies

- Requires `/query-index.json` endpoint for navigation data
- Uses CSS custom properties for theming
- Leverages modern JavaScript (ES6+) features

## Accessibility

- Full ARIA support with proper roles and attributes
- Keyboard navigation support
- Focus management and visual indicators
- Screen reader compatible
- High contrast mode support
- Reduced motion support for accessibility preferences

### ARIA Attributes
- `role="menubar"` on main list
- `role="menu"` on submenus
- `role="menuitem"` on submenu items
- `aria-expanded` on toggle buttons
- `aria-label` for descriptive button labels

### Keyboard Navigation
- Tab/Shift+Tab for focus navigation
- Enter/Space to activate links and toggle submenus
- Escape to close all open submenus
- Arrow keys for menu navigation (future enhancement)

## Performance

### Loading Strategy
- Eager loading of navigation data
- Lazy rendering of menu items
- Efficient scroll event handling with `requestAnimationFrame`
- Minimal DOM manipulation

### Optimization Techniques
- Throttled scroll listeners
- Event delegation for submenu interactions
- CSS transforms for smooth animations
- Minimal reflows and repaints

## Browser Compatibility

- Modern browsers supporting ES6+ features
- CSS Grid and Flexbox support required
- CSS custom properties support required
- Graceful degradation for older browsers

## Troubleshooting

### Menu Not Appearing
- Check if `/query-index.json` is accessible
- Verify current page has related navigation (siblings or children)
- Ensure proper page path structure in navigation data
- Check console for JavaScript errors

### Scroll Behavior Issues
- Verify scroll threshold configuration (300px default)
- Check for CSS conflicts with `position: fixed`
- Ensure proper z-index stacking
- Test on different viewport sizes

### Submenu Problems
- Verify page hierarchy in navigation data
- Check for proper parent-child path relationships
- Ensure submenu container styling is correct
- Test JavaScript console for toggle errors

### Performance Issues
- Monitor scroll event frequency
- Check for memory leaks in event listeners
- Verify efficient DOM querying
- Test on various devices and browsers

## Configuration Options

The block can be customized through CSS custom properties:

```css
.menu-podreczne {
  --menu-height: 70px;
  --menu-bg-color: #f8f9fa;
  --menu-text-color: #333333;
  --menu-link-hover-color: #007bff;
  --menu-active-color: #0056b3;
  --menu-animation-duration: 0.4s;
}
```

## Technical Notes

- Uses `transform: translateY()` for smooth show/hide animations
- Implements defensive coding practices with error handling
- Follows Franklin/EDS block development guidelines
- Uses semantic HTML for better accessibility
- Implements modern CSS features with fallbacks 