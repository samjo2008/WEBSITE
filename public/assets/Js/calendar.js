
/* ==========================================================
   ETHIOPIAN CALENDAR — 2018 EC (Meskerem 1 → 2025-09-11)
   Author: Samuel (Mgr-iT MultiProp)
   File: /assets/js/calendar.js
   Version: 1.2 (2026-01-01)
   Notes:
   - Non-breaking improvements: a11y roles/caption, keyboard activation,
     passive listeners, duplicated arrays consolidated, pad2 fallback
   ========================================================== */
'use strict';

/* ---------- CONFIG ---------- */

/** Amharic weekdays (Ethiopian) — single source of truth */
const weekdays = ["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","አርብ","ቅዳሜ"];

/** Ethiopian months */
const ethiopianMonths = [
  "መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት",
  "መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"
];

/** English month names (short + long) and weekdays — consolidated */
const EN_MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EN_MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EN_WEEKDAYS     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/** 2018 EC (non-leap) — Pagumen has 5 days */
const monthDays = [30,30,30,30,30,30,30,30,30,30,30,30,5];

/** Meskerem 1, 2018 EC = 2025-09-11 (UTC) */
const baseGregorian = Date.UTC(2025, 8, 11); // month 8 = September
const msPerDay = 86400000;

/* ---------- FEASTS ---------- */
const majorFeasts = {
  "መስከረም 1":"እንቁጣጣሽ",
  "መስከረም 17":"መስቀል",
  "ኅዳር 15":"ጾመ ነቢያት መጀመሪያ",
  "ታኅሣሥ 29":"ገና",
  "ጥር 11":"ጥምቀት",
  "ጥር 25":"ጾመ ነነዌ መጀመሪያ",
  "ጥር 27":"ጾመ ነነዌ መጨረሻ",
  "የካቲት 9":"ዓቢይ ጾም መጀመሪያ",
  "ሚያዝያ 2":"ስቅለት",
  "ሚያዝያ 4":"ዓቢይ ጾም መጨረሻ",
  "ግንቦት 24":"ጾመ ሐዋርያት መጀመሪያ",
  "ሐምሌ 4":"ጾመ ሐዋርያት መጨረሻ",
  "ነሐሴ 1":"ፍልሰታ መጀመሪያ",
  "ነሐሴ 15":"ፍልሰታ መጨረሻ"
};

const monthlyFeasts = {
  5:"አቡነ ገብረ መንፈስ ቅዱስ",
  7:"ቅድስት ስላሴ",
  8:"አባ ኪሮስና",
  12:"ቅዱስ ሚካኤል",
  13:"እግዚአብሔር አብ እና ሩፋኤል",
  14:"አቡነ አረጋዊ",
  16:"ኪዳነ ምሕረት",
  17:"ቅዱስ እስጢፋኖስ",
  19:"ቅዱስ ገብርኤል",
  21:"ቅድስት ማርያም",
  22:"ቅዱስ ኡራኤል",
  23:"ቅዱስ ጊዮርጊስ",
  24:"አቡነ ተክለ ሃይማኖት",
  25:"ቅዱስ መርቆሪዮስ",
  27:"መድኃኔ ዓለም",
  28:"አማኑኤል",
  29:"በአለ ወልድ",
  30:"ቅዱስ ዮሐንስ"
};

