// Configuration object for the download block
const DOWNLOAD_CONFIG = {
  ICONS: {
    PDF: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 18V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
  },
  LABELS: {
    DOWNLOAD: 'Download',
    FILE_SIZE: 'File size:',
    KB: 'KB',
    MB: 'MB',
  },
};

/**
 * Formats the file size into a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(1))} ${sizes[i - 1]}`;
}

/**
 * Creates the download button element
 * @param {string} href - URL of the file to download
 * @param {string} fileName - Name of the file
 * @param {number} fileSize - Size of the file in bytes
 * @returns {HTMLElement} Download button element
 */
function createDownloadButton(href, fileName, fileSize) {
  const button = document.createElement('a');
  button.href = href;
  button.className = 'download-button';
  button.download = fileName;
  
  const iconWrapper = document.createElement('span');
  iconWrapper.className = 'download-icon';
  iconWrapper.innerHTML = DOWNLOAD_CONFIG.ICONS.PDF;
  
  const textWrapper = document.createElement('span');
  textWrapper.className = 'download-text';
  
  const nameElement = document.createElement('span');
  nameElement.className = 'download-filename';
  nameElement.textContent = fileName;
  
  const sizeElement = document.createElement('span');
  sizeElement.className = 'download-filesize';
  sizeElement.textContent = `${DOWNLOAD_CONFIG.LABELS.FILE_SIZE} ${formatFileSize(fileSize)}`;
  
  textWrapper.append(nameElement, sizeElement);
  button.append(iconWrapper, textWrapper);
  
  return button;
}
/**
 * Decorates the download block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  // Get the link from the block content
  const link = block.querySelector('a');
  if (!link) return;

  const href = link.href;
  const fileName = link.textContent.trim();

  try {
    // Fetch file metadata
    const response = await fetch(href, { method: 'HEAD' });
    if (!response.ok) throw new Error('Failed to fetch file metadata');
    
    const fileSize = parseInt(response.headers.get('content-length'), 10);
    const downloadButton = createDownloadButton(href, fileName, fileSize);
    
    // Clear block content and append download button
    block.textContent = '';
    block.appendChild(downloadButton);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating download button:', error);
  }
} 
