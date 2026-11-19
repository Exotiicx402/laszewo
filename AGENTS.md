# Łaszewo project requirements

- Use only marketing/editorial copy from https://www.laszewo.com/ or the resources Gavin sent. Record the exact source in `COPY-SOURCES.md`. Do not invent taglines, slogans, promotional descriptions, or promotional CTAs. Remove unverified copy instead of replacing it with newly written brand language.
- The user explicitly rejected “For the feeling”, “For the people”, and “You're one of us”; never reintroduce them. Earlier rejected copy includes “Good people”, “Loud music”, and “From us, to wherever you are”.
- Display music covers as solid circles, without center holes or silver hub rings obscuring the artwork.
- Use the same hero photos on mobile and desktop. Automatically transition every 15 seconds; no hero play or manual photo-switch buttons.
- Keep all three members visible in both mobile hero photos: preserve the full landscape frame instead of cropping to a tall viewport.
- Preserve the user's requested functional controls, track metadata, real show data, and descriptive accessibility/status text; these are interface behavior, not artist slogans.
- No decorative arrows in buttons, links, or CTAs. Functional directional controls are allowed.
- Preserve public access to the deployed site.
- Publish this repository through its GitHub integration with Vercel in the existing Dtrain team. The production branch is `main`; `vercel.json` declares the build and static output.
- Keep manual page scrolling native: do not reintroduce Lenis wheel interception or scroll-driven hero style updates. CSS may ease anchor navigation while respecting reduced motion.
- Show the GIF intro only on the first visit per browser, remembered in localStorage. Animate the actual logo to its header position; respect reduced motion and keep input able to skip. Hero photo swaps use the original clip-path curtain reveal, never opacity crossfades.
