// "Leaderboard" bottom sheet, opened from the button on the score card.
// Ranks LEADERBOARD_PEOPLE (leaderboard-data.js) together with the user's dial score.
(function () {
  const openButton = document.getElementById("leaderboard-open");
  const closeButton = document.getElementById("leaderboard-close");
  const sheet = document.getElementById("leaderboard");
  const list = document.getElementById("leaderboard-list");
  const dial = document.getElementById("score-dial");
  if (!openButton || !closeButton || !sheet || !list || !dial) {
    throw new Error("leaderboard.js: page is missing leaderboard markup or <svg id=\"score-dial\">");
  }
  if (typeof LEADERBOARD_PEOPLE === "undefined") {
    throw new Error("leaderboard.js: LEADERBOARD_PEOPLE not loaded — include leaderboard-data.js first");
  }

  // Set by dial.js, which runs first (deferred scripts run in order).
  const userScore = Number(dial.dataset.score);
  if (!Number.isFinite(userScore)) {
    throw new Error("leaderboard.js: dial has no data-score — include dial.js first");
  }

  function initials(name) {
    return name.split(" ").map((part) => part[0]).join("");
  }

  function renderRow(entry, rank) {
    const row = document.createElement("li");
    row.className = entry.isUser ? "leaderboard-row is-user" : "leaderboard-row";
    row.innerHTML = `
      <span class="leaderboard-rank"></span>
      <span class="leaderboard-avatar" aria-hidden="true"></span>
      <span class="leaderboard-name"></span>
      <span class="leaderboard-score"></span>
    `;
    const rankEl = row.querySelector(".leaderboard-rank");
    rankEl.textContent = rank;
    rankEl.dataset.rank = rank;
    row.querySelector(".leaderboard-avatar").textContent = initials(entry.name);
    row.querySelector(".leaderboard-name").textContent = entry.name;
    row.querySelector(".leaderboard-score").textContent = entry.score;
    return row;
  }

  const ranked = [...LEADERBOARD_PEOPLE, { name: "You", score: userScore, isUser: true }]
    .sort((a, b) => b.score - a.score);
  ranked.forEach((entry, index) => list.appendChild(renderRow(entry, index + 1)));

  openButton.addEventListener("click", () => {
    sheet.showModal();
    list.querySelector(".is-user").scrollIntoView({ block: "nearest" });
  });
  closeButton.addEventListener("click", () => sheet.close());
  // .sheet-body fills the dialog, so a click that targets the dialog itself landed on the backdrop.
  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) sheet.close();
  });
})();
