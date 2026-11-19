import { normalizeShows, rankShows, validCoordinates } from './tour-data.js';

const FEED = 'https://d21i0hc4hl3bvt.cloudfront.net/laszewo/3d4B2.json';
const list = document.querySelector('#show-rows');
const more = document.querySelector('#show-more');
const scrollMeta = document.querySelector('#show-scroll-meta');
const position = document.querySelector('#show-position');
const scrollHint = document.querySelector('#show-scroll-hint');
const locate = document.querySelector('#locate-shows');
const status = document.querySelector('#location-status');
const range = document.querySelector('#show-years');
const countryCodes = { 'United States': 'US', 'Canada': 'CA', 'Australia': 'AU', 'New Zealand': 'NZ', 'United Kingdom': 'UK' };
let shows = [], visitor = null, liveLoaded = false, preciseLocation = false;

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function render() {
  const rows = rankShows(shows, visitor);
  const previousScroll = list.scrollTop;
  const fragment = document.createDocumentFragment();
  rows.forEach(show => {
    const row = element('a', 'show-row');
    row.href = show.url;
    row.target = '_blank';
    row.rel = 'noopener';
    row.dataset.showId = show.id;
    let time;
    if (show.date) {
      const date = new Date(`${show.date}T12:00:00Z`);
      time = element('time');
      time.dateTime = show.date;
      time.append(element('span', '', date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })), document.createTextNode(String(date.getUTCDate()).padStart(2, '0')));
    } else {
      time = element('span', 'show-date-placeholder', show.city ? 'TBA' : 'RSVP');
      if (show.city) time.setAttribute('aria-label', 'Date to be announced');
    }
    const info = element('span', 'show-info');
    const city = [show.city, countryCodes[show.country] || show.country].filter(Boolean).join(', ');
    const cityLine = element('span', 'show-city');
    cityLine.append(element('strong', '', show.date ? city || show.title : show.title));
    if (show.near) {
      const badge = element('span', 'near-badge', 'Near you');
      badge.title = `Approximately ${Math.round(show.distance)} km away`;
      cityLine.append(badge);
    }
    info.append(cityLine);
    const subtitle = show.date ? show.venue : city;
    if (subtitle) info.append(element('span', 'show-venue', subtitle));
    row.append(time, info, element('span', 'show-action flow-button', show.action));
    fragment.append(row);
  });
  if (!rows.length) fragment.append(element('p', 'shows-empty', 'New dates coming soon. Follow Łaszewo on Laylo for updates.'));
  list.replaceChildren(fragment);
  list.scrollTop = previousScroll;
  requestAnimationFrame(updateScrollState);
  const years = [...new Set(rows.filter(show => show.date).map(show => show.date.slice(0, 4)))].sort();
  range.textContent = years.join(' / ');
  if (visitor) {
    const nearby = rows.filter(show => show.near && show.date).length;
    status.textContent = nearby ? `${nearby} ${nearby === 1 ? 'show' : 'shows'} near you. Nearby dates appear first.` : 'No shows within 250 km yet. All upcoming dates are below.';
  }
}

function updateScrollState() {
  const overflow = list.scrollHeight > list.clientHeight + 1;
  const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
  more.hidden = !overflow;
  scrollMeta.hidden = !overflow;
  list.tabIndex = overflow ? 0 : -1;
  more.textContent = atEnd ? 'Back to top' : 'See more';
  scrollHint.textContent = atEnd ? 'All shows & updates' : 'Scroll for more';
  const bounds = list.getBoundingClientRect();
  const rows = [...list.querySelectorAll('.show-row')];
  const visible = rows.map((row, index) => ({ bounds: row.getBoundingClientRect(), index }))
    .filter(row => row.bounds.bottom > bounds.top + 1 && row.bounds.top < bounds.bottom - 1);
  position.textContent = visible.length ? `${visible[0].index + 1}–${visible.at(-1).index + 1} of ${rows.length}` : '';
}

more.addEventListener('click', () => {
  const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
  list.scrollTo({ top: atEnd ? 0 : list.scrollTop + list.clientHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
list.addEventListener('scroll', updateScrollState, { passive: true });
new ResizeObserver(updateScrollState).observe(list);

locate.addEventListener('click', () => {
  if (!navigator.geolocation) { status.textContent = 'Location is unavailable in this browser. All upcoming dates are below.'; return; }
  locate.disabled = true;
  locate.textContent = 'Finding nearby shows…';
  status.textContent = 'Allow location access to find your nearest shows.';
  const done = () => { locate.disabled = false; locate.textContent = 'Find shows near me'; };
  navigator.geolocation.getCurrentPosition(position => {
    visitor = { lat: position.coords.latitude, lon: position.coords.longitude };
    preciseLocation = true;
    done();
    render();
  }, () => {
    done();
    status.textContent = visitor ? 'Using your approximate area. You can also browse every date below.' : 'Location access is unavailable. You can still browse every date below.';
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
});

// Render a local snapshot quickly; keep it if the maintained public feed is unavailable.
fetch('assets/shows.json').then(response => {
  if (!response.ok) throw new Error('Snapshot unavailable');
  return response.json();
}).then(data => {
  if (!liveLoaded) { shows = data.shows; render(); }
}).catch(() => {
  if (!liveLoaded) status.textContent = 'Open the full schedule on Laylo for the latest dates.';
});

fetch(FEED, { credentials: 'omit', signal: AbortSignal.timeout(10000) }).then(async response => {
  if (!response.ok) throw new Error('Tour feed unavailable');
  const data = await response.json();
  if (!Array.isArray(data.orderedSubProducts)) throw new Error('Invalid tour feed');
  shows = normalizeShows(data);
  liveLoaded = true;
  const lat = response.headers.get('CloudFront-Viewer-Latitude');
  const lon = response.headers.get('CloudFront-Viewer-Longitude');
  if (!preciseLocation && lat?.trim() && lon?.trim() && validCoordinates(Number(lat), Number(lon))) {
    visitor = { lat: Number(lat), lon: Number(lon) };
  }
  render();
}).catch(() => { /* The local public-date snapshot and Laylo link remain available. */ });