// NOTE: Use "ኅዳር" (with ኅ) to match ethiopianMonths[2]
const yearlyFeasts = {
  "መስከረም 21":"ግሸን ማርያም",
  "ጥቅምት 5":"አቡነ ገብረመንፈስ ቅዱስ",
  "ጥቅምት 14":"አቡነ አረጋዊ",
  "ጥቅምት 27":"መድኃኔ ዓለም",
  "ኅዳር 6":"ቁስቛም ማርያም",
  "ኅዳር 12":"ቅዱስ ሚካኤል",
  "ኅዳር 13":"እግዚአብሔር አብ",
  "ኅዳር 21":"ቅድስት ማርያም",
  "ታኅሣሥ 3":"በአታ ማርያም",
  "ታኅሣሥ 19":"ቅዱስ ገብርኤል",
  "ጥር 7":"ቅድስት ስላሴ",
  "ጥር 12":"ቅዱስ ሚካኤል",
  "ጥር 13":"ቅዱስ ሩፋኤል",
  "ጥር 21":"ቅድስት ማርያም",
  "ጥር 22":"ቅዱስ ኡራኤል",
  "ግንቦት 1":"ልደታ",
  "ግንቦት 14":"አቡነ አረጋዊ",
  "ሰኔ 12":"ቅዱስ ሚካኤል",
  "ሰኔ 30":"ቅዱስ ዮሐንስ",
  "ሐምሌ 7":"ቅድስት ስላሴ",
  "ሐምሌ 19":"ቅዱስ ገብርኤል",
  "ሐምሌ 22":"ቅዱስ ኡራኤል",
  "ሐምሌ 23":"ቅዱስ ጊዮርጊስ",
  "ነሐሴ 16":"ፍልሰታ በዓል"
};

/* Daily saints — SAMPLE ONLY. Extend as needed. */
const dailyFeasts = {
  "መስከረም 1": ["ልደተ ማርያም"],
  "መስከረም 2": ["ቅዱስ ታድዮስ"],
  "መስከረም 3": ["ቅዱስ ዮሐንስ መጥምቁ"],
};

/* ---------- HELPERS ---------- */

/** pad2: fallback in case String.padStart is unavailable (older browsers) */
function pad2(n) {
  n = Number(n) || 0;
  return (n < 10 ? '0' : '') + n;
}

/** Convert a Gregorian date to Ethiopian (2018 EC only) */
function gregorianToEthiopian(gDate) {
  const utc = Date.UTC(gDate.getFullYear(), gDate.getMonth(), gDate.getDate());
  const diffDays = Math.floor((utc - baseGregorian) / msPerDay);
  if (diffDays < 0 || diffDays >= 365) return null; // Outside 2018 EC

  let remaining = diffDays;
  let monthIndex = 0;
  while (remaining >= monthDays[monthIndex]) {
    remaining -= monthDays[monthIndex];
    monthIndex++;
  }
  return {
    year: 2018,
    monthIndex,
    monthName: ethiopianMonths[monthIndex],
    day: remaining + 1
  };
}

/** Meskerem 1, 2018 EC is Thursday (weekday index 4) */
const MESKEREM1_WEEKDAY = 4;

/** Weekday index (0..6) for the first day of monthIndex */
function getMonthStartWeekday(monthIndex) {
  let offset = 0;
  for (let i = 0; i < monthIndex; i++) offset += monthDays[i];
  return (MESKEREM1_WEEKDAY + (offset % 7)) % 7;
}

/** Gregorian Date object for given Ethiopian month/day (2018 EC) */
function getGregorianForEtDate(monthIndex, day) {
  let offset = 0;
  for (let i = 0; i < monthIndex; i++) offset += monthDays[i];
  offset += (day - 1);
  return new Date(baseGregorian + offset * msPerDay);
}

/** e.g., "Sep 11" */
function formatGregorianShort(d) {
  return EN_MONTHS_SHORT[d.getMonth()] + " " + pad2(d.getDate());
}

/* ---------- SELECTION STATE ---------- */
let selectedMonthIndex = null;
let selectedDay = null;
let selectedCell = null;

function clearSelectedCell() {
  if (selectedCell) {
    selectedCell.classList.remove('ecal-selected');
    selectedCell = null;
  }
}

/* ---------- MONTH SELECTOR ---------- */
function populateMonthSelector() {
  const sel = document.getElementById("month-selector");
  if (!sel) return;

  sel.innerHTML = "";
  ethiopianMonths.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m + " 2018";
    sel.appendChild(opt);
  });

  const etToday = gregorianToEthiopian(new Date());
  sel.value = etToday ? String(etToday.monthIndex) : "0";

  sel.addEventListener("change", () => {
    const idx = Number(sel.value);

    // Reset selection on month change
    selectedMonthIndex = idx;
    selectedDay = null;
    clearSelectedCell();

    // Rebuild month grid
    buildEthiopianMonthCalendar("ethiopian-calendar", idx);

    // Show safe default summary (today if same month, else day 1)
    const defaultDay = (etToday && etToday.monthIndex === idx) ? etToday.day : 1;
    const daysInMonth = monthDays[idx];
    const safeDay = Math.min(defaultDay, daysInMonth);

    buildDailySummary(idx, safeDay);
  }, { passive: true });
}

