/**
 * Menu Podreczne Block
 * A fixed bottom navigation bar with dynamic page links and collapsible subpages
 */

// Configuration object for the menu-podreczne block
const MENU_PODRECZNE_CONFIG = {
  SCROLL_THRESHOLD: 0,
  QUERY_INDEX_ENDPOINT: '/query-index.json',
  ERROR_MESSAGE: 'Error loading navigation data:',
  ANIMATION_DURATION: 300,
  SUBMENU_TOGGLE_CLASS: 'submenu-toggle',
  ACTIVE_CLASS: 'active',
  EXPANDED_CLASS: 'expanded',
  HIDDEN_CLASS: 'hidden',
  VISIBLE_CLASS: 'visible'
};

// CSS selectors for the menu components
const SELECTORS = {
  menuContainer: '.menu-podreczne',
  menuList: '.menu-podreczne__list',
  menuItem: '.menu-podreczne__item',
  submenuToggle: '.menu-podreczne__submenu-toggle',
  submenu: '.menu-podreczne__submenu',
  link: '.menu-podreczne__link'
};

/**
 * Custom error class for menu-specific errors
 */
class MenuPodreczneError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MenuPodreczneError';
  }
}

/**
 * Fetches navigation data from the query index
 * @returns {Promise<Object>} Navigation data
 */
async function fetchNavigationData() {
  try {
    const response = await fetch(MENU_PODRECZNE_CONFIG.QUERY_INDEX_ENDPOINT);
    if (!response.ok) {
      throw new MenuPodreczneError(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(MENU_PODRECZNE_CONFIG.ERROR_MESSAGE, error);
    throw error;
  }
}

/**
 * Gets the current page path
 * @returns {string} Current page path
 */
function getCurrentPath() {
  return window.location.pathname;
}

/**
 * Builds navigation hierarchy from flat data structure
 * @param {Array} pages - Array of page objects
 * @returns {Array} Hierarchical navigation structure
 */
function buildNavigationHierarchy(pages) {
  const hierarchy = [];
  const pathMap = new Map();

  // Sort pages by path to ensure proper hierarchy
  const sortedPages = pages.sort((a, b) => a.path.localeCompare(b.path));

  sortedPages.forEach(page => {
    const pathParts = page.path.split('/').filter(part => part);
    const depth = pathParts.length;
    
    pathMap.set(page.path, { ...page, depth, children: [] });
  });

  // Build parent-child relationships
  pathMap.forEach((page, path) => {
    const pathParts = path.split('/').filter(part => part);
    
    if (pathParts.length === 1) {
      // Top-level page
      hierarchy.push(page);
    } else {
      // Find parent page
      const parentPath = '/' + pathParts.slice(0, -1).join('/');
      const parent = pathMap.get(parentPath);
      if (parent) {
        parent.children.push(page);
      }
    }
  });

  return hierarchy;
}

/**
 * Gets relevant navigation items for current page
 * @param {Array} hierarchy - Navigation hierarchy
 * @param {string} currentPath - Current page path
 * @returns {Array} Relevant navigation items
 */
function getRelevantNavigation(hierarchy, currentPath) {
  const currentPathParts = currentPath.split('/').filter(part => part);
  const currentDepth = currentPathParts.length;

  if (currentDepth === 1) {
    // On top-level page, show all top-level pages
    return hierarchy;
  }

  // On subpage, find parent and show siblings
  const parentPath = '/' + currentPathParts.slice(0, -1).join('/');
  
  // Find the parent in hierarchy
  function findPageInHierarchy(pages, targetPath) {
    for (const page of pages) {
      if (page.path === targetPath) {
        return page;
      }
      const found = findPageInHierarchy(page.children, targetPath);
      if (found) return found;
    }
    return null;
  }

  const parent = findPageInHierarchy(hierarchy, parentPath);
  if (parent && parent.children.length > 0) {
    return [parent]; // Return parent with its children
  }

  return [];
}

/**
 * Creates a menu item element
 * @param {Object} page - Page object
 * @param {string} currentPath - Current page path
 * @returns {HTMLElement} Menu item element
 */
function createMenuItem(page, currentPath) {
  const item = document.createElement('li');
  item.classList.add('menu-podreczne__item');

  const link = document.createElement('a');
  link.href = page.path;
  link.classList.add('menu-podreczne__link');
  link.textContent = page.title;
  
  if (page.path === currentPath) {
    link.classList.add(MENU_PODRECZNE_CONFIG.ACTIVE_CLASS);
  }

  item.appendChild(link);

  // Add submenu if page has children
  if (page.children && page.children.length > 0) {
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('menu-podreczne__submenu-toggle');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', `Toggle submenu for ${page.title}`);
    toggleButton.innerHTML = '<span class="menu-podreczne__plus-icon">+</span>';
    
    const submenu = document.createElement('ul');
    submenu.classList.add('menu-podreczne__submenu');
    submenu.setAttribute('role', 'menu');

    page.children.forEach(child => {
      const childItem = createMenuItem(child, currentPath);
      childItem.setAttribute('role', 'menuitem');
      submenu.appendChild(childItem);
    });

    item.appendChild(toggleButton);
    item.appendChild(submenu);

    // Add click handler for submenu toggle
    toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSubmenu(toggleButton, submenu);
    });
  }

  return item;
}

