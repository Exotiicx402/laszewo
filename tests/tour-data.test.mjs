import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeShows, rankShows, safeLink } from '../dist/tour-data.js';

const now = new Date('2026-11-19T01:00:00Z');
const row = {
  productId: 'la', title: 'January 29th - Hollywood Palladium (Night 2)',
  isPublic: true, isLive: true, eventDate: Date.UTC(2027, 0, 29), endDate: Date.UTC(2026, 9, 16),
  link: 'https://www.ticketmaster.com/event/example', slug: 'example',
  location: { name: 'Los Angeles', timezoneId: 'America/Los_Angeles', country: { name: 'United States' }, latitude: -118.2437, longitude: 34.0522 },
};

test('all public listings remain, including past dates still on Laylo; private entries stay out', () => {
  const shows = normalizeShows({ orderedSubProducts: [row, { ...row, productId: 'draft', isPublic: false }, { ...row, productId: 'past', eventDate: Date.UTC(2026, 9, 1) }] }, now);
  assert.equal(shows.length, 2);
  assert.equal(shows[0].date, '2027-01-29');
  assert.equal(shows[0].lat, 34.0522);
  assert.equal(shows[0].lon, -118.2437);
});

test('nearby Los Angeles is shown first for San Diego, while Chicago stays unmarked', () => {
  const la = normalizeShows({ orderedSubProducts: [row] }, now)[0];
  const chicago = { ...la, id: 'chicago', date: '2027-01-16', lat: 41.8781, lon: -87.6298 };
  const ranked = rankShows([chicago, la], { lat: 32.7157, lon: -117.1611 });
  assert.equal(ranked[0].id, 'la');
  assert.equal(ranked[0].near, true);
  assert.equal(ranked[1].near, false);
  assert.equal(rankShows([chicago, la], null)[0].id, 'chicago');
});

test('event dates retain their published calendar day; sold-out shows lead to their waitlist', () => {
  const sold = normalizeShows({ orderedSubProducts: [{ ...row, title: 'January 29th - Hollywood Palladium (SOLD OUT)' }] }, now)[0];
  assert.equal(sold.soldOut, true);
  assert.equal(sold.date, '2027-01-29');
  assert.equal(sold.action, 'Waitlist');
  assert.equal(sold.venue, 'Hollywood Palladium');
  assert.equal(sold.url, 'https://laylo.com/laszewo/example');
  assert.equal(safeLink('javascript:alert(1)'), null);
});

test('undated RSVP and city-request entries are included without treating campaign deadlines as dates', () => {
  const sydney = { ...row, productId: 'sydney', title: 'Sydney 👀', eventDate: null, isLive: null, link: null, slug: 'hmjFtBmj' };
  const city = { ...sydney, productId: 'city', title: "Don't see your city?", location: null, slug: 'Vs0qC' };
  const shows = normalizeShows({ orderedSubProducts: [row, sydney, city, row] });
  assert.equal(shows.length, 3);
  assert.equal(shows[0].action, 'Tickets');
  assert.equal(shows[1].date, null);
  assert.equal(shows[1].action, 'RSVP');
  assert.equal(shows[1].url, 'https://laylo.com/laszewo/hmjFtBmj');
  assert.equal(shows[2].url, 'https://laylo.com/laszewo/Vs0qC');
  assert.equal(rankShows(shows, null).at(-1).id, 'city');
});


test('Denver remains included when the maintained feed omits its event date', () => {
  const denver = { ...row, productId: '6302a099-f20f-4f67-927e-580edfefe605', title: 'January 15th - Mission Ballroom', eventDate: null };
  const shows = normalizeShows({ orderedSubProducts: [denver] }, now);
  assert.equal(shows.length, 1);
  assert.equal(shows[0].date, '2027-01-15');
});
