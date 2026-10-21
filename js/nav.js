// Global navbar and hamburger menu. Every page includes an empty <header id="app-nav"> and this script,
// so the navbar and menu markup live in one place.
(function () {
  const ICON_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  // Prototype only: entries without an href are shown but go nowhere.
  const MENU_ITEMS = [
    { label: "Home", href: "index.html", icon: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>' },
    { label: "Your wins", href: "wins.html", badge: "New", icon: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"/>' },
    { label: "Leaderboard", icon: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>' },
    { label: "Goals", icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>' },
    { label: "Friends", icon: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.4 3.4-5.5 6.5-5.5s5.7 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.8 3.1 2.6 3.5 5.2"/>' },
    { label: "Insights", icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
    { label: "Settings", icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>' },
  ];

  const NAV_HTML = `
    <nav class="navbar">
      <button id="menu-open" class="nav-button" type="button" aria-label="Menu" aria-haspopup="dialog">
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
    <dialog id="menu" class="drawer" aria-label="Menu">
      <div class="drawer-body">
        <div class="drawer-profile">
          <span class="drawer-avatar" aria-hidden="true">Y</span>
          <div>
            <p class="drawer-greeting">Hi there!</p>
            <p class="drawer-sub">Member since August</p>
          </div>
        </div>
        <ul class="drawer-list"></ul>
        <p class="drawer-footer">Score · version 0.1</p>
      </div>
    </dialog>
  `;

  const host = document.getElementById("app-nav");
  if (!host) {
    throw new Error("nav.js: page is missing <header id=\"app-nav\">");
  }
  host.innerHTML = NAV_HTML;

  const menu = host.querySelector("#menu");
  const list = host.querySelector(".drawer-list");
  // "/" and "/repo/" (e.g. GitHub Pages) serve index.html.
  const currentPage = location.pathname.split("/").pop() || "index.html";

  function renderItem(item) {
    const li = document.createElement("li");
    const link = document.createElement(item.href ? "a" : "button");
    link.className = "drawer-item";
    if (item.href) {
      link.href = item.href;
      if (item.href === currentPage) {
        link.classList.add("is-current");
        link.setAttribute("aria-current", "page");
      }
    } else {
      link.type = "button";
    }
    link.innerHTML = `<svg ${ICON_ATTRS}>${item.icon}</svg><span class="drawer-label"></span>`;
    link.querySelector(".drawer-label").textContent = item.label;
    if (item.badge) {
      const badge = document.createElement("span");
      badge.className = "drawer-badge";
      badge.textContent = item.badge;
      link.appendChild(badge);
    }
    li.appendChild(link);
    return li;
  }

  for (const item of MENU_ITEMS) {
    list.appendChild(renderItem(item));
  }

  host.querySelector("#menu-open").addEventListener("click", () => menu.showModal());
  // .drawer-body fills the dialog, so a click that targets the dialog itself landed on the backdrop.
  menu.addEventListener("click", (event) => {
    if (event.target === menu) menu.close();
  });
})();
