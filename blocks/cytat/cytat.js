export default function decorate(block) {
  const quoteContent = block.querySelector('p');
  if (quoteContent) {
    quoteContent.classList.add('cytat-content');
  }
}
