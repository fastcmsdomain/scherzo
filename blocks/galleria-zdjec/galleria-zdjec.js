import { createOptimizedPicture } from '../../scripts/aem.js';

const MAX_IMAGES = 16;
const MOBILE_BREAKPOINT = 600;
const TABLET_BREAKPOINT = 1200;

async function createGalleriaZdjec(block) {
  const table = block.querySelector('table');
  if (!table) return;

  const gallery = document.createElement('div');
  gallery.className = 'galleria-zdjec';
  const thumbnails = document.createElement('div');
  thumbnails.className = 'galleria-zdjec-thumbnails';

  const images = Array.from(table.querySelectorAll('img'));
  await Promise.all(images.slice(0, MAX_IMAGES).map(async (img, index) => {
    const thumbnail = await createThumbnail(img, index);
    thumbnails.appendChild(thumbnail);
  }));

  gallery.appendChild(thumbnails);
  block.innerHTML = '';
  block.appendChild(gallery);

  if (images.length > MAX_IMAGES) {
    implementLazyLoading(thumbnails, images.slice(MAX_IMAGES));
  }

  createModal();
}

async function createThumbnail(img, index) {
  const thumbnail = document.createElement('div');
  thumbnail.className = 'galleria-zdjec-thumbnail';
  const optimizedImg = await createOptimizedPicture(img.src, img.alt, false, [{ width: 250, height: 250 }]);
  thumbnail.appendChild(optimizedImg);
  thumbnail.addEventListener('click', () => openModal(img.src, img.alt));
  return thumbnail;
}

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'galleria-zdjec-modal';
  modal.innerHTML = `
    <div class="galleria-zdjec-modal-content">
      <img src="" alt="">
      <button class="galleria-zdjec-close" aria-label="Close image">&times;</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const closeButton = modal.querySelector('.galleria-zdjec-close');
  closeButton.addEventListener('click', closeModal);
}

function openModal(src, alt) {
  const modal = document.querySelector('.galleria-zdjec-modal');
  const modalImg = modal.querySelector('img');
  modalImg.src = src;
  modalImg.alt = alt;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.querySelector('.galleria-zdjec-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function implementLazyLoading(container, remainingImages) {
  const loadMore = document.createElement('button');
  loadMore.textContent = 'Load More';
  loadMore.className = 'galleria-zdjec-load-more';
  container.after(loadMore);

  loadMore.addEventListener('click', async () => {
    const nextBatch = remainingImages.splice(0, MAX_IMAGES);
    await Promise.all(nextBatch.map(async (img, index) => {
      const thumbnail = await createThumbnail(img, index + container.children.length);
      container.appendChild(thumbnail);
    }));

    if (remainingImages.length === 0) {
      loadMore.remove();
    }
  });
}

export default async function decorate(block) {
  try {
    await createGalleriaZdjec(block);
    block.classList.add('galleria-zdjec--initialized');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in Galleria Zdjec block:', error);
    block.innerHTML = '<p>Error loading gallery. Please try again later.</p>';
  }
}