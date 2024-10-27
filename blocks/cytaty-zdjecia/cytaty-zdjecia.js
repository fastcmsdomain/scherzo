// Cards core block
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const CARD_IMAGE = 'card-image';
  const CARD_TITLE = 'card-title';
  const CARD_BODY = 'card-body';
  const CARD_HEADING = 'card-heading';

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const HEADING = div.querySelector('h3');
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = CARD_IMAGE;
      } else if (HEADING) {
        div.className = CARD_TITLE;
        HEADING.classList.add(CARD_HEADING);
      } else {
        div.className = CARD_BODY;
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  /* Card album */

  const cardAlbum = document.querySelector('.card-album');
  if (cardAlbum) {
    const cardAlbumParent = cardAlbum.parentElement.parentElement;
    cardAlbumParent.classList.add('full-bleed');
  }
}
