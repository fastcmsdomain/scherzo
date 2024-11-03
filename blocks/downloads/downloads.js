// Configuration constants
const DOWNLOAD_CONFIG = {
  ARIA_LABELS: {
    BUTTON: 'Download',
    SIZE: 'File size',
  },
  CLASSES: {
    BUTTON: 'download-button',
    ICON: 'download-icon',
    INFO: 'download-info',
    SIZE: 'download-size',
    FILENAME: 'download-filename',
  },
  PATTERNS: {
    GOOGLE_DRIVE: /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view\?usp=sharing$/,
  },
  URLS: {
    GOOGLE_DRIVE_DOWNLOAD: 'https://drive.google.com/uc?export=download&id=',
  },
  ICONS: {
    PDF: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>`,
  },
};

/**
 * Converts a Google Drive sharing URL to a direct download URL
 * @param {string} url - Google Drive sharing URL
 * @returns {string} Direct download URL or original URL if not a Google Drive link
 */
function convertGoogleDriveUrl(url) {
  const match = url.match(DOWNLOAD_CONFIG.PATTERNS.GOOGLE_DRIVE);
  if (match && match[1]) {
    return `${DOWNLOAD_CONFIG.URLS.GOOGLE_DRIVE_DOWNLOAD}${match[1]}`;
  }
  return url;
}

/**
 * Formats the file size in bytes to a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
}

/**
 * Creates the download button element with proper accessibility attributes
 * @param {string} url - Download URL
 * @param {string} filename - Name of the file
 * @param {string} size - File size
 * @returns {HTMLElement} Download button element
 */
function createDownloadButton(url, filename, size) {
  const button = document.createElement('a');
  button.href = url;
  button.className = DOWNLOAD_CONFIG.CLASSES.BUTTON;
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', `${DOWNLOAD_CONFIG.ARIA_LABELS.BUTTON} ${filename}`);
  button.setAttribute('download', '');
  button.setAttribute('target', '_blank');
  button.setAttribute('rel', 'noopener noreferrer');

  // Add icon
  const icon = document.createElement('span');
  icon.className = DOWNLOAD_CONFIG.CLASSES.ICON;
  icon.innerHTML = DOWNLOAD_CONFIG.ICONS.PDF;

  // Add filename as a link
  const filenameLink = document.createElement('span');
  filenameLink.className = DOWNLOAD_CONFIG.CLASSES.FILENAME;
  filenameLink.textContent = filename;

  // Add info container
  const info = document.createElement('span');
  info.className = DOWNLOAD_CONFIG.CLASSES.INFO;
  info.appendChild(filenameLink);

  if (size) {
    const sizeElement = document.createElement('span');
    sizeElement.className = DOWNLOAD_CONFIG.CLASSES.SIZE;
    sizeElement.setAttribute('aria-label', `${DOWNLOAD_CONFIG.ARIA_LABELS.SIZE}: ${size}`);
    sizeElement.textContent = size;
    info.appendChild(sizeElement);
  }

  button.appendChild(icon);
  button.appendChild(info);

  return button;
}

/**
 * Decorates the download block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  // Get file information from the block content
  const rows = [...block.children];

  // Process each row as a download item
  rows.forEach((row) => {
    const cells = [...row.children];
    let fileUrl = cells[0]?.textContent?.trim() || '';
    const fileName = cells[1]?.textContent?.trim() || '';
    const fileSize = cells[2]?.textContent?.trim() || '';

    if (fileUrl) {
      // Convert Google Drive URL if necessary
      fileUrl = convertGoogleDriveUrl(fileUrl);

      const downloadButton = createDownloadButton(
        fileUrl,
        fileName || fileUrl.split('/').pop(),
        formatFileSize(parseInt(fileSize, 10)),
      );

      // Replace row content with download button
      row.innerHTML = '';
      row.appendChild(downloadButton);
    }
  });
}
