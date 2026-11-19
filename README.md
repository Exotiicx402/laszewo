# Łaszewo

Artist website with a React music carousel. Serve `dist/` with any static server.

### Deployment

Source repository: https://github.com/Exotiicx402/laszewo. Vercel builds the `main` branch using `npm ci`, then `npm run typecheck && npm run build`, and serves `dist/`. This is a static deployment; it does not require server functions, a database, or environment secrets. Production hosting uses the existing Dtrain team.

- Official 2026 press photography provided through Gavin’s Drive link.
- Desktop and mobile share the same two hero photos (`a.webp` and `b.webp`), crossfading every 15 seconds. The hero has no play or manual photo-switch buttons. Rotation pauses in hidden tabs and for reduced-motion preferences.
- Mobile and small-tablet heroes preserve the full 3:2 photo frame so all three members remain visible, with navigation above and the wordmark below. `src/mobile.css` also adapts music titles, track navigation, show rows, and footer spacing for narrow screens; the build copies it to `dist/mobile.css`.
- Existing Łaszewo wordmark and three-person symbol from laszewo.com.
- User-supplied pastel figures GIF in the header, with its original colors and timing. CSS frames its transparent margins; the original file is unchanged. Reduced-motion preferences show the static symbol.
- Social platform logos from Simple Icons (https://simpleicons.org/), stored locally as SVGs.
- All 10 Spotify Top tracks from the official artist embed (November 18, 2026), with matching artwork, preview audio, durations, Spotify links, and collaborator credits. Longer titles wrap responsively and the track picker scrolls.
- Full schedule and ticket purchases remain on the existing Laylo tour drop.
- The tour section reads every public entry from the live Laylo tour feed, including undated RSVPs and city requests, and deduplicates by product ID. All entries are available in a keyboard/touch/wheel-scrollable list over the photo. “See more” advances within that list; the photo and section dimensions stay fixed. `dist/assets/shows.json` is a public-listing fallback snapshot. Denver’s January 15, 2027 date is missing from the feed’s eventDate field, so its date is explicitly verified against the linked AXS listing; a future populated eventDate takes precedence. Campaign endDate values are never used as show dates.
- Yellow “Near you” labels use a 250 km radius, approximate CloudFront location headers, and optionally a visitor-approved browser location. Nearby dates appear first; visitor coordinates stay in memory and are not stored or sent elsewhere.

The supplied Disc Cascade Carousel lives in `components/ui/disc-cascade-carousel.tsx`; `src/music-section.tsx` connects it to real track artwork, preview audio, and Spotify destinations. It mounts into the existing static page as a React island. TypeScript and Tailwind are configured with a `components.json` file for the shadcn folder conventions.

The music section displays solid circular artwork, with its center cutout and silver hub ring removed through the section styles.

`src/smooth-scroll.ts` adds subtle Lenis page scrolling with a 0.18 lerp and normal wheel distance. Touch gestures and nested tour/track lists stay native. Anchor links use Lenis, and reduced-motion preferences are respected. The build bundles Lenis and its styles locally into `dist/smooth-scroll.js` and `dist/smooth-scroll.css`.

Run `npm ci`, then `npm run typecheck` and `npm run build` after changes to the music section. The build writes `dist/music-section.js` and `dist/music-section.css`. Main page content and the remaining site styles stay in `dist/index.html`, `dist/style.css`, and `dist/app.js`. `node --check dist/app.js` checks the static page interactions.

The carousel supports drag/flick, horizontal trackpad swipes, keyboard navigation, direct track selection, and disc click to play/pause. Switching tracks while playing or loading immediately starts the selected preview. Switching while paused keeps playback paused. Audio starts only from a visitor action, and motion respects the system preference.

Images are web-optimized copies. Original high-resolution photographs and research notes are stored outside this site checkout, under the parent Laszewo folder.


### Shared Flow buttons

`components/ui/flow-button.tsx` contains typed `FlowButton` and `FlowLink` components, with a standalone demo in `components/flow-button-demo.tsx`. The site already uses React, TypeScript, Tailwind v4, the `@/*` import alias, and a shadcn `components.json` pointing to `/components/ui`; no project initialization is needed.

`src/flow-button.css` owns the shared pill shape, expanding circular hover fill, 12px hover corners, focus treatment, and pressed state. The build copies it to `dist/flow-button.css` so static HTML controls and React controls use the same style. Labels stay centered without decorative arrows. Lucide supplies only functional track navigation and menu icons. Reduced-motion preferences remove animation. Disc artwork itself remains the carousel's artwork rather than becoming a pill button.

### Copy policy

Use only artist copy verified on the official site or in Gavin’s supplied resources. See `COPY-SOURCES.md` for the source record and `AGENTS.md` for the persistent project rule. The separator contains only the official three-person symbol.
