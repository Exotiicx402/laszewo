export const NEARBY_RADIUS_KM = 250;
// This publicly listed show has no eventDate in Laylo. Confirmed against AXS:
// https://www.axs.com/events/1622831/yaszewo-tickets (January 15, 2027).
const VERIFIED_EVENT_DATES = { '6302a099-f20f-4f67-927e-580edfefe605': Date.UTC(2027, 0, 15) };

export function validCoordinates(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

export function distanceKm(a, b) {
  const rad = n => n * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

export function safeLink(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}

export function normalizeShows(data) {
  const seen = new Set();
  const shows = [];
  for (const row of data.orderedSubProducts || []) {
    // Match every public entry on Laylo, including undated RSVP drops.
    if (!row.isPublic || seen.has(row.productId)) continue;
    // endDate is a campaign deadline, not a show date.
    const dateValue = row.eventDate ?? VERIFIED_EVENT_DATES[row.productId];
    const date = Number.isFinite(dateValue) ? new Date(dateValue) : null;
    const location = row.location || {};
    const title = String(row.title || '');
    const soldOut = /sold\s*out/i.test(title);
    const rsvpUrl = row.slug ? `https://laylo.com/laszewo/${encodeURIComponent(row.slug)}` : 'https://laylo.com/laszewo/3d4B2';
    const ticketUrl = safeLink(row.link);
    const action = soldOut ? 'Waitlist' : row.isLive && ticketUrl ? 'Tickets' : 'RSVP';
    const url = action === 'Tickets' ? ticketUrl : rsvpUrl;
    if (!url) continue;
    seen.add(row.productId);
    // Laylo's public feed stores longitude in latitude and latitude in longitude.
    const lat = location.longitude, lon = location.latitude;
    shows.push({
      id: row.productId,
      date: date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null,
      title,
      action,
      venue: title.replace(/^.*?\s[-–]\s/, '').replace(/\s*\(SOLD OUT\)\s*/ig, '').trim(),
      city: location.friendlyName || location.name || '',
      country: location.country?.name || '',
      timezone: location.timezoneId || 'UTC',
      lat: validCoordinates(lat, lon) ? lat : null,
      lon: validCoordinates(lat, lon) ? lon : null,
      soldOut,
      url,
    });
  }
  return shows;
}

export function rankShows(shows, visitor) {
  return shows.map(show => {
    const distance = visitor && validCoordinates(show.lat, show.lon) ? distanceKm(visitor, show) : null;
    return { ...show, distance, near: distance !== null && distance <= NEARBY_RADIUS_KM };
  }).sort((a, b) => Number(b.near) - Number(a.near) || (a.date || '9999').localeCompare(b.date || '9999'));
}
