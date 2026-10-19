// Renders the swipeable "Boost your score" tip cards from SCORE_TIPS (tips-data.js).
(function () {
  // Inner SVG markup for 24×24 stroke icons.
  const TIP_ICONS = {
    walk: '<ellipse cx="8" cy="8.5" rx="3.2" ry="5.5"/><ellipse cx="16" cy="15.5" rx="3.2" ry="5.5"/>',
    sleep: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    exercise: '<path d="M7 7v10M17 7v10M4 10v4M20 10v4M7 12h10"/>',
    screen: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M4 4l16 16"/>',
    daylight: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    mindful: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>',
  };

  const row = document.getElementById("tips-row");
  if (!row) {
    throw new Error("tips.js: page is missing <div id=\"tips-row\">");
  }
  if (typeof SCORE_TIPS === "undefined") {
    throw new Error("tips.js: SCORE_TIPS not loaded — include tips-data.js first");
  }

  function renderTip(tip) {
    const icon = TIP_ICONS[tip.icon];
    if (!icon) {
      throw new Error(`tips.js: unknown icon "${tip.icon}" for "${tip.action}"`);
    }

    const card = document.createElement("article");
    card.className = "tip-card";
    card.innerHTML = `
      <div class="tip-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>
      </div>
      <p class="tip-action"></p>
      <p class="tip-gain"></p>
    `;
    card.querySelector(".tip-action").textContent = tip.action;
    card.querySelector(".tip-gain").textContent = `+${tip.gain} to your score`;
    return card;
  }

  for (const tip of SCORE_TIPS) {
    row.appendChild(renderTip(tip));
  }
})();
