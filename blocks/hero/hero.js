export default function decorate(block) {
  const elemant = block.querySelectorAll('p');
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image');

  // Always convert the second paragraph to h1 (original functionality)
  const title = document.createElement('h1');
  title.innerHTML = elemant[1].innerHTML;
  // Check if heading has more than 5 words and apply smaller size
  const headingText = elemant[1].textContent || elemant[1].innerText || '';
  const wordCount = headingText.trim().split(/\s+/).length;
  if (wordCount > 5) {
    title.classList.add('long-heading');
  }
  elemant[1].parentNode.replaceChild(title, elemant[1]);
  // Additional handling for 'bez zdjeciem' class if needed
  if (block.classList.contains('bez zdjeciem')) {
    // The text is already converted to h1 above
    // Add any additional styling or behavior specific to 'bez zdjeciem' here if needed
  }
}
