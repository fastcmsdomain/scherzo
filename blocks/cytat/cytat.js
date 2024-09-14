export default function decorate(block) {
  const quoteContent = block.querySelector('p:first-child');
  const quoteAuthor = block.querySelector('p:last-child');

  if (quoteContent) {
    quoteContent.classList.add('cytat-content');
  }

  if (quoteAuthor) {
    quoteAuthor.classList.add('cytat-author');
  }
}