/* eslint-disable no-shadow */
import {
  replaceTokens,
  convertToISODate,
  getConfigTruth,
  readVariables,
} from './variables.js';

export function extractJsonLd(parsedJson) {
  const jsonLd = {};
  const hasDataArray = 'data' in parsedJson && Array.isArray(parsedJson.data);
  if (hasDataArray) {
    parsedJson.data.forEach((item) => {
      let key = item.Item.trim().toLowerCase();
      const reservedKeySet = new Set([
        'type',
        'context',
        'id',
        'value',
        'reverse',
        'container',
        'graph',
      ]);
      if (reservedKeySet.has(key)) {
        key = `@${key}`;
      }
      const value = item.Value.trim();
      jsonLd[key] = value;
    });
    return jsonLd;
  }
  return parsedJson;
}

export async function createJSON() {
  window.cmsplus.debug('createJSON');
  const dc = {};
  const co = {};
  const currentDate = new Date();
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach((metaTag) => {
    let key = metaTag.getAttribute('name') || metaTag.getAttribute('property');
    let value = metaTag.getAttribute('content');
    key = key.replaceAll(' ', '');
    if (key.includes('date')) {
      value = convertToISODate(value);
    }

    if (key.startsWith('dc-')) {
      dc[key.replace('dc-', 'dc:').replaceAll(' ', '')] = value;
    }
    if (key.startsWith('co-')) {
      co[key.replace('co-', 'co:').replaceAll(' ', '')] = value;
    }
    if (key && value) {
      let prefix = '';
      if (!key.includes(':')) {
        prefix = 'meta:';
      }
      if (key.includes('meta:og:') || key.includes('meta:twitter:')) {
        key.replace('meta:', '');
      }
      if (key === 'og:image:secure_url') {
        key = 'og:image_secure_url';
      }
      window.siteConfig[`$${prefix}${key}$`] = value;
    }
  });

  window.siteConfig['$meta:author$'] ??= window.siteConfig['$company:name$'];

  if (getConfigTruth('$meta:enableprofilevariables$')) {
    let profileConfig = window.siteConfig?.['$meta:author$'];
    if (profileConfig) {
      profileConfig = profileConfig.replaceAll(' ', '-').toLowerCase();
      await readVariables(
        `${window.location.origin}/profiles/${profileConfig}.json`,
      );
    }
  }
  if (window.siteConfig?.['$meta:command$']) {
    const commands = window.siteConfig['$meta:command$'].split(';');
    // eslint-disable-next-line no-restricted-syntax
    for (const command of commands) {
      const phrase = command.split('=');
      if (phrase.length === 2) {
        // eslint-disable-next-line prefer-destructuring, semi
        window.siteConfig[`$${phrase[0].trim().toLowerCase()}$`] = phrase[1].trim();
      }
    }
  }

  // fix up missing configs

  window.siteConfig['$meta:contentauthor$']
    ??= window.siteConfig['$meta:author$'];
  window.siteConfig['$meta:pagename$'] ??= window.siteConfig['$page:name$'];
  window.siteConfig['$meta:longdescription$']
    ??= window.siteConfig['$meta:description$'];
  if (window.siteConfig['$meta:pagename$'] === '/') {
    window.siteConfig['$meta:pagename$'] = 'home';
    window.siteConfig['$meta:category$'] ??= 'home';
  }
  window.siteConfig['$meta:category'] ??= 'none';

  const jsonLdKeys = [
    '$meta:json-ld$',
    '$meta:json+ld$',
    '$meta:ld+json$',
    '$meta:jsonld$',
  ];

  window.siteConfig = window.siteConfig || {};
  window.siteConfig['$meta:json-ld$'] = jsonLdKeys.reduce((acc, key) => acc || window.siteConfig[key], null)
    || 'owner';

  if (window.siteConfig?.['$meta:category$'] === 'home') {
    window.siteConfig['$meta:category$'] = 'none';
  }

  // decode the language
  const lang = window.siteConfig['$system:language$']
    || window.siteConfig?.['$meta:lang$']
    || window.siteConfig?.['$meta:language$']
    || window.siteConfig?.['$meta:dc-language$']
    || window.navigator.language
    || 'en';
  window.siteConfig['$system:language$'] = lang;
  document.querySelector('html').setAttribute('lang', lang);
  if (lang === 'ar') {
    document.querySelector('html').setAttribute('dir', 'rtl');
  }
  co['co:language'] = lang;
  co['co:author'] = window.siteConfig['$meta:author$'];
  window.cmsplus.helpapikey = window.siteConfig?.['$system:.helpapikey$'] ?? '';

  const dcString = JSON.stringify(dc, null, '\t');
  if (getConfigTruth('$meta:enabledublincore$')) {
    if (dcString.length > 2) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-role', 'dublin core');
      let text = replaceTokens(window.siteConfig, dcString);
      text = `"@graph": [{${text}]}`;
      script.textContent = text;
      document.head.appendChild(script);
    }
  }

  let futureDate = new Date();
  let futurePeriod = '';

  // Extract the default review period from the site configuration.
  const futurePeriodString = window.siteConfig['$co:defaultreviewperiod'];
  futurePeriod = parseInt(futurePeriodString, 10);
  if (Number.isNaN(futurePeriod)) {
    futurePeriod = 300; // Default to 300 days
    window.siteConfig['$co:defaultreviewperiod'] = futurePeriod;
  }

  futureDate = new Date(
    currentDate.getTime() + futurePeriod * 24 * 60 * 60 * 1000,
  );
  // Convert the future date to an ISO string and assign it to the review datetime.
  co['co:reviewdatetime'] = futureDate.toISOString();

  if (!co['co:startdatetime']) {
    co['co:startdatetime'] = currentDate.toISOString();
  }
  if (!co['co:publisheddatetime']) {
    co['co:publisheddatetime'] = currentDate.toISOString();
  }
  if (!co['co:expirydatetime']) {
    const futurePeriodString = window.siteConfig['$co:defaultexpiryperiod'];
    futurePeriod = parseInt(futurePeriodString, 10);
    if (Number.isNaN(futurePeriod)) {
      futurePeriod = 365; // Default to 1 year.
      window.siteConfig['$co:defaultexpiryperiod'] = futurePeriod;
    }
    futureDate = new Date(
      currentDate.getTime() + futurePeriod * 24 * 60 * 60 * 1000,
    );
    co['co:expirydatetime'] = futureDate.toISOString();
  }
  if (!co['co:restrictions']) {
    co['co:restrictions'] = window.siteConfig['$co:defaultrestrictions'];
  }
  if (!co['co:tags']) {
    co['co:tags'] = window.siteConfig['$co:defaulttags'];
  }

  if (getConfigTruth('$meta:enablecontentops$')) {
    let coString = JSON.stringify(co, null, '\t');
    coString = replaceTokens(window.siteConfig, coString);
    if (coString.length > 2) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-role', 'content ops');
      let text = replaceTokens(window.siteConfig, coString);
      text = `{
        "@graph": [
          {${text}}
        ]
      }`;
      script.textContent = text;
      document.head.appendChild(script);
    }
  }
  window.cmsplus.debug('complete create json');
}

