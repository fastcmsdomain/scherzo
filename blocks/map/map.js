// Configuration object for the map block
const MAP_CONFIG = {
  // Default height for the form iframe
  DEFAULT_HEIGHT: '800px',
  // Classes for styling
  CLASSES: {
    WRAPPER: 'map-wrapper',
    IFRAME: 'map-iframe'
  },
  // Error messages
  ERRORS: {
    NO_URL: 'No form URL provided',
    INVALID_URL: 'Invalid Google Forms URL'
  }
};

/**
 * Validates if the URL is a Google Forms URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Google Forms URL
 */
function isValidGoogleFormsUrl(url) {
  return url.includes('docs.google.com/forms');
}

/**
 * Creates an iframe element for the Google Form
 * @param {string} url - Google Forms URL
 * @returns {HTMLIFrameElement} - Created iframe element
 */
function createFormIframe(url) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.className = MAP_CONFIG.CLASSES.IFRAME;
  iframe.width = '100%';
  iframe.height = MAP_CONFIG.DEFAULT_HEIGHT;
  iframe.frameBorder = '0';
  iframe.marginHeight = '0';
  iframe.marginWidth = '0';
  
  // Make iframe responsive to content height
  iframe.addEventListener('load', () => {
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
  });
  
  return iframe;
}

/**
 * Decorates the map block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  try {
    // Get the URL from the block content
    const formUrl = block.textContent.trim();
    
    if (!formUrl) {
      throw new Error(MAP_CONFIG.ERRORS.NO_URL);
    }

    if (!isValidGoogleFormsUrl(formUrl)) {
      throw new Error(MAP_CONFIG.ERRORS.INVALID_URL);
    }

    // Clear the block content
    block.textContent = '';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = MAP_CONFIG.CLASSES.WRAPPER;

    // Create and append iframe
    const iframe = createFormIframe(formUrl);
    wrapper.appendChild(iframe);
    block.appendChild(wrapper);

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Map block error:', error);
    block.innerHTML = `<p class="error">${error.message}</p>`;
  }
} 