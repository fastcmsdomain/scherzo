# Dynamic Navigation from Query Index

This header block now supports dynamically loading navigation links from the `query-index.json` file.

## Features

- **Automatic Fetching**: Fetches navigation data from `https://main--scherzo--fastcmsdomain.aem.live/query-index.json`
- **Hierarchical Structure**: Automatically builds a hierarchical menu based on URL paths
- **Uses Data Columns**:
  - `path` → Navigation link URL
  - `title` → Navigation label text

## How to Enable

To enable dynamic navigation on any page, add the following metadata to your document:

### In Google Docs (Metadata Table)

| Metadata | Value |
|----------|-------|
| dynamic-nav | true |

### In Markdown

```markdown
---
dynamic-nav: true
---
```

## How It Works

1. **Fetches Data**: On page load, the header fetches from `query-index.json`
2. **Builds Hierarchy**: Parses the `path` column to create a nested menu structure
   - `/o-nas` → Top level
   - `/o-nas/przedszkole` → Second level under "o-nas"
   - `/o-nas/przedszkole/program` → Third level under "przedszkole"
3. **Renders Menu**: Creates a navigation menu with the same structure as the original fragment-based navigation

## Example Structure

Given these entries in `query-index.json`:

```json
{
  "data": [
    {"path": "/", "title": "Home"},
    {"path": "/o-nas", "title": "About Us"},
    {"path": "/o-nas/przedszkole", "title": "Kindergarten"},
    {"path": "/o-nas/przedszkole/program", "title": "Program"},
    {"path": "/szkola-podstawowa", "title": "Primary School"}
  ]
}
```

The navigation will be structured as:

```
- Home (/)
- About Us (/o-nas)
  - Kindergarten (/o-nas/przedszkole)
    - Program (/o-nas/przedszkole/program)
- Primary School (/szkola-podstawowa)
```

## Fallback Behavior

If `dynamic-nav` metadata is NOT set or set to `false`, the header will use the original fragment-based navigation loading from `/nav`.

## Functions Added

### `fetchDynamicNavLinks()`
Fetches and parses the query-index.json file.

**Returns**: `Promise<Array>` - Array of navigation items with `path`, `title`, `image`, and `description`

### `buildDynamicNavigation(items)`
Builds a hierarchical navigation structure from flat path array.

**Parameters**: 
- `items` - Array of objects with `path` and `title` properties

**Returns**: `Element` - DOM element ready to be inserted into navigation

## Testing

1. Add `dynamic-nav: true` to your page metadata
2. Reload the page
3. The navigation should now reflect all pages from query-index.json
4. Verify hierarchical structure is correct

## Notes

- The function automatically handles missing data gracefully
- If fetch fails, an empty navigation will be rendered
- All existing menu functionality (slide-in panels, breadcrumbs, etc.) continues to work
- The dynamic navigation respects the same CSS classes and structure as the original

