/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

const PDF_ICON = `<svg class="accordion-item-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="12" y1="18" x2="12" y2="12"></line>
  <line x1="9" y1="15" x2="15" y2="15"></line>
</svg>`;

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

function decorateBodyLinks(body) {
  const links = [...body.querySelectorAll('a')];
  const wrappers = new Set();

  links.forEach((link) => {
    const wrapper = link.parentElement;
    if (wrapper !== body) wrappers.add(wrapper);

    link.classList.remove('button', 'primary', 'secondary');
    link.classList.add('accordion-item-link');

    // put each link in its own paragraph, prefixed with a PDF icon
    const para = document.createElement('p');
    para.className = 'accordion-item-link-row';
    para.insertAdjacentHTML('afterbegin', PDF_ICON);
    para.append(link);
    body.append(para);
  });

  // drop original link wrappers that are now empty
  wrappers.forEach((wrapper) => {
    if (wrapper.textContent.trim() === '' && !wrapper.querySelector('img, picture')) {
      wrapper.remove();
    }
  });
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `<p>${summary.innerHTML}</p>`;
    }
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }
    // render links as plain links (not buttons) with a leading PDF icon,
    // each link in its own paragraph, matching the pobierz block
    decorateBodyLinks(body);
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
