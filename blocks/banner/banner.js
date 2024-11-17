export default function decorate(block) {
  // Configuration object
  const CONFIG = {
    ZOOM_SCALE: 1.3, // Maximum zoom scale
    SCROLL_THRESHOLD: 500, // Scroll distance for max zoom
  };

  // Create and setup elements
  const element = block.querySelectorAll('p');
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image');

  const title = document.createElement('h1');
  title.innerHTML = element[1].innerHTML;
  element[1].parentNode.replaceChild(title, element[1]);

  // Find the banner image
  const bannerImage = block.querySelector('img');
  if (bannerImage) {
    bannerImage.style.transition = 'transform 0.1s ease-out';
  }

  // Handle scroll event
  function handleScroll() {
    if (!bannerImage) return;

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
