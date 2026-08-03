import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_LOGO_IMAGE = '/images/logo.png';

/**
 * Builds the brand panel above the footer links (logo + tagline).
 * Uses the footer's solid blue background — no photo panel.
 * @returns {HTMLElement}
 */
const createFooterLogo = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'footer-logo';
  wrapper.innerHTML = `
    <div class="footer-logo-content">
      <img class="footer-logo-image" src="${FOOTER_LOGO_IMAGE}" alt="Scherzo" loading="lazy" width="188" height="125">
      <p class="footer-logo-caption">Prywatna Szkoła Podstawowa i Przedszkole</p>
      <p class="footer-logo-title">Edukacja w Scherzo<br>to fundament<br><span class="footer-logo-title-light">na całe życie</span></p>
    </div>
  `;
  return wrapper;
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // Insert the hero panel as a sibling before the (padded, grid-based)
  // footer block, so it renders edge-to-edge and isn't sized as a grid item.
  block.parentElement.insertBefore(createFooterLogo(), block);

  const iconPar = block.querySelectorAll('p');
  iconPar.forEach((p) => {
    if (p.querySelector('span.icon-map')) {
      p.classList.add('parBtn');
    }
  });

  const buttonEmail = document.querySelector('.button-container');
  if (buttonEmail) {
    buttonEmail.classList.remove('.button-container');
  }
}
