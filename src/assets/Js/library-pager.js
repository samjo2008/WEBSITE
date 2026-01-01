
/*!
 * Library Pager — per-section client-side pagination
 * Version: 1.0 (2026-01-01)
 * Shows N cards per page (default 24) for each .book-grid in the Digital Library page.
 * No DOM structure changes required; injects a pager below each grid.
 */
(function () {
  'use strict';

  const PAGE_SIZE_DEFAULT = 24;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function makePager(grid, items, pageSize) {
    // Create pager container
    const pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Pagination');
    const ul = document.createElement('ul');
    ul.className = 'pager-list';
    pager.appendChild(ul);

    // Insert after the grid
    grid.insertAdjacentElement('afterend', pager);

    function renderButtons(totalPages, currentPage) {
      ul.textContent = '';

      // Prev
      if (currentPage > 1) {
        const liPrev = document.createElement('li');
        liPrev.className = 'pager-item';
        const aPrev = document.createElement('button');
        aPrev.type = 'button';
        aPrev.textContent = '← Prev';
        aPrev.addEventListener('click', () => showPage(currentPage - 1));
        liPrev.appendChild(aPrev);
        ul.appendChild(liPrev);
      }

      // Numbers
      for (let p = 1; p <= totalPages; p++) {
        const li = document.createElement('li');
        li.className = 'pager-item' + (p === currentPage ? ' is-active' : '');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(p);
        btn.addEventListener('click', () => showPage(p));
        li.appendChild(btn);
        ul.appendChild(li);
      }

      // Next
      if (currentPage < totalPages) {
        const liNext = document.createElement('li');
        liNext.className = 'pager-item';
        const aNext = document.createElement('button');
        aNext.type = 'button';
        aNext.textContent = 'Next →';
        aNext.addEventListener('click', () => showPage(currentPage + 1));
        liNext.appendChild(aNext);
        ul.appendChild(liNext);
      }
    }

    function showPage(page) {
      // Hide/show items for the selected page
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      items.forEach((el, i) => {
        el.style.display = (i >= start && i < end) ? '' : 'none';
      });

      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      renderButtons(totalPages, page);

      // Keep focus on pager for a11y
      pager.scrollIntoView({ block: 'nearest' });
    }

    // Initialize
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    showPage(1);

    return { showPage };
  }

  ready(function () {
    // Target each section grid on the digital library page
    const grids = Array.from(document.querySelectorAll('.book-grid'));

    grids.forEach(grid => {
      const items = Array.from(grid.querySelectorAll('.book'));
      if (items.length <= PAGE_SIZE_DEFAULT) return; // no pager needed if small

      const pageSizeAttr = Number(grid.getAttribute('data-page-size')) || PAGE_SIZE_DEFAULT;
      makePager(grid, items, pageSizeAttr);
    });
  });
})();
