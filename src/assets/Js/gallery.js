
// /src/assets/js/gallery.js
/*!
 * Gallery — multi-album hero + thumbnails (a11y + performance)
 * Version: 1.2 (2026-01-01)
 * Author: Samuel Berhe
 * Changes:
 * - Keeps album behavior and selectors intact (heroImage-*, .thumb-*, .album-prev/.album-next)
 * - Adds: lazy loading for thumbnails via IntersectionObserver (if supported)
 * - Adds: keyboard activation for thumbnails (Enter/Space)
 * - Adds: aria-current="true" on active thumbnail
 * - Non-breaking: runs only when expected elements exist
 */

document.addEventListener('DOMContentLoaded', () => {
  // Albums present in your collections
  const ALBUMS = ['meskel', 'gena', 'timket', 'fasika', 'kidanemihretYekatit', 'kidanemihretNehase'];

  // Lazy-load thumbnails if supported (performance)
  const canLazy = 'IntersectionObserver' in window;
  let io = null;

  if (canLazy) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src && img.src !== src) {
          img.src = src;
        }
        io.unobserve(img);
      });
    }, { rootMargin: '150px' });
  }

  function setActiveThumb(thumbs, activeIdx) {
    thumbs.forEach((t, idx) => {
      const isActive = idx === activeIdx;
      t.classList.toggle('active', isActive);
      if (isActive) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  }

  function updateHero(album, index) {
    const hero = document.getElementById(`heroImage-${album}`);
    const thumbs = Array.from(document.querySelectorAll(`.thumb-${album}`));
    if (!hero || !thumbs[index]) return;

    const fullSrc = thumbs[index].dataset.full || thumbs[index].src;
    const alt = thumbs[index].alt || '';

    // Update hero image src and alt
    if (fullSrc) hero.src = fullSrc;
    if (alt) hero.alt = alt;

    setActiveThumb(thumbs, index);
  }

  ALBUMS.forEach(album => {
    const hero = document.getElementById(`heroImage-${album}`);
    const thumbs = Array.from(document.querySelectorAll(`.thumb-${album}`));
    const prevBtn = document.querySelector(`.album-prev[data-target="${album}"]`);
    const nextBtn = document.querySelector(`.album-next[data-target="${album}"]`);

    if (!hero || thumbs.length === 0) return;

    // Initialize lazy loading for thumbs (if supported)
    if (canLazy && io) {
      thumbs.forEach(img => {
        // Only observe if a data-src exists; otherwise it's already loaded
        if (img.hasAttribute('data-src')) {
          io.observe(img);
        }
        // Ensure thumbnails can be focused via keyboard
        if (!img.hasAttribute('tabindex')) {
          img.setAttribute('tabindex', '0');
        }
      });
    } else {
      // Fallback: set src from data-src immediately
      thumbs.forEach(img => {
        const src = img.getAttribute('data-src');
        if (src && img.src !== src) img.src = src;
        if (!img.hasAttribute('tabindex')) img.setAttribute('tabindex', '0');
      });
    }

    // State per album
    let currentIndex = 0;

    // Ensure initial hero is set and active thumb marked
    updateHero(album, currentIndex);

    // Thumbnail click → update hero
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        currentIndex = index;
        updateHero(album, currentIndex);
      }, { passive: true });

      // Keyboard support: Enter/Space activates thumbnail
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          currentIndex = index;
          updateHero(album, currentIndex);
        }
      });
    });

    // Next button
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % thumbs.length;
        updateHero(album, currentIndex);
      }, { passive: true });

      // Keyboard support for next button
      nextBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          currentIndex = (currentIndex + 1) % thumbs.length;
          updateHero(album, currentIndex);
        }
      });
    }

    // Previous button
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
        updateHero(album, currentIndex);
      }, { passive: true });

      // Keyboard support for prev button
      prevBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          currentIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
          updateHero(album, currentIndex);
        }
      });
    }
  });
});
