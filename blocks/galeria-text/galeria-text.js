function showSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.galeria-text-slide');
  let realIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realIndex = 0;

  const activeSlide = slides[realIndex];
  block.querySelector('.galeria-text-slides').scrollTo({
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
  block.dataset.activeSlide = realIndex;
}

function bindEvents(block) {
  const prevBtn = block.querySelector('.galeria-text-prev');
  const nextBtn = block.querySelector('.galeria-text-next');

  prevBtn.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });

  nextBtn.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const slideIndex = parseInt(entry.target.dataset.slideIndex, 10);
        block.dataset.activeSlide = slideIndex;
      }
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.galeria-text-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  // Last row is text content, all others are images
  const textRow = rows.pop();
  const imageRows = rows.slice(0, 6); // Max 6 images

  // Create main container
  const container = document.createElement('div');
  container.className = 'galeria-text-container';

  // Create carousel (left side)
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'galeria-text-carousel';

  const slidesContainer = document.createElement('ul');
  slidesContainer.className = 'galeria-text-slides';

  imageRows.forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.className = 'galeria-text-slide';
    slide.dataset.slideIndex = idx;

    const picture = row.querySelector('picture');
    if (picture) {
      slide.appendChild(picture.cloneNode(true));
    }
    slidesContainer.appendChild(slide);
  });

  // Create navigation arrows
  const nav = document.createElement('div');
  nav.className = 'galeria-text-nav';
  nav.innerHTML = `
    <button type="button" class="galeria-text-prev" aria-label="Poprzedni obraz"></button>
    <button type="button" class="galeria-text-next" aria-label="Następny obraz"></button>
  `;

  carouselWrapper.appendChild(slidesContainer);
  carouselWrapper.appendChild(nav);

  // Create text content (right side)
  const textContent = document.createElement('div');
  textContent.className = 'galeria-text-content';
  textContent.innerHTML = textRow.innerHTML;

  // Assemble
  container.appendChild(carouselWrapper);
  container.appendChild(textContent);

  // Clear and replace
  block.textContent = '';
  block.appendChild(container);
  block.dataset.activeSlide = 0;

  // Bind events
  bindEvents(block);
}