/**
 * Toggles submenu visibility
 * @param {HTMLElement} toggleButton - Toggle button element
 * @param {HTMLElement} submenu - Submenu element
 */
function toggleSubmenu(toggleButton, submenu) {
  const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;

  toggleButton.setAttribute('aria-expanded', newState.toString());
  submenu.classList.toggle(MENU_PODRECZNE_CONFIG.EXPANDED_CLASS, newState);
  
  const icon = toggleButton.querySelector('.menu-podreczne__plus-icon');
  if (icon) {
    icon.textContent = newState ? '−' : '+';
  }
}

/**
 * Handles scroll behavior for showing/hiding menu
 * @param {HTMLElement} menuContainer - Menu container element
 */
function handleScrollBehavior(menuContainer) {
  let lastScrollY = window.scrollY;
  let isVisible = false;

  function updateMenuVisibility() {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

    if (scrollDirection === 'down' && currentScrollY > MENU_PODRECZNE_CONFIG.SCROLL_THRESHOLD && !isVisible) {
      // Show menu
      menuContainer.classList.add(MENU_PODRECZNE_CONFIG.VISIBLE_CLASS);
      menuContainer.classList.remove(MENU_PODRECZNE_CONFIG.HIDDEN_CLASS);
      isVisible = true;
    } else if (scrollDirection === 'up' && currentScrollY < MENU_PODRECZNE_CONFIG.SCROLL_THRESHOLD && isVisible) {
      // Hide menu
      menuContainer.classList.add(MENU_PODRECZNE_CONFIG.HIDDEN_CLASS);
      menuContainer.classList.remove(MENU_PODRECZNE_CONFIG.VISIBLE_CLASS);
      isVisible = false;
    }

    lastScrollY = currentScrollY;
  }

  // Throttled scroll handler
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateMenuVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Checks if current page should show the menu
 * @param {Array} hierarchy - Navigation hierarchy
 * @param {string} currentPath - Current page path
 * @returns {boolean} Whether to show the menu
 */
function shouldShowMenu(hierarchy, currentPath) {
  const relevantNav = getRelevantNavigation(hierarchy, currentPath);
  return relevantNav.length > 0 && relevantNav.some(page => page.children && page.children.length > 0);
}

/**
 * Renders the navigation menu
 * @param {HTMLElement} block - Block container element
 * @param {Array} navigationItems - Navigation items to render
 * @param {string} currentPath - Current page path
 */
function renderNavigation(block, navigationItems, currentPath) {
  const menuList = block.querySelector(SELECTORS.menuList);
  if (!menuList) return;

  // Clear existing items
  menuList.innerHTML = '';

  navigationItems.forEach(page => {
    const menuItem = createMenuItem(page, currentPath);
    menuList.appendChild(menuItem);
  });
}

/**
 * Main decoration function for the menu-podreczne block
 * @param {HTMLElement} block - Block container element
 */
export default async function decorate(block) {
  try {
    // Fetch navigation data
    const navigationData = await fetchNavigationData();
    const hierarchy = buildNavigationHierarchy(navigationData.data || []);
    const currentPath = getCurrentPath();

    // Check if menu should be shown for current page
    if (!shouldShowMenu(hierarchy, currentPath)) {
      block.style.display = 'block';
      return;
    }

    // Create menu structure
    const menuContainer = document.createElement('nav');
    menuContainer.classList.add('menu-podreczne__nav');
    menuContainer.setAttribute('aria-label', 'Bottom navigation menu');

    const menuList = document.createElement('ul');
    menuList.classList.add('menu-podreczne__list');
    menuList.setAttribute('role', 'menubar');

    menuContainer.appendChild(menuList);
    block.appendChild(menuContainer);

    // Get relevant navigation items and render
    const relevantNavigation = getRelevantNavigation(hierarchy, currentPath);
    renderNavigation(block, relevantNavigation, currentPath);

    // Set up scroll behavior
    handleScrollBehavior(block);

    // Add keyboard navigation support
    block.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close all submenus on Escape
        const expandedToggles = block.querySelectorAll('[aria-expanded="true"]');
        expandedToggles.forEach(toggle => {
          const submenu = toggle.nextElementSibling;
          if (submenu) {
            toggleSubmenu(toggle, submenu);
          }
        });
      }
    });

    // Mark block as initialized
    block.classList.add('menu-podreczne--initialized');

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(MENU_PODRECZNE_CONFIG.ERROR_MESSAGE, error);
    
    // Graceful error handling - hide the block
    block.style.display = 'none';
  }
}