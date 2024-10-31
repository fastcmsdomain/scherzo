const GALLERY_CONFIG = {
  KEYS: {
    ESCAPE: 'Escape',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ENTER: 'Enter',
  },
  CLASSES: {
    ACTIVE: 'active',
  },
  ARIA: {
    LABELS: {
      CLOSE: 'Close gallery',
      PREVIOUS: 'Previous image',
      NEXT: 'Next image',
    },
  },
};

class GalleryModal {
  constructor(images) {
    this.images = images;
    this.currentIndex = 0;
    this.modal = this.createModal();
    this.isOpen = false;
    this.setupEventListeners();
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'galeria-zdjec-modal';
    modal.innerHTML = `
      <div class="galeria-zdjec-modal-content">
        <img class="galeria-zdjec-modal-image" src="" alt="" />
        <button class="galeria-zdjec-modal-close" aria-label="${GALLERY_CONFIG.ARIA.LABELS.CLOSE}">✕</button>
        <button class="galeria-zdjec-modal-prev" aria-label="${GALLERY_CONFIG.ARIA.LABELS.PREVIOUS}">←</button>
        <button class="galeria-zdjec-modal-next" aria-label="${GALLERY_CONFIG.ARIA.LABELS.NEXT}">→</button>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  setupEventListeners() {
    // Modal controls
    this.modal.querySelector('.galeria-zdjec-modal-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.galeria-zdjec-modal-prev').addEventListener('click', () => this.showPrevious());
    this.modal.querySelector('.galeria-zdjec-modal-next').addEventListener('click', () => this.showNext());

    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      // Check if click is outside the modal content
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      
      switch (e.key) {
        case GALLERY_CONFIG.KEYS.ESCAPE:
          this.close();
          break;
        case GALLERY_CONFIG.KEYS.ARROW_LEFT:
          this.showPrevious();
          break;
        case GALLERY_CONFIG.KEYS.ARROW_RIGHT:
          this.showNext();
          break;
        default:
          break;
      }
    });
  }

  open(index) {
    this.currentIndex = index;
    this.updateImage();
    this.modal.classList.add(GALLERY_CONFIG.CLASSES.ACTIVE);
    this.isOpen = true;
  }

  close() {
    this.modal.classList.remove(GALLERY_CONFIG.CLASSES.ACTIVE);
    this.isOpen = false;
  }

  showPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }

  showNext() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }

  updateImage() {
    const currentImage = this.images[this.currentIndex];
    const modalImage = this.modal.querySelector('.galeria-zdjec-modal-image');
    modalImage.src = currentImage.src;
    modalImage.alt = currentImage.alt;
  }
}

export default async function decorate(block) {
  // Create content for gallery items
  const content = document.createElement('div');
  content.className = 'galeria-zdjec-content';

  // Process all images in the block
  const images = [];
  block.querySelectorAll('picture').forEach((picture) => {
    const img = picture.querySelector('img');
    const caption = picture.nextElementSibling;
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'galeria-zdjec-item';
    
    const thumbnail = img.cloneNode(true);
    thumbnail.className = 'galeria-zdjec-thumbnail';
    
    if (caption) {
      const captionElement = document.createElement('p');
      captionElement.className = 'galeria-zdjec-caption';
      captionElement.textContent = caption.textContent;
      galleryItem.appendChild(thumbnail);
      galleryItem.appendChild(captionElement);
    } else {
      galleryItem.appendChild(thumbnail);
    }

    images.push(img);
    content.appendChild(galleryItem);
  });

  // Initialize modal
  const modal = new GalleryModal(images);

  // Add click and keyboard event listeners to thumbnails
  content.querySelectorAll('.galeria-zdjec-item').forEach((item, index) => {
    item.addEventListener('click', () => modal.open(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === GALLERY_CONFIG.KEYS.ENTER) {
        modal.open(index);
      }
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  // Replace block content with gallery
  block.textContent = '';
  block.appendChild(content);
} 