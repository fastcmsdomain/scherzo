export default function decorate(block) {
  // Configuration object
  const CONFIG = {
    ZOOM_SCALE: 1.3, // Maximum zoom scale
    SCROLL_THRESHOLD: 500, // Scroll distance for max zoom
    SELECTORS: {
      PICTURE: 'picture',
      PARAGRAPH: 'p',
    },
  };

  // Check for picture element
  const bannerPicture = block.querySelector(CONFIG.SELECTORS.PICTURE);
  const paragraphs = block.querySelectorAll(CONFIG.SELECTORS.PARAGRAPH);
  
  // If no picture but paragraph exists, convert first paragraph to h1
  if (!bannerPicture && paragraphs.length > 0) {
    const title = document.createElement('h1');
    title.innerHTML = paragraphs[0].innerHTML;
    paragraphs[0].parentNode.replaceChild(title, paragraphs[0]);
    return; // Exit since there's no image to handle zoom effect
  }

  // Handle case where picture exists
  const bannerImage = bannerPicture?.querySelector('img');
  if (bannerImage) {
    // Setup image for zoom effect
    bannerImage.style.transition = 'transform 0.1s ease-out';

    // Handle scroll event
    function handleScroll() {
      const scrollPosition = window.scrollY;
      const scale = Math.min(
        1 + (scrollPosition / CONFIG.SCROLL_THRESHOLD) * (CONFIG.ZOOM_SCALE - 1),
        CONFIG.ZOOM_SCALE,
      );

      // Apply transform with hardware acceleration
      bannerImage.style.transform = `scale(${scale})`;
    }

    // Add scroll event listener
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(handleScroll);
    });

    // Initial call to set starting position
    handleScroll();
  }

  // Convert second paragraph to h1 if it exists
  if (paragraphs.length > 1) {
    const title = document.createElement('h1');
    title.innerHTML = paragraphs[1].innerHTML;
    paragraphs[1].parentNode.replaceChild(title, paragraphs[1]);
  }
}
