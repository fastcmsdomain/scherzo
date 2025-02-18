export default function decorate(block) {
  // Configuration object
  const CONFIG = {
    MAP_URL: 'https://www.google.pl/maps/place/Zesp%C3%B3%C5%82+Plac%C3%B3wek+O%C5%9Bwiatowych+%E2%80%9EScherzo%E2%80%9D/@50.0716202,19.8312141,1009m/data=!3m2!1e3!4b1!4m6!3m5!1s0x47165b9e0250490f:0xb7015bf6b46a9792!8m2!3d50.0716202!4d19.833789!16s%2Fg%2F1yhbjt4j4',
    EMBED_URL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2561.744371538991!2d19.831214077167092!3d50.07162017942693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47165b9e0250490f%3A0xb7015bf6b46a9792!2sZesp%C3%B3%C5%82%20Plac%C3%B3wek%20O%C5%9Bwiatowych%20%E2%80%9EScherzo%E2%80%9D!5e0!3m2!1spl!2spl!4v1708461549099!5m2!1spl!2spl',
  };

  // Create map container
  const mapContainer = document.createElement('div');
  mapContainer.className = 'contact-map';
  
  // Add Google Maps iframe
  mapContainer.innerHTML = `
    <iframe 
      src="${CONFIG.EMBED_URL}"
      width="100%" 
      height="450" 
      style="border:0;" 
      allowfullscreen="" 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  `;

  // Create contact info container
  const contactInfo = document.createElement('div');
  contactInfo.className = 'contact-info';
  
  // Move existing content to contact info
  while (block.firstChild) {
    contactInfo.appendChild(block.firstChild);
  }

  // Add containers to block
  block.appendChild(contactInfo);
  block.appendChild(mapContainer);
} 