/* ---------- BUILD CALENDAR ---------- */
function buildEthiopianMonthCalendar(containerId, forcedMonthIndex = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const etToday = gregorianToEthiopian(new Date());

  const monthIndex = forcedMonthIndex !== null
    ? forcedMonthIndex
    : (etToday ? etToday.monthIndex : 0);

  selectedMonthIndex = monthIndex; // keep global in sync

  const monthName = ethiopianMonths[monthIndex];
  const startWeekday = getMonthStartWeekday(monthIndex);
  const daysInMonth = monthDays[monthIndex];

  // If previously selected day is invalid in this month, clear it
  if (selectedDay && selectedDay > daysInMonth) {
    selectedDay = null;
    clearSelectedCell();
  }

  const wrapper = document.createElement("div");
  wrapper.className = "ecal";

  const header = document.createElement("div");
  header.className = "ecal-header";
  header.textContent = monthName + " 2018";
  wrapper.appendChild(header);

  const table = document.createElement("table");
  table.className = "ecal-table";
  table.setAttribute('aria-label', `${monthName} 2018 Ethiopian calendar`);
  const caption = document.createElement('caption');
  caption.className = 'visually-hidden';
  caption.textContent = `${monthName} 2018 Ethiopian calendar`;
  table.appendChild(caption);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  weekdays.forEach(wd => {
    const th = document.createElement("th");
    th.textContent = wd;
    th.setAttribute('scope', 'col');
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const frag = document.createDocumentFragment();
  let day = 1;

  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");

    for (let wd = 0; wd < 7; wd++) {
      const td = document.createElement("td");

      // Empty leading/trailing cells
      if ((week === 0 && wd < startWeekday) || day > daysInMonth) {
        td.classList.add("ecal-empty");
        tr.appendChild(td);
        continue;
      }

      // Weekend styling
      if (wd === 0) td.classList.add("ecal-sunday");
      if (wd === 0 || wd === 6) td.classList.add("ecal-weekend");

      const key = monthName + " " + day;
      const feastMajor   = majorFeasts[key];
      const feastYearly  = yearlyFeasts[key];
      const feastMonthly = monthlyFeasts[day];
      const label = feastYearly || feastMajor || feastMonthly;

      // Feast class
      if (feastMajor) td.classList.add("ecal-major-feast");
      else if (feastYearly) td.classList.add("ecal-yearly-feast");
      else if (feastMonthly) td.classList.add("ecal-monthly-feast");

      // Today highlight
      if (etToday && etToday.monthIndex === monthIndex && etToday.day === day) {
        td.classList.add("ecal-today");
      }

      // Ethiopian day number (big)
      const etSpan = document.createElement("div");
      etSpan.className = "ecal-day-et";
      etSpan.textContent = day;
      td.appendChild(etSpan);

      // Gregorian (top-right)
      const gDate = getGregorianForEtDate(monthIndex, day);
      const grSpan = document.createElement("div");
      grSpan.className = "ecal-day-gr";
      grSpan.textContent = formatGregorianShort(gDate);
      td.appendChild(grSpan);

      // Feast label (small text)
      if (label) {
        const fDiv = document.createElement("div");
        fDiv.className = "ecal-feast";
        fDiv.textContent = label;
        td.appendChild(fDiv);
      }

      // Store month/day on the cell to avoid stale closures
      td.dataset.monthIndex = String(monthIndex);
      td.dataset.day = String(day);

      // Make the cell keyboard-activatable (a11y)
      td.setAttribute('tabindex', '0');
      td.setAttribute('role', 'button');

      // Click → update summary + selected highlight using dataset
      td.addEventListener("click", () => {
        const m = Number(td.dataset.monthIndex);
        const d = Number(td.dataset.day);

        selectedMonthIndex = m;
        selectedDay = d;
        clearSelectedCell();
        td.classList.add('ecal-selected');
        selectedCell = td;

        buildDailySummary(m, d);
      }, { passive: true });

      // Keyboard activation
      td.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          td.click();
        }
      });

      // Restore selection highlight if this cell matches the selected state
      if (selectedMonthIndex === monthIndex && selectedDay === day) {
        td.classList.add('ecal-selected');
        selectedCell = td;
      }

      tr.appendChild(td);
      day++;
    }

    frag.appendChild(tr);
  }

  tbody.appendChild(frag);
  table.appendChild(tbody);
  wrapper.appendChild(table);

  // Mount
  container.innerHTML = "";
  container.appendChild(wrapper);
}

