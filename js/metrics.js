// Renders the 7-day metric cards under the score dial from HEALTH_METRICS (metrics-data.js).
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Chart drawing area in viewBox units; the SVG scales to the card width.
  const CHART_WIDTH = 140;
  const PLOT_HEIGHT = 48;
  const PLOT_TOP = 6;
  const DAY_LABEL_GAP = 12;
  const CHART_HEIGHT = PLOT_TOP + PLOT_HEIGHT + DAY_LABEL_GAP;
  const BASELINE_Y = PLOT_TOP + PLOT_HEIGHT;

  const BAR_WIDTH = 12;
  const BAR_RADIUS = 4;
  const DOT_RADIUS = 4;
  // Line charts don't start at zero, so leave headroom above/below the data range.
  const LINE_PADDING_RATIO = 0.25;

  const MINUTES_PER_HOUR = 60;

  const grid = document.getElementById("metrics-grid");
  if (!grid) {
    throw new Error("metrics.js: page is missing <div id=\"metrics-grid\">");
  }
  if (typeof HEALTH_METRICS === "undefined") {
    throw new Error("metrics.js: HEALTH_METRICS not loaded — include metrics-data.js first");
  }

  // Each formatter returns the number and unit separately so the headline can style them apart.
  const FORMATTERS = {
    duration(hours) {
      const totalMinutes = Math.round(hours * MINUTES_PER_HOUR);
      const h = Math.floor(totalMinutes / MINUTES_PER_HOUR);
      const m = totalMinutes % MINUTES_PER_HOUR;
      return { number: `${h}h ${m}m`, unit: "" };
    },
    count(value) {
      return { number: Math.round(value).toLocaleString("en-US"), unit: "" };
    },
    bpm(value) {
      return { number: String(Math.round(value)), unit: "bpm" };
    },
    ms(value) {
      return { number: String(Math.round(value)), unit: "ms" };
    },
    minutes(value) {
      return { number: String(Math.round(value)), unit: "min" };
    },
  };

  function formatValue(metric, value) {
    const formatter = FORMATTERS[metric.format];
    if (!formatter) {
      throw new Error(`metrics.js: unknown format "${metric.format}" for ${metric.label}`);
    }
    return formatter(value);
  }

  function formatInline(metric, value) {
    const { number, unit } = formatValue(metric, value);
    return unit ? `${number} ${unit}` : number;
  }

  function el(tag, attrs, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      node.setAttribute(key, value);
    }
    parent.appendChild(node);
    return node;
  }

  function average(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  // Dates for the last N days, oldest first, ending today.
  function lastDays(count) {
    const today = new Date();
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (count - 1 - i));
      return date;
    });
  }

  function dayInitial(date) {
    return date.toLocaleDateString("en-US", { weekday: "narrow" });
  }

  function dayName(date, isToday) {
    return isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
  }

  function bandCenter(index, count) {
    const band = CHART_WIDTH / count;
    return band * index + band / 2;
  }

  // Column with a rounded data-end and a square base on the baseline.
  function barPath(x, y, width, height) {
    const r = Math.min(BAR_RADIUS, height, width / 2);
    return [
      `M ${x} ${BASELINE_Y}`,
      `V ${y + r}`,
      `Q ${x} ${y} ${x + r} ${y}`,
      `H ${x + width - r}`,
      `Q ${x + width} ${y} ${x + width} ${y + r}`,
      `V ${BASELINE_Y}`,
      "Z",
    ].join(" ");
  }

  function drawBars(svg, values) {
    const max = Math.max(...values);
    const lastIndex = values.length - 1;
    return values.map((value, i) => {
      const height = max === 0 ? 0 : (value / max) * PLOT_HEIGHT;
      if (height === 0) return null;
      const x = bandCenter(i, values.length) - BAR_WIDTH / 2;
      return el("path", {
        class: i === lastIndex ? "metric-bar metric-bar--today" : "metric-bar",
        d: barPath(x, BASELINE_Y - height, BAR_WIDTH, height),
      }, svg);
    });
  }

  function drawLine(svg, values) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min || 1) * LINE_PADDING_RATIO;
    const low = min - padding;
    const high = max + padding;
    const points = values.map((value, i) => ({
      x: bandCenter(i, values.length),
      y: PLOT_TOP + (1 - (value - low) / (high - low)) * PLOT_HEIGHT,
    }));
    const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const first = points[0];
    const last = points[points.length - 1];

    el("polygon", {
      class: "metric-area",
      points: `${first.x},${BASELINE_Y} ${linePoints} ${last.x},${BASELINE_Y}`,
    }, svg);
    el("polyline", { class: "metric-line", points: linePoints }, svg);
    el("circle", { class: "metric-dot", cx: last.x, cy: last.y, r: DOT_RADIUS }, svg);

    // Hidden until a day is hovered/tapped.
    const hoverDot = el("circle", { class: "metric-dot metric-dot--hover", r: DOT_RADIUS }, svg);
    return { points, hoverDot };
  }

  function drawDayLabels(svg, dates) {
    const lastIndex = dates.length - 1;
    dates.forEach((date, i) => {
      el("text", {
        class: i === lastIndex ? "metric-day metric-day--today" : "metric-day",
        x: bandCenter(i, dates.length),
        y: CHART_HEIGHT - 1,
      }, svg).textContent = dayInitial(date);
    });
  }

  function deltaInfo(metric, avg) {
    const percent = Math.round(((avg - metric.prevAvg) / metric.prevAvg) * 100);
    if (percent === 0) {
      return { text: "0%", className: "metric-delta" };
    }
    const wentUp = percent > 0;
    const isGood = wentUp === metric.higherIsBetter;
    return {
      text: `${wentUp ? "▲" : "▼"} ${Math.abs(percent)}%`,
      className: `metric-delta ${isGood ? "metric-delta--good" : "metric-delta--bad"}`,
    };
  }

  function buildCardShell(metric) {
    const avg = average(metric.days);
    const headline = formatValue(metric, avg);
    const delta = deltaInfo(metric, avg);

    const card = document.createElement("article");
    card.className = "metric-card";
    card.innerHTML = `
      <div class="metric-head">
        <h3 class="metric-label"></h3>
        <span class="metric-source"></span>
      </div>
      <p class="metric-value"><span class="metric-number"></span><span class="metric-unit"></span></p>
      <p class="metric-sub"><span></span> <span class="metric-sub-text">vs last week</span></p>
      <div class="metric-tooltip" hidden></div>
    `;
    card.querySelector(".metric-label").textContent = metric.label;
    card.querySelector(".metric-source").textContent = metric.source;
    card.querySelector(".metric-number").textContent = headline.number;
    card.querySelector(".metric-unit").textContent = headline.unit;
    const deltaEl = card.querySelector(".metric-sub > span");
    deltaEl.className = delta.className;
    deltaEl.textContent = delta.text;
    return card;
  }

  // Tap (touch) or hover (mouse) a day column to see its value.
  function attachTooltip(card, svg, metric, dates, marks) {
    const tooltip = card.querySelector(".metric-tooltip");
    const count = metric.days.length;
    const band = CHART_WIDTH / count;

    function show(index) {
      const isToday = index === count - 1;
      tooltip.textContent = `${dayName(dates[index], isToday)} · ${formatInline(metric, metric.days[index])}`;
      tooltip.hidden = false;

      marks.bars?.forEach((bar, i) => bar?.classList.toggle("is-active", i === index));
      if (marks.line) {
        const p = marks.line.points[index];
        marks.line.hoverDot.setAttribute("cx", p.x);
        marks.line.hoverDot.setAttribute("cy", p.y);
        marks.line.hoverDot.classList.add("is-visible");
      }

      // Centre the tooltip over the column, clamped inside the card.
      const svgBox = svg.getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      const columnX = svgBox.left - cardBox.left + (bandCenter(index, count) / CHART_WIDTH) * svgBox.width;
      const half = tooltip.offsetWidth / 2;
      const left = Math.min(Math.max(columnX, half), cardBox.width - half);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${svgBox.top - cardBox.top - tooltip.offsetHeight - 4}px`;
    }

    function hide() {
      tooltip.hidden = true;
      marks.bars?.forEach((bar) => bar?.classList.remove("is-active"));
      marks.line?.hoverDot.classList.remove("is-visible");
    }

    for (let i = 0; i < count; i++) {
      const hit = el("rect", {
        class: "metric-hit",
        x: band * i,
        y: 0,
        width: band,
        height: CHART_HEIGHT,
      }, svg);
      hit.addEventListener("pointerenter", () => show(i));
      hit.addEventListener("pointerdown", () => show(i));
    }

    svg.addEventListener("pointerleave", (event) => {
      // On touch, keep the tooltip after the finger lifts; it closes on the next tap elsewhere.
      if (event.pointerType === "mouse") hide();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!svg.contains(event.target)) hide();
    });
  }

  function renderCard(metric) {
    const card = buildCardShell(metric);
    const dates = lastDays(metric.days.length);

    const svg = el("svg", {
      class: "metric-chart",
      viewBox: `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`,
      role: "img",
      "aria-label": `${metric.label}, last 7 days: ` + metric.days
        .map((v, i) => `${dayName(dates[i], i === dates.length - 1)} ${formatInline(metric, v)}`)
        .join(", "),
    }, card);

    const marks = {};
    if (metric.chart === "bar") {
      el("line", { class: "metric-baseline", x1: 0, x2: CHART_WIDTH, y1: BASELINE_Y, y2: BASELINE_Y }, svg);
      marks.bars = drawBars(svg, metric.days);
    } else if (metric.chart === "line") {
      marks.line = drawLine(svg, metric.days);
    } else {
      throw new Error(`metrics.js: unknown chart type "${metric.chart}" for ${metric.label}`);
    }
    drawDayLabels(svg, dates);
    attachTooltip(card, svg, metric, dates, marks);
    return card;
  }

  for (const metric of HEALTH_METRICS) {
    grid.appendChild(renderCard(metric));
  }
})();
