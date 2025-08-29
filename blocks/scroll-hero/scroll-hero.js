/**
 * Scroll Hero Block - Franklin Component
 * Recreates Wellington College Prep scroll animation with GSAP ScrollTrigger
 */

export default async function decorate(block) {
  // Fetch slides data from query-index.json (like slide-builder)
  async function fetchScrollHeroData() {
    try {
      const response = await fetch('/slides/query-index.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonFeed = await response.json();

      if (!jsonFeed.data || !Array.isArray(jsonFeed.data)) {
        throw new Error('Invalid data format in JSON feed');
      }

      const processedSections = await Promise.all(jsonFeed.data.map(async (item) => {
        if (!item.path || !item.path.startsWith('/slides/')) {
          return null;
        }

        try {
          const htmlResponse = await fetch(`${item.path}.plain.html`);
          if (!htmlResponse.ok) {
            throw new Error(`Failed to fetch HTML for slide: ${item.path}`);
          }
          const html = await htmlResponse.text();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Extract title parts (same as slide-builder)
          const textElements = doc.querySelectorAll('.tytul-zdjecia > div > div');
          const titleParts = Array.from(textElements)
            .map((el) => el.textContent.trim())
            .filter((text) => text);

          // Extract image (same as slide-builder)
          const imgElement = doc.querySelector('picture source[media="(min-width: 600px)"]');
          let imageSrc = '';
          if (imgElement) {
            imageSrc = imgElement.getAttribute('srcset');
            imageSrc = imageSrc.split('?')[0];
          }
          const absoluteImageSrc = imageSrc ? new URL(imageSrc, window.location.origin).href : '';

          // Extract additional images for multi-image effect
          const allImages = doc.querySelectorAll('picture source[media="(min-width: 600px)"]');
          const backgroundImages = Array.from(allImages).map(img => {
            let src = img.getAttribute('srcset');
            src = src.split('?')[0];
            return new URL(src, window.location.origin).href;
          });

          // Extract description and time from metadata or content
          const descriptionElement = doc.querySelector('.description, .subtitle, p');
          const timeElement = doc.querySelector('.time, .timestamp');
          
          return {
            ...item,
            id: `section-${item.path.split('/').pop()}`,
            titleParts,
            title: titleParts[0] || item.title || 'Section',
            subtitle: titleParts[1] || 'for life',
            description: descriptionElement ? descriptionElement.textContent.trim() : '',
            time: timeElement ? timeElement.textContent.trim() : '00:00',
            backgroundImages: backgroundImages.length > 0 ? backgroundImages : [absoluteImageSrc],
            image: absoluteImageSrc,
          };
        } catch (error) {
          console.warn(`Error processing slide ${item.path}:`, error);
          return null;
        }
      }));

      return processedSections.filter(slide => slide !== null);
    } catch (error) {
      console.error('Error fetching scroll hero data:', error);
      return [];
    }
  }

  // Fetch the sections data
  const sections = await fetchScrollHeroData();
  
  if (!sections || sections.length === 0) {
    block.innerHTML = '<p>No scroll hero sections found.</p>';
    return;
  }

  // Create the main container structure
  const heroContainer = document.createElement('div');
  heroContainer.className = 'scroll-hero-container';

  // Clear the original block content
  block.innerHTML = '';

  // Create progress navigation
  const progressNav = document.createElement('ul');
  progressNav.className = 'progress-nav';
  sections.forEach((section, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${section.title}</span>`;
    if (index === 0) li.classList.add('isActive');
    progressNav.appendChild(li);
  });

  // Create sections
  sections.forEach((section, index) => {
    const sectionElement = createSection(section, index);
    heroContainer.appendChild(sectionElement);
  });

  // Append to block
  block.appendChild(progressNav);
  block.appendChild(heroContainer);

  // Initialize animations after DOM is ready
  setTimeout(() => initializeAnimations(sections), 100);
}

function createSection(section, index) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = `screen-section ${section.id}`;
  
  // Use backgroundImages array from query-index.json data
  const backgroundImages = section.backgroundImages || [section.image];
  const bgImagesHtml = backgroundImages.map((img, imgIndex) => 
    `<div class="img image-bg image-bg-${imgIndex}" data-bg="${img}" style="display: ${imgIndex === 0 ? 'block' : 'none'}"></div>`
  ).join('');
  
  // Create title parts HTML from titleParts array
  const titlePartsHtml = section.titleParts && section.titleParts.length > 0 
    ? section.titleParts.map((part, partIndex) => 
        `<span class="title-part title-part-${partIndex}">${part}</span>`
      ).join('')
    : `<span class="title-part title-part-0">${section.title}</span>`;
  
  sectionDiv.innerHTML = `
    <div class="pin-spacer">
      <div class="screen ${section.id.replace('section-', '')} hold-pin">
        <div class="screen-inner">
          <div class="background">
            ${bgImagesHtml}
          </div>
          <div class="fade"></div>
          <div class="strapline">
            <h5 class="time-indicator">${section.time}</h5>
            <h1 class="main-title">
              ${titlePartsHtml}
            </h1>
            <h2 class="subtitle">${section.subtitle}</h2>
          </div>
          <div class="strapline-advanced">
            <h2 class="advanced-title">${section.title}</h2>
            <p class="description">${section.description}</p>
          </div>
          <div class="strapline-bottom">
            <a href="#stories">Latest #${section.title}ForLife Stories</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return sectionDiv;
}

function initializeAnimations(sections) {
  // Check if GSAP and ScrollTrigger are available
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded. Loading from CDN...');
    loadGSAP().then(() => initScrollAnimations(sections));
    return;
  }
  
  if (typeof ScrollTrigger === 'undefined') {
    console.warn('ScrollTrigger not loaded. Loading from CDN...');
    loadScrollTrigger().then(() => initScrollAnimations(sections));
    return;
  }

  initScrollAnimations(sections);
}

function loadGSAP() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadScrollTrigger() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
    script.onload = () => {
      gsap.registerPlugin(ScrollTrigger);
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initScrollAnimations(sections) {
  gsap.registerPlugin(ScrollTrigger);
  
  // Initialize background images (same as slide-builder pattern)
  function setSlideBackground(slideElement, imageSrc) {
    if (!imageSrc) return;
    
    const bgElement = slideElement.querySelector('.image-bg');
    if (bgElement) {
      bgElement.style.backgroundImage = `url(${imageSrc})`;
    }
  }
  
  // Set background images for all sections
  sections.forEach((section, index) => {
    const sectionElement = document.querySelector(`.screen-section.${section.id}`);
    if (sectionElement && section.backgroundImages) {
      section.backgroundImages.forEach((img, imgIndex) => {
        const bgElement = sectionElement.querySelector(`.image-bg-${imgIndex}`);
        if (bgElement) {
          bgElement.style.backgroundImage = `url(${img})`;
        }
      });
    }
  });

  // Create animations for each section
  sections.forEach((section, index) => {
    createSectionAnimation(section, index);
  });

  // Progress navigation clicks (smooth scroll like Wellington College)
  document.querySelectorAll('.progress-nav li').forEach((li, index) => {
    li.addEventListener('click', () => {
      const targetSection = `.screen-section:nth-child(${index + 1}) .screen`;
      gsap.to(window, {
        duration: 1,
        scrollTo: targetSection,
        ease: "power2.inOut"
      });
    });
  });
  
  console.log(`Scroll Hero: Initialized ${sections.length} sections with Wellington College animations`);
}

function createSectionAnimation(section, index) {
  const sectionSelector = `.${section.id.replace('section-', '')}`;
  
  // Enhanced timeline based on Wellington College exact pattern
  const timeline = gsap.timeline()
    // Main strapline movement and scaling
    .to(`${sectionSelector} .strapline`, {
      top: 60,
      y: 0,
      delay: 0.1,
      ease: "power2.out"
    }, 0)
    .to(`${sectionSelector} .strapline .main-title`, {
      fontSize: () => getWindowWidth() < 992 ? '44px' : '66px',
      delay: 0.1,
      ease: "power2.out"
    }, 0)
    .to(`${sectionSelector} .strapline .time-indicator`, {
      opacity: 0,
      duration: 0.1,
      delay: 0.1
    }, 0)
    .to(`${sectionSelector} .strapline .subtitle`, {
      top: -35,
      fontSize: '12px',
      delay: 0.1,
      ease: "power2.out"
    }, 0)
    // Fade overlay appears
    .to(`${sectionSelector} .fade`, {
      opacity: 1,
      ease: "power2.inOut"
    }, 0)
    // Advanced strapline entrance
    .to(`${sectionSelector} .strapline-advanced`, {
      top: '50%',
      yPercent: -50,
      delay: 0.2,
      ease: "power2.out"
    }, 0)
    .to(`${sectionSelector} .strapline-advanced`, {
      bottom: '26%',
      delay: 0.2
    }, 0)
    // Stories/content area reveal
    .to(`${sectionSelector} .strapline-bottom`, {
      bottom: () => getWindowWidth() < 992 ? '48px' : '0%',
      delay: 0.3,
      ease: "power2.out"
    }, 0);

  // Create ScrollTrigger for this section (exact Wellington College setup)
  ScrollTrigger.create({
    trigger: `${sectionSelector}`,
    start: 'top top',
    pin: true,
    pinSpacing: false,
    animation: timeline,
    scrub: 1,
    onEnter: () => updateProgressNav(index),
    onEnterBack: () => updateProgressNav(index),
    onLeave: () => clearProgressNav(),
    onLeaveBack: () => clearProgressNav()
  });

  // Multiple background images effect (Wellington College has 2-3 images per section)
  const backgroundImages = document.querySelectorAll(`${sectionSelector} .background .img`);
  
  // Background image switching during scroll (Wellington College pattern)
  if (backgroundImages.length > 1) {
    backgroundImages.forEach((img, imgIndex) => {
      if (imgIndex === 0) return; // First image is always visible
      
      // Show additional images at different scroll points
      ScrollTrigger.create({
        trigger: sectionSelector,
        start: `${25 + (imgIndex * 25)}% center`,
        end: `${50 + (imgIndex * 25)}% center`,
        onEnter: () => {
          gsap.to(img, { display: 'block', opacity: 1, duration: 0.5 });
        },
        onLeave: () => {
          gsap.to(img, { opacity: 0, duration: 0.5, onComplete: () => {
            img.style.display = 'none';
          }});
        },
        onEnterBack: () => {
          gsap.to(img, { display: 'block', opacity: 1, duration: 0.5 });
        },
        onLeaveBack: () => {
          gsap.to(img, { opacity: 0, duration: 0.5, onComplete: () => {
            img.style.display = 'none';
          }});
        }
      });
    });
  }
  
  // Parallax effect for all background images
  backgroundImages.forEach((img, imgIndex) => {
    gsap.to(img, {
      yPercent: -30 - (imgIndex * 10), // Different speeds for layered effect
      scale: 1 + (imgIndex * 0.05),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2 + (imgIndex * 0.3), // Different scrub speeds
      }
    });
  });

  // Text entrance animation (appears from bottom)
  gsap.fromTo(`${sectionSelector} .strapline`, {
    y: 100,
    opacity: 0,
    scale: 0.9
  }, {
    y: 0,
    opacity: 1,
    scale: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top 80%',
      end: 'top 50%',
      scrub: 1,
    }
  });

  // Text exit animation (moves up and fades during scroll)
  gsap.to(`${sectionSelector} .strapline`, {
    y: -150,
    opacity: 0.2,
    scale: 0.7,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'center top',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  // Advanced strapline entrance from bottom
  gsap.fromTo(`${sectionSelector} .strapline-advanced`, {
    y: 200,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top 30%',
      end: 'center center',
      scrub: 1,
    }
  });

  // Scale effect for depth during overlap (Wellington College signature effect)
  gsap.fromTo(`${sectionSelector}`, {
    scale: 0.95,
    filter: 'brightness(0.8)'
  }, {
    scale: 1,
    filter: 'brightness(1)',
    ease: 'none',
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
    }
  });

  // Individual text element animations (staggered) - includes title-parts from query-index.json
  const titleParts = document.querySelectorAll(`${sectionSelector} .title-part, ${sectionSelector} .strapline h2, ${sectionSelector} .strapline h5`);
  titleParts.forEach((part, partIndex) => {
    gsap.fromTo(part, {
      y: 50 + (partIndex * 20),
      opacity: 0,
      scale: 0.8
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top 70%',
        end: 'top 40%',
        scrub: 1,
      }
    });
  });

  // Special animation for title parts (Wellington College style staggered entrance)
  const mainTitleParts = document.querySelectorAll(`${sectionSelector} .title-part`);
  if (mainTitleParts.length > 0) {
    gsap.fromTo(mainTitleParts, {
      y: 100,
      opacity: 0,
      scale: 0.8,
      rotationX: 15
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      rotationX: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.15, // Staggered entrance like Wellington College
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1,
      }
    });
  }
}

function updateProgressNav(activeIndex) {
  document.querySelectorAll('.progress-nav li').forEach((li, index) => {
    li.classList.toggle('isActive', index === activeIndex);
  });
}

function clearProgressNav() {
  document.querySelectorAll('.progress-nav li').forEach(li => {
    li.classList.remove('isActive');
  });
}

// Utility function for window width (from Wellington College)
function getWindowWidth() {
  return window.innerWidth || document.documentElement.clientWidth;
}