export async function handleMetadataJsonLd() {
  window.cmsplus.debug('handleMetadataJsonLd');

  // Get content from config with fallback
  const content = window.siteConfig['$meta:json-ld$'] || 'owner';

  // Skip if content is explicitly set to 'none'
  if (content.toLowerCase() === 'none') {
    window.cmsplus.debug('JSON-LD processing skipped - content set to none');
    return;
  }

  try {
    // Check if content is a URL
    let jsonLdUrl;
    try {
      jsonLdUrl = new URL(content);
    } catch {
      // Content is not a URL, construct the JSON-LD URL
      jsonLdUrl = new URL(`/config/json-ld/${content}.json`, window.location.origin);
    }

    const resp = await fetch(jsonLdUrl.href);
    let json;

    if (!resp.ok) {
      // If file not found, try fallback to owner.json
      if (content !== 'owner') {
        window.cmsplus.debug(`JSON-LD file ${content} not found, trying owner.json`);
        const fallbackResp = await fetch(`${window.location.origin}/config/json-ld/owner.json`);
        if (!fallbackResp.ok) {
          window.cmsplus.debug('Fallback JSON-LD file not found, skipping');
          return;
        }
        const newJson = await fallbackResp.json();
        json = extractJsonLd(newJson);
      } else {
        window.cmsplus.debug('JSON-LD file not found, skipping');
        return;
      }
    } else {
      const responseJson = await resp.json();
      json = extractJsonLd(responseJson);
    }
    let jsonString = JSON.stringify(json, null, '\t');
    jsonString = replaceTokens(window.siteConfig, jsonString);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-role', content.split('/').pop().split('.')[0]);
    script.setAttribute('id', 'ldMeta');
    script.textContent = jsonString;
    document.head.appendChild(script);

    document
      .querySelectorAll('meta[name="longdescription"]')
      .forEach((section) => section.remove());
  } catch (error) {
    window.cmsplus.debug(`Error processing JSON-LD metadata: ${error.message}`);
    // Don't throw error, just log and continue
  }

  window.cmsplus.debug('handleMetadataJsonLd complete');
}