/* ---------- DAILY SUMMARY (ALL FEAST TYPES) ---------- */
function buildDailySummary(monthIndex, day) {
  const container = document.getElementById("feast-summary");
  if (!container) return;

  const monthName = ethiopianMonths[monthIndex];
  const key = monthName + " " + day;

  const feastMajor   = majorFeasts[key];
  const feastYearly  = yearlyFeasts[key];
  const feastMonthly = monthlyFeasts[day];
  const saints       = dailyFeasts[key] || [];

  // English date
  const gDate = getGregorianForEtDate(monthIndex, day);
  const engFull =
    EN_WEEKDAYS[gDate.getDay()] + ", " +
    EN_MONTHS_LONG[gDate.getMonth()] + " " +
    gDate.getDate() + ", " +
    gDate.getFullYear();

  // Amharic date (uses Ethiopian month + 2018)
  // Use existing Amharic weekdays; they’re already defined as `weekdays`
  const amFull =
    weekdays[gDate.getDay()] + ", " +
    monthName + " " + day + ", 2018";

  // Build DOM (avoid innerHTML concatenation)
  const outer = document.createElement('div');
  outer.className = 'summary-outer';

  const frame = document.createElement('div');
  frame.className = 'summary-frame';
  const frameDate = document.createElement('div');
  frameDate.className = 'summary-frame-date';
  frameDate.append(
    document.createTextNode(engFull),
    document.createElement('br'),
    document.createTextNode(amFull)
  );
  frame.appendChild(frameDate);

  const box = document.createElement('div');
  box.className = 'summary-box';
  // Make summary politely live (assistive tech)
  box.setAttribute('role', 'region');
  box.setAttribute('aria-live', 'polite');

  const ul = document.createElement('ul');
  ul.className = 'summary-list';

  const addItem = (label, value) => {
    const li = document.createElement('li');
    if (label) {
      const strong = document.createElement('strong');
      strong.textContent = label;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(' — '));
    }
    li.appendChild(document.createTextNode(value));
    ul.appendChild(li);
  };

  if (feastMajor)   addItem('ታላቅ በዓል', feastMajor);
  if (feastYearly)  addItem('ዓመታዊ በዓል', feastYearly);
  if (feastMonthly) addItem('ወርሃዊ በዓል', feastMonthly);
  saints.forEach(name => addItem('የቀኑ ቅዱሳን', name));
  if (!feastMajor && !feastYearly && !feastMonthly && saints.length === 0) {
    addItem('', '—');
  }

  box.appendChild(ul);
  outer.appendChild(frame);
  outer.appendChild(box);

  container.innerHTML = '';
  container.appendChild(outer);
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure the expected containers exist
  const hasSelector = !!document.getElementById("month-selector");
  const hasCalendar = !!document.getElementById("ethiopian-calendar");
  const hasSummary  = !!document.getElementById("feast-summary");
  if (!hasSelector || !hasCalendar || !hasSummary) {
    console.error("Missing required elements: #month-selector, #ethiopian-calendar, #feast-summary");
    return;
  }

  populateMonthSelector();

  const today = gregorianToEthiopian(new Date());
  const idx = today ? today.monthIndex : 0;
  const d   = today ? today.day : 1;

  // Initialize selection to today
  selectedMonthIndex = idx;
  selectedDay = d;

  buildEthiopianMonthCalendar("ethiopian-calendar", idx);
  buildDailySummary(idx, d);
}, { once: true });
