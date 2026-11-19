const hero = document.querySelector('.hero');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;
let photoTimer;

function updatePhotoRotation() {
  clearInterval(photoTimer);
  if (motionPaused || document.hidden) return;
  photoTimer = setInterval(() => hero.classList.toggle('has-alternate'), 15000);
}

function applyMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  updatePhotoRotation();
}
applyMotion();
motionPreference.addEventListener('change', event => { motionPaused = event.matches; applyMotion(); });
document.addEventListener('visibilitychange', updatePhotoRotation);
window.addEventListener('pagehide', () => clearInterval(photoTimer));
window.addEventListener('pageshow', updatePhotoRotation);
if (matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', event => {
    if (motionPaused) return;
    hero.style.setProperty('--px', `${(event.clientX / innerWidth - .5) * -10}px`);
    hero.style.setProperty('--py', `${(event.clientY / innerHeight - .5) * -7}px`);
  });
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--px', '0px'); hero.style.setProperty('--py', '0px'); });
}
document.querySelector('#year').textContent = new Date().getFullYear();
