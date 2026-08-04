/**
 * Hero block — ensures the title under the image is always an <h1>.
 * Supports both layouts:
 *   - classic: <p>picture</p><p>title</p>
 *   - table:   row of pictures + row/cell with title text
 */

/**
 * Finds the authored title node (paragraph or cell text under/after images).
 * @param {HTMLElement} block
 * @returns {HTMLElement|null}
 */
const findTitleCandidate = (block) => {
  // Paragraph that is text-only (not wrapping a picture)
  const textParagraph = [...block.querySelectorAll('p')].find(
    (p) => !p.querySelector('picture, img') && p.textContent.trim(),
  );
  if (textParagraph) return textParagraph;

  // Table cell with title text and no image
  const textCell = [...block.querySelectorAll(':scope > div > div')].find(
    (cell) => !cell.querySelector('picture, img') && cell.textContent.trim(),
  );
  return textCell || null;
};

/**
 * Converts a title candidate element into an <h1>, preserving markup.
 * @param {HTMLElement} candidate
 * @returns {HTMLHeadingElement|null}
 */
const promoteToH1 = (candidate) => {
  if (!candidate) return null;

  const title = document.createElement('h1');

  if (candidate.tagName === 'P') {
    title.innerHTML = candidate.innerHTML;
    candidate.replaceWith(title);
    return title;
  }

  // Cell may already contain a <p> from wrapTextNodes
  const innerP = candidate.querySelector(':scope > p');
  if (innerP) {
    title.innerHTML = innerP.innerHTML;
    innerP.replaceWith(title);
    return title;
  }

  title.innerHTML = candidate.innerHTML;
  candidate.replaceChildren(title);
  return title;
};

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // LCP image: prefer first (desktop) hero image
  const img = block.querySelector('img');
  if (img) {
    img.setAttribute('fetchpriority', 'high');
    img.setAttribute('loading', 'eager');
  }

  // Keep existing h1; otherwise promote text under the image to h1
  let titleEl = block.querySelector('h1');
  if (!titleEl) {
    titleEl = promoteToH1(findTitleCandidate(block));
  }

  if (!titleEl) return;

  const headingText = titleEl.textContent || '';
  const wordCount = headingText.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 5) {
    titleEl.classList.add('long-heading');
  }
}
