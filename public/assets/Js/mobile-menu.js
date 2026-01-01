// /assets/js/mobile-menu.js
/*!
 * Mobile Menu — a11y, responsive, non-breaking
 * Version: 1.2 (2026-01-01)
 * Author: Samuel Berhe
 * Changes:
 * - Keeps existing behavior (toggle, accordion, outside-click close)
 * - Adds: focus trap in panel, ESC to close, keyboard support for accordion
 * - Adds: desktop resize auto-close, passive listeners where safe
 * - Adds: small closest() polyfill for older browsers
 */

(function init() {
  'use strict';

  // --- Tiny polyfill for Element.closest (cross-browser) ---
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (selector) {
      let el = this;
      while (el && el.nodeType === 1) {
        if (el.matches(selector)) return el;
        el = el.parentElement || el.parentNode;
      }
      return null;
    };
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    const btn   = document.querySelector('.mobile-menu-btn');
    const panel = document.getElementById('mobileMenu');

    if (!btn || !panel) {
      console.warn('[mobile-menu] Missing .mobile-menu-btn or #mobileMenu in DOM');
      return;
    }

    // Ensure the button doesn't submit forms
    if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');

    console.log('[mobile-menu] initialized');

    // --- Helpers for a11y focus trap ---
    let lastFocused = null;

    function getFocusable(container) {
      return Array.from(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
    }

    function openPanel() {
      lastFocused = document.activeElement;
      panel.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');

      const focusables = getFocusable(panel);
      if (focusables.length) {
        // Focus the first interactive element in the panel
        focusables[0].focus();
      }

      document.addEventListener('keydown', trapTab, true);
      document.addEventListener('keydown', onEsc, true);
    }

    function closePanel() {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');

      document.removeEventListener('keydown', trapTab, true);
      document.removeEventListener('keydown', onEsc, true);

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function trapTab(e) {
      if (e.key !== 'Tab') return;
      const focusables = getFocusable(panel);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function onEsc(e) {
      if (e.key === 'Escape') {
        closePanel();
      }
    }

    // --- Toggle the panel open/close ---
    btn.addEventListener('click', function () {
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        closePanel();
        console.log('[mobile-menu] toggle panel: CLOSED');
      } else {
        openPanel();
        console.log('[mobile-menu] toggle panel: OPEN');
      }
    }, { passive: true });

    // --- Event delegation for accordion items inside the panel ---
    panel.addEventListener('click', function (e) {
      // Find a click on .mm-accordion
      const trigger = e.target.closest('.mm-accordion');
      if (!trigger) return;

      // Toggle aria-expanded and corresponding submenu (.mm-sub)
      const item = trigger.closest('.mm-item');
      const sub  = trigger.nextElementSibling; // expected .mm-sub
      const open = trigger.getAttribute('aria-expanded') === 'true';

      trigger.setAttribute('aria-expanded', String(!open));
      if (item) item.classList.toggle('open', !open);
      if (sub)  sub.style.display = open ? 'none' : 'block';

      console.log('[mobile-menu] accordion:', { label: trigger.textContent.trim(), open: !open });
    }, { passive: true });

    // --- Keyboard support for accordion headers ---
    panel.addEventListener('keydown', function (e) {
      const trigger = e.target.closest('.mm-accordion');
      if (!trigger) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Simulate click to reuse the same logic
        trigger.click();
      }
    });

    // --- Optional: click outside to close ---
    document.addEventListener('click', function (e) {
      const isOpen = panel.classList.contains('open');
      if (!isOpen) return;

      const clickInside = panel.contains(e.target) || btn.contains(e.target);
      if (!clickInside) {
        closePanel();
        console.log('[mobile-menu] closed by outside click');
      }
    }, { capture: true });

    // --- Auto-close if viewport switches to desktop (UX) ---
    const mqDesktop = window.matchMedia('(min-width: 769px)');
    function onMediaChange() {
      if (mqDesktop.matches && panel.classList.contains('open')) {
        closePanel();
        console.log('[mobile-menu] closed due to desktop viewport');
      }
    }
    if (mqDesktop.addEventListener) {
      mqDesktop.addEventListener('change', onMediaChange);
    } else if (mqDesktop.addListener) {
      mqDesktop.addListener(onMediaChange);
    }
  });

  // If your site uses client-side navigation libraries, re-init on their events:
  ['turbolinks:load', 'htmx:load'].forEach(evt => {
    document.addEventListener(evt, function () {
      console.log('[mobile-menu] re-init on', evt);
      init();
    }, { once: true });
  });
})();
