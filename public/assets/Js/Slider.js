// /src/assets/js/slider.js
/*!
 * Hero Slider — accessible, reduced-motion friendly
 * Version: 1.2 (2026-01-01)
 * Author: Samuel Berhe
 * Changes:
 * - Keeps existing behavior (autoplay, arrows, keyboard)
 * - Adds: prefers-reduced-motion respect; requestAnimationFrame in autoplay
 * - Adds: key activation for buttons (Enter/Space); pauses on focus
 * - Non-breaking: only runs if .hero and .slide exist
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroEl  = document.querySelector('.hero');
  const slides  = Array.from(document.querySelectorAll('.hero .slide'));
  const prevBtn = document.querySelector('.hero-nav.prev');
  const nextBtn = document.querySelector('.hero-nav.next');

  if (!slides.length || !heroEl) {
    console.warn('[slider] No .slide elements or .hero container found.');
    return;
  }

  // Initial active index
  let index = slides.findIndex(s => s.classList.contains('active'));
  if (index < 0) {
    index = 0;
    slides[index].classList.add('active');
  }

  function show(i) {
    slides.forEach(s => s.classList.remove('active'));
    slides[i].classList.add('active');
    index = i;
  }

  function next() { show((index + 1) % slides.length); }
  function prev() { show((index - 1 + slides.length) % slides.length); }

  // Wire buttons (if present)
  if (nextBtn) nextBtn.addEventListener('click', next, { passive: true });
  if (prevBtn) prevBtn.addEventListener('click', prev, { passive: true });

  // Keyboard support for arrow keys (global)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // A11y: allow Enter/Space to activate buttons
  [nextBtn, prevBtn].forEach(btn => {
    if (!btn) return;
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (btn === nextBtn ? next : prev)();
      }
    });
  });

  // --- AUTOPLAY ---
  const AUTOPLAY_MS = 6000;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;

  function startAutoplay() {
    if (timer || prefersReduced) return; // do not start if reduced motion
    // Use rAF for smoother tick alignment
    timer = setInterval(() => {
      window.requestAnimationFrame(next);
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  // Start autoplay after DOM ready
  startAutoplay();

  // Pause on hover/focus, resume on leave/blur
  heroEl.addEventListener('mouseenter', stopAutoplay, { passive: true });
  heroEl.addEventListener('mouseleave', startAutoplay, { passive: true });
  heroEl.addEventListener('focusin', stopAutoplay);
  heroEl.addEventListener('focusout', startAutoplay);

  // Pause when the page/tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Optional: start autoplay only when hero is in view (uncomment to use)
  // if ('IntersectionObserver' in window) {
  //   const io = new IntersectionObserver(([entry]) => {
  //     if (entry.isIntersecting) startAutoplay();
  //     else stopAutoplay();
  //   }, { threshold: 0.3 });
  //   io.observe(heroEl);
  // }

  // Initialize view
  show(index);
});
