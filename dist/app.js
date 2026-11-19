const hero = document.querySelector('.hero');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;
let photoTimer;
let introActive = document.documentElement.classList.contains('intro-pending');
let finishIntro = () => {};

function updatePhotoRotation() {
  clearInterval(photoTimer);
  if (motionPaused || document.hidden || introActive) return;
  photoTimer = setInterval(() => hero.classList.toggle('has-alternate'), 15000);
}

function applyMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  if (motionPaused) finishIntro();
  updatePhotoRotation();
}
applyMotion();
motionPreference.addEventListener('change', event => { motionPaused = event.matches; applyMotion(); });
document.addEventListener('visibilitychange', updatePhotoRotation);
window.addEventListener('pagehide', () => clearInterval(photoTimer));
window.addEventListener('pageshow', updatePhotoRotation);
if (matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', event => {
    if (motionPaused || introActive) return;
    hero.style.setProperty('--px', `${(event.clientX / innerWidth - .5) * -10}px`);
    hero.style.setProperty('--py', `${(event.clientY / innerHeight - .5) * -7}px`);
  });
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--px', '0px'); hero.style.setProperty('--py', '0px'); });
}
document.querySelector('#year').textContent = new Date().getFullYear();

async function playSiteIntro() {
  if (!introActive) return;
  const root = document.documentElement;
  const brand = document.querySelector('.brand');
  const gif = brand.querySelector('.brand-loop');
  const curtain = document.querySelector('.site-intro');
  const content = [document.querySelector('.site-header'), document.querySelector('main')];
  const originalInert = content.map(element => element.inert);
  const animations = [];
  const events = new AbortController();
  let timeout;
  finishIntro = () => {
    if (!introActive) return;
    introActive = false;
    clearTimeout(timeout);
    events.abort();
    root.classList.remove('intro-pending', 'intro-running');
    animations.forEach(animation => animation.cancel());
    content.forEach((element, index) => { element.inert = originalInert[index]; });
    updatePhotoRotation();
  };

  // Input skips the introduction without intercepting native scrolling.
  const options = { passive: true, signal: events.signal };
  ['wheel', 'touchstart', 'pointerdown', 'keydown', 'resize', 'pagehide'].forEach(type => window.addEventListener(type, finishIntro, options));
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishIntro(); }, options);
  timeout = setTimeout(finishIntro, 4500);

  try {
    await Promise.race([gif.decode(), new Promise(resolve => setTimeout(resolve, 500))]);
    if (!introActive) return;
    if (motionPaused || document.hidden || !gif.naturalWidth || !brand.animate) { finishIntro(); return; }
    const rect = brand.getBoundingClientRect();
    if (!rect.width || rect.top < 0) { finishIntro(); return; }
    const scale = Math.min(240, innerWidth * 0.55) / rect.width;
    const from = `translate3d(${innerWidth / 2 - rect.left - rect.width / 2}px, ${innerHeight / 2 - rect.top - rect.height / 2}px, 0) scale(${scale})`;
    const timing = { duration: 2400, fill: 'both' };
    const easing = 'cubic-bezier(.76,0,.24,1)';
    content.forEach(element => { element.inert = true; });
    animations.push(brand.animate([
      { transform: from, offset: 0 },
      { transform: from, offset: 0.58, easing },
      { transform: 'none', offset: 1 },
    ], timing));
    animations.push(curtain.animate([
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(0)', offset: 0.64, easing },
      { transform: 'translateY(-100%)', offset: 1 },
    ], timing));
    root.classList.replace('intro-pending', 'intro-running');
    await Promise.allSettled(animations.map(animation => animation.finished));
    finishIntro();
  } catch { finishIntro(); }
}
playSiteIntro();
