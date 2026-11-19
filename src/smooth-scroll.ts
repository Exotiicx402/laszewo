import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './smooth-scroll.css'

new Lenis({
  autoRaf: true,
  lerp: 0.18,
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,
  anchors: true,
  respectReducedMotion: true,
  virtualScroll: ({ deltaX, deltaY }) => Math.abs(deltaY) >= Math.abs(deltaX),
  // Keep independent scroll regions native; horizontal carousel gestures
  // continue to be handled by the carousel itself.
  prevent: node => node.id === 'show-rows' || node.classList.contains('dcc-list'),
})
