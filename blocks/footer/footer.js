import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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

  const footerLogo = document.querySelector('.footer-logo');
if (footerLogo) {
  const h3 = footerLogo.querySelector('h3');
  if (h3) {
    // Split innerHTML on <br> (as HTML, not just \n) and trim
    const lines = h3.innerHTML.split(/<br\s*\/?>/i).map(line => line.trim());
    h3.innerHTML = lines
      .map(line => {
        // For each line, split by space and wrap each word with a span
        return line
          .split(' ')
          .map(word => `<span>${word}</span>`)
          .join(' ');
      })
      .join('<br>');
  }
}
}
