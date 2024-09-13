/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  navDrops.forEach((drop) => {
    if (!drop.hasAttribute('tabindex')) {
      drop.setAttribute('role', 'button');
      drop.setAttribute('tabindex', 0);
      drop.addEventListener('focus', focusNavSection);
    }
  });
  // enable menu collapse on escape keypress
  if (!expanded) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > a');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Hide logo on scroll down and reveal on scroll up
  function fadeNavBrandOnScroll() {
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 200 && scrollTop > lastScrollTop) {
        // Scrolling down
        navBrand.style.opacity = '0';
      } else if (scrollTop < 200) {
        // Scrolling up and reaching minimum offset of 200px
        navBrand.style.opacity = '1';
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
  }

  fadeNavBrandOnScroll();

  const navSections = nav.querySelector('.nav-sections');
  // hamburger for all viewports
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  const heroWrapper = document.querySelector('.hero-wrapper');

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    heroWrapper.append(await buildBreadcrumbs());
  }

  // ===== START: add slide-in navigation effect
  function getWindowWidth() {
    return window.innerWidth;
  }
  const schizoMenu = {
    menuBtn: document.querySelector('.nav-hamburger > button'),
    menusWrap: document.querySelector('.nav-sections'),
    init: () => {
      schizoMenu.menusWrap.querySelector('.default-content-wrapper').classList.add('menu', 'one');
      const divClasses = ['two', 'three'];
      for (let i = 0; i < 2; i++) {
        const menuDiv = document.createElement('div');
        const documentFragment = document.createDocumentFragment();
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.setAttribute('href', '/');
        div.classList.add('back');
        div.append(a);
        documentFragment.append(div);
        menuDiv.append(documentFragment);
        menuDiv.classList.add('menu', divClasses[i]);
        schizoMenu.menusWrap.append(menuDiv);
      }

      schizoMenu.menusWrap.querySelectorAll('.menu ul > li').forEach((item) => {
        if (item.querySelectorAll('ul').length) {
          item.classList.add('has-children');
        }
      });
      schizoMenu.registerEvents();
      schizoMenu.openSubmenus();
    },
    openSubmenus: () => {
      const e = schizoMenu.menusWrap.querySelectorAll('.menu.one ul > li.active > a:not([href="/"])');
      if (e.length) {
        schizoMenu.copyMenuSecondLvl(e);
        schizoMenu.slideInSecondLvl();
        schizoMenu.slideOutThirdLvl();
        const n = e.parentNode.querySelectorAll('> ul > li.active');
        if (n.length) {
          schizoMenu.copyMenuThirdLvl(n);
          schizoMenu.slideInThirdLvl();
        }
      }
    },
    registerEvents: () => {
      schizoMenu.menuBtn.addEventListener('click', (e) => {
        if (e.target.classList.contains('isActive')) {
          schizoMenu.closeMenu();
        } else {
          schizoMenu.openMenu();
        }
      });
      schizoMenu.menusWrap.querySelectorAll('.menu.one ul > li > a').forEach((item) => {
        item.addEventListener('click', (e) => {
          if (e.target.parentNode.classList.contains('has-children')) {
            e.preventDefault();
            schizoMenu.copyMenuSecondLvl(e);
            schizoMenu.slideInSecondLvl();
            schizoMenu.slideOutThirdLvl();
          }
        });
      });
      schizoMenu.menusWrap.querySelectorAll('.menu.two .back a').forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          if (e.target.getAttribute('temp_disable') !== 'disabled') schizoMenu.slideOutSecondLvl();
        });
      });
      schizoMenu.menusWrap.querySelector('.menu.two').addEventListener('click', (e) => {
        if (e.target.parentNode.classList.contains('has-children')) {
          e.preventDefault();
          schizoMenu.copyMenuThirdLvl(e);
          schizoMenu.slideInThirdLvl();
        }
      });
      schizoMenu.menusWrap.querySelectorAll('.menu.three .back a').forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          schizoMenu.slideOutThirdLvl();
        });
      });
    },
    closeMenu: () => {
      schizoMenu.menuBtn.classList.remove('isActive');
    },
    openMenu: () => {
      schizoMenu.menuBtn.classList.add('isActive');
    },
    slideInSecondLvl: () => {
      schizoMenu.menusWrap.querySelector('.menu.one').classList.add('slide-in');
      schizoMenu.menusWrap.querySelector('.menu.two').classList.add('slide-in');
      if (getWindowWidth() < 992) schizoMenu.menusWrap.querySelector('.menu.one').classList.add('hide');
    },
    slideOutSecondLvl: () => {
      schizoMenu.menusWrap.querySelector('.menu.one').classList.remove('slide-in');
      schizoMenu.menusWrap.querySelector('.menu.two').classList.remove('slide-in');
      schizoMenu.menusWrap.querySelector('.menu.three').classList.remove('slide-in');
      if (getWindowWidth() < 992) schizoMenu.menusWrap.querySelector('.menu.one').classList.remove('hide');
      schizoMenu.menusWrap.querySelector('menu.two').classList.remove('hide');
    },
    copyMenuSecondLvl: (e) => {
      const secondLeveMenu = schizoMenu.menusWrap.querySelector('.menu.two ul');
      if (secondLeveMenu) secondLeveMenu.remove();
      schizoMenu.menusWrap.querySelector('.menu.two').append(e.target.parentNode.querySelector('ul').cloneNode(true));
      schizoMenu.menusWrap.querySelector('.menu.two .back a').textContent = e.target.parentNode.querySelector(':scope > a').textContent;
    },
    slideInThirdLvl: () => {
      schizoMenu.menusWrap.querySelector('.menu.three').classList.add('slide-in');
      if (getWindowWidth() < 992) schizoMenu.menusWrap.querySelector('.menu.two').classList.add('hide');
    },
    slideOutThirdLvl: () => {
      schizoMenu.menusWrap.querySelector('.menu.three').classList.remove('slide-in');
      if (getWindowWidth() < 992) schizoMenu.menusWrap.querySelector('.menu.two').classList.remove('hide');
    },
    copyMenuThirdLvl: (e) => {
      const thirdLevelMenu = schizoMenu.menusWrap.querySelector('.menu.three ul');
      if (thirdLevelMenu) thirdLevelMenu.remove();
      schizoMenu.menusWrap.querySelector('.menu.three').append(e.target.parentNode.querySelector(':scope ul').cloneNode(true));
      schizoMenu.menusWrap.querySelector('.menu.three .back a').textContent = e.target.parentNode.querySelector(':scope > a').textContent;
    },
  };
  schizoMenu.init();
  // ===== END: add slide-in navigation effect
}
