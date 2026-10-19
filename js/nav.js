// Global navbar. Every page includes an empty <header id="app-nav"> and this script,
// so the navbar markup lives in one place.
(function () {
  const NAV_HTML = `
    <nav class="navbar">
      <button class="nav-button" type="button" aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="17" x2="20" y2="17"/>
        </svg>
      </button>
      <button class="nav-button" type="button" aria-label="Profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="10" r="3.5"/>
          <path d="M5.5 19c1.4-2.6 3.8-4 6.5-4s5.1 1.4 6.5 4" stroke-linecap="round"/>
        </svg>
      </button>
    </nav>
  `;

  const host = document.getElementById("app-nav");
  if (!host) {
    throw new Error("nav.js: page is missing <header id=\"app-nav\">");
  }
  host.innerHTML = NAV_HTML;
})();
