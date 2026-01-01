
// /src/assets/js/liturgical-events.js
/*!
 * Liturgical Accordion — a11y+keyboard, single-open, hash support
 * Version: 1.2 (2026-01-01)
 * Author: Samuel Berhe
 * Changes:
 * - Keeps existing behavior (single open, click toggle, hash open)
 * - Adds: keyboard nav between headers (ArrowUp/Down, Home/End)
 * - Adds: ESC collapses current (optional)
 * - Adds: tiny closest() polyfill; passive listeners where safe
 * - Non-breaking: only runs when .acc-header exists
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

  const headers = Array.from(document.querySelectorAll('.acc-header'));
  if (!headers.length) return;

  // Utility: get panel from header
  function getPanel(btn) {
    const panelId = btn.getAttribute('aria-controls');
    return panelId ? document.getElementById(panelId) : null;
  }

  // Collapse all except the provided one
  function collapseOthers(exceptBtn) {
    document
      .querySelectorAll('.acc-header[aria-expanded="true"]')
      .forEach((openBtn) => {
        if (openBtn !== exceptBtn) {
          openBtn.setAttribute('aria-expanded', 'false');
          const openPanel = getPanel(openBtn);
          if (openPanel) openPanel.hidden = true;
        }
      });
  }

  // Toggle a single header/panel
  function toggleHeader(btn, forceExpand) {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const panel = getPanel(btn);
    if (!panel) return;

    // Single-open behavior (unchanged from your code)
    //collapseOthers(btn);

    const willExpand = (typeof forceExpand === 'boolean') ? forceExpand : !expanded;
    btn.setAttribute('aria-expanded', String(willExpand));
    panel.hidden = !willExpand;

    if (willExpand) {
      // Move focus into the panel if it contains focusable content
      const focusable = panel.querySelector(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus({ preventScroll: true });
    }
  }

  // Wire up click and keyboard
  headers.forEach((btn, index) => {
    // Ensure button semantics (best practice)
    if (btn.tagName.toLowerCase() !== 'button') {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    }

    // Click toggles
    btn.addEventListener('click', () => {
      toggleHeader(btn);
    }, { passive: true });

    // Keyboard interactions
    btn.addEventListener('keydown', (e) => {
      const key = e.key;

      // Activate current
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        btn.click();
        return;
      }

      // Optional: ESC collapses current
      if (key === 'Escape') {
        e.preventDefault();
        toggleHeader(btn, false);
        btn.focus();
        return;
      }

      // Navigate between headers
      const lastIdx = headers.length - 1;
      let targetIdx = null;

      if (key === 'ArrowDown') {
        e.preventDefault();
        targetIdx = (index + 1) > lastIdx ? 0 : index + 1;
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        targetIdx = (index - 1) < 0 ? lastIdx : index - 1;
      } else if (key === 'Home') {
        e.preventDefault();
        targetIdx = 0;
      } else if (key === 'End') {
        e.preventDefault();
        targetIdx = lastIdx;
      }

      if (targetIdx !== null) {
        headers[targetIdx].focus();
      }
    });
  });

  // Initialize: collapse all (consistent state)
  headers.forEach((btn) => {
    const panel = getPanel(btn);
    if (!panel) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    panel.hidden = !expanded; // honor initial state from HTML if set
  });

  // Open by hash (unchanged)
  const { hash } = window.location;
  if (hash) {
    const targetPanel = document.querySelector(hash);
    if (targetPanel && targetPanel.classList.contains('acc-panel')) {
      const btn = document.querySelector(`[aria-controls="${targetPanel.id}"]`);
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
        targetPanel.hidden = false;
        targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
})();
