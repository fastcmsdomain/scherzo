function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cols = row.children ? [...row.children] : [];
    if (!cols[0] || !cols[1]) return;

    const name = toClassName(cols[0].textContent);
    const valueCol = cols[1];
    let value = '';

    const links = [...valueCol.querySelectorAll('a')].map((a) => a.href).filter(Boolean);
    if (links.length) {
      value = links.length === 1 ? links[0] : links;
    } else {
      const imgs = [...valueCol.querySelectorAll('img')].map((img) => img.src).filter(Boolean);
      if (imgs.length) {
        value = imgs.length === 1 ? imgs[0] : imgs;
      } else {
        const ps = [...valueCol.querySelectorAll('p')].map((p) => p.textContent).filter(Boolean);
        if (ps.length) {
          value = ps.length === 1 ? ps[0] : ps;
        } else {
          value = valueCol.textContent;
        }
      }
    }

    config[name] = value;
  });

  return config;
}

function asString(value) {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : '';
  return value == null ? '' : String(value);
}

function parsePositiveInt(value, defaultValue) {
  const parsed = Number.parseInt(asString(value).trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function parseBoolean(value, defaultValue) {
  const normalized = asString(value).trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (['true', 'yes', 'on', '1'].includes(normalized)) return true;
  if (['false', 'no', 'off', '0'].includes(normalized)) return false;
  return defaultValue;
}

function parseSources(value) {
  const normalized = asString(value).trim().toLowerCase();
  if (['all', 'facebook', 'instagram'].includes(normalized)) return normalized;
  return 'all';
}

function truncateText(text, maxLen) {
  const normalized = asString(text).trim().replace(/\s+/g, ' ');
  if (!normalized) return '';
  return normalized.length > maxLen ? `${normalized.slice(0, maxLen - 1)}…` : normalized;
}

function safeDate(value) {
  const date = new Date(asString(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeItems(data) {
  const out = [];

  const fbItems = Array.isArray(data?.facebook) ? data.facebook : [];
  fbItems.forEach((item) => {
    const date = safeDate(item?.created_time);
    const title = truncateText(item?.message, 100) || 'Post z Facebooka / Facebook post';
    out.push({
      source: 'facebook',
      id: asString(item?.id),
      title,
      image: asString(item?.full_picture),
      date,
      link: asString(item?.permalink_url),
    });
  });

  const igItems = Array.isArray(data?.instagram) ? data.instagram : [];
  igItems.forEach((item) => {
    const date = safeDate(item?.timestamp);
    const title = truncateText(item?.caption, 100) || 'Post z Instagrama / Instagram post';
    out.push({
      source: 'instagram',
      id: asString(item?.id),
      title,
      image: asString(item?.media_url) || asString(item?.thumbnail_url),
      date,
      link: asString(item?.permalink),
      mediaType: asString(item?.media_type),
    });
  });

  return out
    .filter((item) => item.image && item.link && item.date instanceof Date)
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => b.date - a.date);
}

function createMessage(kind, text) {
  const el = document.createElement('div');
  el.className = `social-media-board-message social-media-board-message--${kind}`;
  el.textContent = text;
  if (kind === 'error') {
    el.setAttribute('role', 'alert');
  } else {
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
  }
  return el;
}

function createFilterButton(type, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'social-media-board-filter-btn';
  button.dataset.filter = type;
  button.setAttribute('aria-pressed', 'false');

  if (type === 'facebook' || type === 'instagram') {
    const logo = document.createElement('img');
    logo.className = 'social-media-board-filter-logo';
    logo.src = `/blocks/social-media-feeds/${type}-logo.png`;
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
    button.append(logo);
  }

  const text = document.createElement('span');
  text.textContent = label;
  button.append(text);

  return button;
}

function setActiveFilter(buttons, activeType) {
  buttons.forEach((btn) => {
    const isActive = btn.dataset.filter === activeType;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function getProxyUrl(proxy, type, limit) {
  const url = new URL(proxy, window.location.href);
  url.searchParams.set('type', type);
  url.searchParams.set('limit', String(limit));
  return url;
}

async function fetchSocial(proxy, type, limit) {
  const url = getProxyUrl(proxy, type, limit);
  const res = await fetch(url.toString());
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new Error(asString(data?.error) || `HTTP ${res.status}`);
  }
  if (data?.error) {
    throw new Error(asString(data.error));
  }
  return data || {};
}

function matchesSearch(itemTitle, term) {
  if (!term) return true;
  return asString(itemTitle).toLowerCase().includes(term.toLowerCase());
}

function createCard(item) {
  const card = document.createElement('a');
  card.className = 'social-media-board-card';
  card.href = item.link;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'social-media-board-image-wrap';

  const img = document.createElement('img');
  img.className = 'social-media-board-image';
  img.src = item.image;
  img.alt = item.title;
  img.loading = 'lazy';
  imageWrap.append(img);

  const logo = document.createElement('img');
  logo.className = 'social-media-board-logo';
  logo.src = `/blocks/social-media-feeds/${item.source}-logo.png`;
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');
  imageWrap.append(logo);

  card.append(imageWrap);

  const title = document.createElement('h3');
  title.className = 'social-media-board-title';
  title.textContent = item.title;
  card.append(title);

  const date = document.createElement('p');
  date.className = 'social-media-board-date';
  date.textContent = item.date.toLocaleDateString();
  card.append(date);

  return card;
}

export default async function decorate(block) {
  const rawConfig = readBlockConfig(block);

  const config = {
    proxy: asString(rawConfig.proxy).trim(),
    sources: parseSources(rawConfig.sources),
    pageSize: parsePositiveInt(rawConfig['page-size'], 18),
    maxItems: parsePositiveInt(rawConfig['max-items'], 50),
    showFilters: parseBoolean(rawConfig['show-filters'], true),
    showSearch: parseBoolean(rawConfig['show-search'], true),
  };

  block.textContent = '';

  if (!config.proxy) {
    block.append(createMessage('error', 'Brak konfiguracji: ustaw `proxy`. / Missing config: set `proxy`.'));
    return;
  }

  let proxyUrl;
  try {
    proxyUrl = new URL(config.proxy, window.location.href).toString();
  } catch (e) {
    block.append(createMessage('error', 'Nieprawidłowy `proxy`. / Invalid `proxy`.'));
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'social-media-board-controls';

  const filtersWrap = document.createElement('div');
  filtersWrap.className = 'social-media-board-filters';

  const searchWrap = document.createElement('div');
  searchWrap.className = 'social-media-board-search';

  const grid = document.createElement('div');
  grid.className = 'social-media-board-grid';

  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.className = 'social-media-board-load-more';
  loadMore.textContent = 'Załaduj więcej / Load more';
  loadMore.hidden = true;

  const message = createMessage('status', 'Ładowanie… / Loading…');

  block.append(controls, message, grid, loadMore);

  const sourceOptions = config.sources === 'all'
    ? ['all', 'facebook', 'instagram']
    : [config.sources];

  const filterButtons = [];
  if (config.showFilters) {
    const labels = {
      all: 'Wszystko / All',
      facebook: 'Facebook',
      instagram: 'Instagram',
    };

    sourceOptions.forEach((type) => {
      const btn = createFilterButton(type, labels[type]);
      filterButtons.push(btn);
      filtersWrap.append(btn);
    });

    controls.append(filtersWrap);
  }

  let searchTerm = '';
  let activeSource = sourceOptions.includes('all') ? 'all' : sourceOptions[0];
  let searchForm;
  let searchInput;

  if (config.showSearch) {
    const form = document.createElement('form');
    form.className = 'social-media-board-search-form';
    form.setAttribute('role', 'search');

    const searchId = `social-media-board-search-${Math.random().toString(36).slice(2, 10)}`;

    const label = document.createElement('label');
    label.className = 'social-media-board-sr-only';
    label.setAttribute('for', searchId);
    label.textContent = 'Szukaj / Search';

    const input = document.createElement('input');
    input.className = 'social-media-board-search-input';
    input.type = 'search';
    input.id = searchId;
    input.name = 'q';
    input.placeholder = 'Szukaj… / Search…';

    const button = document.createElement('button');
    button.className = 'social-media-board-search-btn';
    button.type = 'submit';
    button.textContent = 'Szukaj / Search';
    button.setAttribute('aria-label', 'Szukaj / Search');

    form.append(label, input, button);
    searchWrap.append(form);
    controls.append(searchWrap);

    searchForm = form;
    searchInput = input;
  }

  let items = [];
  try {
    const type = config.sources;
    const data = await fetchSocial(proxyUrl, type, config.maxItems);
    items = normalizeItems(data);
  } catch (e) {
    message.textContent = `Błąd ładowania: ${e.message} / Loading error: ${e.message}`;
    message.classList.remove('social-media-board-message--status');
    message.classList.add('social-media-board-message--error');
    message.setAttribute('role', 'alert');
    loadMore.hidden = true;
    return;
  }

  let filtered = [];
  let renderedCount = 0;

  function getFiltered() {
    const bySource = activeSource === 'all'
      ? items
      : items.filter((item) => item.source === activeSource);

    const term = searchTerm.trim();
    if (!term) return bySource;
    return bySource.filter((item) => matchesSearch(item.title, term));
  }

  function updateEmptyState() {
    if (filtered.length) {
      message.hidden = true;
      return;
    }

    message.hidden = false;
    message.classList.remove('social-media-board-message--error');
    message.classList.add('social-media-board-message--status');
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    message.textContent = 'Brak wyników. / No results.';
  }

  function renderNextPage(reset = false) {
    if (reset) {
      grid.textContent = '';
      renderedCount = 0;
    }

    const next = filtered.slice(renderedCount, renderedCount + config.pageSize);
    next.forEach((item) => grid.append(createCard(item)));
    renderedCount += next.length;

    loadMore.hidden = renderedCount >= filtered.length;
    updateEmptyState();
  }

  function applyAndRender(reset = true) {
    filtered = getFiltered();
    renderNextPage(reset);
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchTerm = searchInput.value.trim();
      applyAndRender(true);
    });

    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim() && searchTerm) {
        searchTerm = '';
        applyAndRender(true);
      }
    });
  }

  if (filterButtons.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeSource = btn.dataset.filter;
        setActiveFilter(filterButtons, activeSource);
        applyAndRender(true);
      });
    });
    setActiveFilter(filterButtons, activeSource);
  }

  loadMore.addEventListener('click', () => renderNextPage(false));

  message.hidden = true;
  applyAndRender(true);
}
