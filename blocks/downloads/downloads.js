const DOWNLOAD_CONFIG = {
  ARIA_LABELS: {
    BUTTON: 'Download',
  },
  CLASSES: {
    BUTTON: 'download-button',
    ICON: 'download-icon',
    INFO: 'download-info',
    FILENAME: 'download-filename',
    FILE: 'downloads-file',
    INFO_CONTAINER: 'downloads-info',
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
 * Creates the download button element with proper accessibility attributes
 * @param {string} url - Download URL
 * @param {string} filename - Name of the file
 * @returns {HTMLElement} Download button element
 */
function createDownloadButton(url, filename) {
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

  button.appendChild(icon);
  button.appendChild(info);

  return button;
}

/**
 * Decorates the download block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const fileData = {
    url: '',
    fileDisplayName: '',
    infoDisplayName: '',
  };

  // Get data from the first row
  if (rows[0]) {
    const fileCells = [...rows[0].children];
    fileData.url = fileCells[0]?.textContent?.trim() || '';
    fileData.fileDisplayName = fileCells[0]?.textContent?.trim() || '';
  }

  // Get data from the second row
  if (rows[1]) {
    const infoCells = [...rows[1].children];
    fileData.infoDisplayName = infoCells[0]?.textContent?.trim() || '';
  }

  if (fileData.url) {
    const convertedUrl = convertGoogleDriveUrl(fileData.url);

    // Create buttons for each row
    rows.forEach((row, index) => {
      const displayName = index === 0
        ? fileData.fileDisplayName
        : fileData.infoDisplayName;

      const downloadButton = createDownloadButton(convertedUrl, displayName);
      row.innerHTML = '';
      row.appendChild(downloadButton);

      // Set appropriate class name
      const className = index === 0
        ? DOWNLOAD_CONFIG.CLASSES.FILE
        : DOWNLOAD_CONFIG.CLASSES.INFO_CONTAINER;
      row.className = className;
    });
  }
}
