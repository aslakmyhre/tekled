// Speedometer-style score dial (0–1000), drawn as SVG.
// Prototype only: the score is random on every load.
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const MAX_SCORE = 1000;
  const MAJOR_STEP = 100;
  const MINOR_STEP = 50;

  // Angles are in degrees, 0 = straight up, clockwise positive.
  const SWEEP_DEG = 240;
  const START_DEG = -SWEEP_DEG / 2;

  const CENTER_X = 150;
  const CENTER_Y = 140;
  const ARC_RADIUS = 115;
  const ARC_WIDTH = 14;
  const TICK_OUTER_RADIUS = 99;
  const MINOR_TICK_LENGTH = 6;
  const MAJOR_TICK_LENGTH = 11;
  const LABEL_RADIUS = 72;
  const NEEDLE_LENGTH = 92;
  const NEEDLE_BASE_WIDTH = 8;
  const HUB_RADIUS = 10;
  const HUB_INNER_RADIUS = 4;

  // Must match --dial-transition in styles.css so number, needle and band land together.
  const ANIMATION_MS = 1600;

  const svg = document.getElementById("score-dial");
  if (!svg) {
    throw new Error("dial.js: page is missing <svg id=\"score-dial\">");
  }

  function scoreToDeg(score) {
    return START_DEG + (score / MAX_SCORE) * SWEEP_DEG;
  }

  function polar(radius, deg) {
    const rad = (deg * Math.PI) / 180;
    return {
      x: CENTER_X + radius * Math.sin(rad),
      y: CENTER_Y - radius * Math.cos(rad),
    };
  }

  function el(tag, attrs, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      node.setAttribute(key, value);
    }
    parent.appendChild(node);
    return node;
  }

  function arcPath(radius, fromDeg, toDeg) {
    const start = polar(radius, fromDeg);
    const end = polar(radius, toDeg);
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  function drawGradient() {
    const defs = el("defs", {}, svg);
    const gradient = el("linearGradient", { id: "dial-gradient", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    const styles = getComputedStyle(document.documentElement);
    const stops = [
      ["0%", styles.getPropertyValue("--score-low")],
      ["50%", styles.getPropertyValue("--score-mid")],
      ["100%", styles.getPropertyValue("--score-high")],
    ];
    for (const [offset, color] of stops) {
      el("stop", { offset, "stop-color": color.trim() }, gradient);
    }
  }

  // The coloured band is dashed with pathLength = MAX_SCORE, so a dash offset of
  // (MAX_SCORE - score) fills it exactly up to the score.
  function drawArc() {
    const endDeg = START_DEG + SWEEP_DEG;
    el("path", { class: "dial-track", d: arcPath(ARC_RADIUS, START_DEG, endDeg), "stroke-width": ARC_WIDTH + 6 }, svg);
    const band = el("path", {
      class: "dial-band",
      d: arcPath(ARC_RADIUS, START_DEG, endDeg),
      "stroke-width": ARC_WIDTH,
      pathLength: MAX_SCORE,
      "stroke-dasharray": `${MAX_SCORE} ${MAX_SCORE}`,
    }, svg);
    band.style.strokeDashoffset = bandOffset(0);
    return band;
  }

  // The round line cap sticks out half the band width past the dash end, which would
  // make the colour run ahead of the needle. Pull the end back by that much, easing
  // the correction to zero at MAX_SCORE so a full score still fills the whole arc.
  function bandOffset(score) {
    const arcLength = ARC_RADIUS * (SWEEP_DEG * Math.PI) / 180;
    const capInScoreUnits = (ARC_WIDTH / 2 / arcLength) * MAX_SCORE;
    return (MAX_SCORE - score) * (1 + capInScoreUnits / MAX_SCORE);
  }

  function drawTicks() {
    for (let value = 0; value <= MAX_SCORE; value += MINOR_STEP) {
      const isMajor = value % MAJOR_STEP === 0;
      const deg = scoreToDeg(value);
      const outer = polar(TICK_OUTER_RADIUS, deg);
      const inner = polar(TICK_OUTER_RADIUS - (isMajor ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH), deg);
      el("line", {
        class: isMajor ? "dial-tick dial-tick--major" : "dial-tick",
        x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y,
        "stroke-width": isMajor ? 2.5 : 1.5,
      }, svg);

      if (isMajor) {
        const pos = polar(LABEL_RADIUS, deg);
        el("text", { class: "dial-label", x: pos.x, y: pos.y }, svg).textContent = value;
      }
    }
  }

  function drawValueText() {
    const value = el("text", { class: "dial-value", x: CENTER_X, y: CENTER_Y + 72 }, svg);
    value.textContent = "0";
    el("text", { class: "dial-max", x: CENTER_X, y: CENTER_Y + 92 }, svg).textContent = `of ${MAX_SCORE}`;
    return value;
  }

  // Needle is drawn pointing straight up, then rotated around the dial centre.
  function drawNeedle() {
    const half = NEEDLE_BASE_WIDTH / 2;
    const needle = el("polygon", {
      class: "dial-needle",
      points: `${CENTER_X - half},${CENTER_Y} ${CENTER_X},${CENTER_Y - NEEDLE_LENGTH} ${CENTER_X + half},${CENTER_Y}`,
    }, svg);
    needle.style.transformOrigin = `${CENTER_X}px ${CENTER_Y}px`;
    needle.style.transform = `rotate(${START_DEG}deg)`;
    el("circle", { class: "dial-hub", cx: CENTER_X, cy: CENTER_Y, r: HUB_RADIUS }, svg);
    el("circle", { class: "dial-hub-inner", cx: CENTER_X, cy: CENTER_Y, r: HUB_INNER_RADIUS }, svg);
    return needle;
  }

  // Same curve as the CSS cubic-bezier(0.33, 1, 0.68, 1) (easeOutCubic).
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateTo(score, needle, band, valueText) {
    // Wait one frame so the starting state is painted before the transitions kick in.
    requestAnimationFrame(() => {
      needle.style.transform = `rotate(${scoreToDeg(score)}deg)`;
      band.style.strokeDashoffset = bandOffset(score);
      const startTime = performance.now();
      function tick(now) {
        const t = Math.min((now - startTime) / ANIMATION_MS, 1);
        valueText.textContent = Math.round(score * easeOutCubic(t));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  drawGradient();
  const band = drawArc();
  drawTicks();
  const valueText = drawValueText();
  const needle = drawNeedle();

  const score = Math.floor(Math.random() * (MAX_SCORE + 1));
  svg.setAttribute("aria-label", `Score ${score} of ${MAX_SCORE}`);
  animateTo(score, needle, band, valueText);
})();
