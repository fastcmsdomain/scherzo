# Scherzo Project - Coding Standards for Cursor AI

## JavaScript Rules (ESLint)

### Variables & Functions
- Use `const` for variables that don't change (`prefer-const`)
- Remove unused variables/parameters (`no-unused-vars`)
- Declare variables before using (`no-undef`)
- Define functions before calling them (`no-use-before-define`)
- Don't shadow variables (`no-shadow`)

### Modern JavaScript
- Use template literals: `\`Hello ${name}\`` not `'Hello ' + name`
- Use destructuring: `const { href } = link` not `const href = link.href`
- Use parentheses in arrows: `(item) => {}` not `item => {}`
- Use array methods instead of `for...of` loops

### Code Structure
- Declare functions at top level of their scope (`no-inner-declarations`)
- Make class methods `static` if they don't use `this`
- Add trailing commas in objects/arrays
- No blank lines at start/end of blocks
- End files with newline
- Remove trailing spaces
- Keep lines under 100 characters

### Imports/Exports
```javascript
// ❌ Don't use
export { default } from './file.js';

// ✅ Use instead
import decorate from './file.js';
export default decorate;
```

### Console Statements
```javascript
// Add disable comment for intentional console use
// eslint-disable-next-line no-console
console.log('Debug info');
```

## CSS Rules (Stylelint)

### Selector Organization
- Order selectors from least to most specific
- Base selectors before hover/focus states
- No duplicate selectors - consolidate them

### Naming
- Use kebab-case: `.my-button` not `.myButton`
- For BEM components, add: `/* stylelint-disable selector-class-pattern */`

### Properties
- No duplicate properties
- Use shorthand properties when possible
- Use modern color functions
- No units on zero values
- Use lowercase keywords

### Spacing
- Add empty lines before rules, comments, and at-rules
- Remove vendor prefixes (use autoprefixer)

## Quick Fix Commands
```bash
# Fix JavaScript
npx eslint . --fix

# Fix CSS  
npx stylelint blocks/**/*.css styles/*.css --fix

# Check all
npm run lint
```

## File Structure

### JavaScript Files
1. Imports
2. Constants/config
3. Utility functions
4. Main functions
5. Default export
6. End with newline

### CSS Files
1. CSS custom properties
2. Base selectors
3. Hover/focus states
4. Media queries
5. End with newline

## Before Submitting Code
- [ ] Run `npm run lint`
- [ ] Fix all errors (not just warnings)
- [ ] Check file ends with newline
- [ ] No trailing spaces
- [ ] Functions defined before use
- [ ] Modern JS/CSS syntax used
