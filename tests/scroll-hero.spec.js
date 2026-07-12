/**
 * Scroll Hero — desktop/mobile background image switching.
 *
 * Slide data is mocked so the test is hermetic: two slides, the first with a
 * desktop + mobile image pair, the second with a desktop image only. The GSAP
 * CDN is blocked so the block deterministically takes its no-GSAP fallback
 * path (backgrounds are set before animations either way).
 *
 * Image order convention (same slide table in Google Drive, all slides):
 *   image 1 = desktop background, image 2 = mobile background (optional)
 * The CSS switches at the 600px breakpoint via --bg-desktop / --bg-mobile.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';

const PAGE_URL = '/blocks/scroll-hero/test.html';

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 667 }; // below the 600px breakpoint

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const QUERY_INDEX = {
  data: [
    { path: '/slides/slide-one', title: 'Slide One' },
    { path: '/slides/slide-two', title: 'Slide Two' },
  ],
};

// EDS .plain.html shape: each authored image becomes a <picture> whose
// desktop rendition is the source[media="(min-width: 600px)"].
const eddsPicture = (file) => `
  <picture>
    <source type="image/webp" srcset="./${file}?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
    <source type="image/webp" srcset="./${file}?width=750&#x26;format=webply&#x26;optimize=medium">
    <img loading="lazy" alt="" src="./${file}?width=750&#x26;format=png" width="1600" height="900">
  </picture>`;

const slideHtml = (titleParts, pictures) => `
  <div>
    <div class="tytul-zdjecia">
      ${titleParts.map((part) => `<div><div>${part}</div></div>`).join('')}
    </div>
    ${pictures.map((file) => `<p>${eddsPicture(file)}</p>`).join('')}
  </div>`;

const SLIDE_ONE_HTML = slideHtml(
  ['Muzyka', 'od najmłodszych lat', 'Podtytuł pierwszy'],
  ['media_desk-a.png', 'media_mob-a.png'], // desktop + mobile pair
);

const SLIDE_TWO_HTML = slideHtml(
  ['Przedszkole', 'Scherzo', 'Podtytuł drugi'],
  ['media_desk-b.png'], // desktop only — mobile must fall back to it
);

const mockSlideData = async (page) => {
  await page.route('**/slides/query-index.json', (route) => route.fulfill({ json: QUERY_INDEX }));
  await page.route('**/slides/slide-one.plain.html', (route) => route.fulfill({ contentType: 'text/html', body: SLIDE_ONE_HTML }));
  await page.route('**/slides/slide-two.plain.html', (route) => route.fulfill({ contentType: 'text/html', body: SLIDE_TWO_HTML }));
  await page.route('**/media_*.png', (route) => route.fulfill({ contentType: 'image/png', body: PNG_1X1 }));
  // Hermetic: no CDN access — the block takes its no-GSAP fallback
  await page.route('https://cdnjs.cloudflare.com/**', (route) => route.abort());
};

const openTestPage = async (page) => {
  await mockSlideData(page);
  await page.goto(PAGE_URL);
  await expect(page.locator('body[data-test-ready="true"]')).toBeAttached();
  await expect(page.locator('.screen-section')).toHaveCount(2);
};

// Computed background-image of a slide's background element
const renderedBg = (page, sectionClass) => page
  .locator(`.screen-section.${sectionClass} .image-bg-0`)
  .evaluate((el) => getComputedStyle(el).backgroundImage);

test.describe('desktop viewport', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('renders the desktop image on every slide', async ({ page }) => {
    await openTestPage(page);

    expect(await renderedBg(page, 'section-slide-one')).toContain('media_desk-a.png');
    expect(await renderedBg(page, 'section-slide-two')).toContain('media_desk-b.png');
  });

  test('exposes both sources as custom properties and data attributes', async ({ page }) => {
    await openTestPage(page);

    const bgEl = page.locator('.section-slide-one .image-bg-0');
    await expect(bgEl).toHaveAttribute('data-bg', /media_desk-a\.png/);
    await expect(bgEl).toHaveAttribute('data-bg-mobile', /media_mob-a\.png/);

    const props = await bgEl.evaluate((el) => ({
      desktop: el.style.getPropertyValue('--bg-desktop'),
      mobile: el.style.getPropertyValue('--bg-mobile'),
    }));
    expect(props.desktop).toContain('media_desk-a.png');
    expect(props.mobile).toContain('media_mob-a.png');
  });
});

test.describe('mobile viewport', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('renders the mobile image when the slide has one', async ({ page }) => {
    await openTestPage(page);

    expect(await renderedBg(page, 'section-slide-one')).toContain('media_mob-a.png');
  });

  test('falls back to the desktop image when no mobile image is authored', async ({ page }) => {
    await openTestPage(page);

    expect(await renderedBg(page, 'section-slide-two')).toContain('media_desk-b.png');

    const bgEl = page.locator('.section-slide-two .image-bg-0');
    await expect(bgEl).not.toHaveAttribute('data-bg-mobile');
  });
});

test.describe('viewport change', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('swaps images live on resize without a reload', async ({ page }) => {
    await openTestPage(page);
    expect(await renderedBg(page, 'section-slide-one')).toContain('media_desk-a.png');

    await page.setViewportSize(MOBILE_VIEWPORT);
    await expect.poll(() => renderedBg(page, 'section-slide-one')).toContain('media_mob-a.png');

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expect.poll(() => renderedBg(page, 'section-slide-one')).toContain('media_desk-a.png');
  });
});
