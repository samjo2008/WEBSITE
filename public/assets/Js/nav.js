
// /src/assets/js/nav.js
/*!
 * Main Navigation — a11y + responsive (desktop hover/focus, mobile tap)
 * Version: 1.2 (2026-01-01)
 * Author: Samuel Berhe
 * Notes:
 * - Preserves existing behavior; improves keyboard handling and mobile toggling
 * - Uses matchMedia with legacy fallback; adds tiny closest() polyfill
 * - Avoids unsafe DOM injection; keeps ARIA attributes up-to-date
 */
(function () {
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

  ready(function initNav() {
    const parents = Array.from(document.querySelectorAll('.has-submenu'));
    if (!parents.length) return;

    const mqMobile = window.matchMedia('(max-width: 768px)');

    // Helper: set expanded
    function setExpanded(trigger, expanded) {
      trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    // Initialize ARIA for each submenu group
    parents.forEach(item => {
      const trigger = item.querySelector('.nav-link');
      const submenu = item.querySelector('.submenu');
      if (!trigger || !submenu) return;

      // Ensure ARIA attributes exist
      trigger.setAttribute('aria-haspopup', 'true');
      if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');

      // Keyboard: open when focusing inside; close when leaving container
      item.addEventListener('focusin', () => {
        setExpanded(trigger, true);
      }, { passive: true });

      item.addEventListener('focusout', (e) => {
        // Close only when focus leaves the whole item (not when moving inside)
        if (!item.contains(e.relatedTarget)) {
          setExpanded(trigger, false);
        }
      });

      // Mobile: toggle on tap/click (prevent navigation only on mobile)
      trigger.addEventListener('click', (e) => {
        const isMobile = mqMobile.matches;
        if (isMobile) {
          e.preventDefault();
          const expanded = trigger.getAttribute('aria-expanded') === 'true';
          setExpanded(trigger, !expanded);
        }
      }, { passive: false });

      // ESC closes the submenu and returns focus to trigger
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setExpanded(trigger, false);
          trigger.focus();
        }
        // A11y: Enter/Space activates trigger consistently
        if ((e.key === 'Enter' || e.key === ' ') && e.target === trigger) {
          const isMobile = mqMobile.matches;
          if (isMobile) {
            e.preventDefault();
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            setExpanded(trigger, !expanded);
          }
        }
      });

      // Optional: close on outside click for mobile to avoid multiple open menus
      document.addEventListener('click', (e) => {
        const isMobile = mqMobile.matches;
        if (!isMobile) return;
        // If clicking outside current item and it's expanded, close it
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          const inside = item.contains(e.target);
          if (!inside) setExpanded(trigger, false);
        }
      }, { capture: true });
    });

    // If viewport switches to desktop, close all mobile-expanded submenus
    function onViewportChange() {
      if (!mqMobile.matches) {
        parents.forEach(item => {
          const trigger = item.querySelector('.nav-link');
          if (trigger) setExpanded(trigger, false);
        });
      }
    }
    if (mqMobile.addEventListener) {
      mqMobile.addEventListener('change', onViewportChange);
    } else if (mqMobile.addListener) {
      mqMobile.addListener(onViewportChange); // legacy Safari/IE
    }
  });

  // Re-init on client-side navigation events (if your site uses them)
  ['turbolinks:load', 'htmx:load'].forEach(evt => {
    document.addEventListener(evt, function () {
      // Re-run init safely once
      (function () {
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
      })();
    }, { once: true });
  });
})();
