// ====== CONFIG: Your published STATS CSV ======
const STATS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSytqI3VbnAP19WXuGy0_Y01KaOkydpCfnRtGzGhCfhx5CVStZb3uDMQE8D5qZlBF__BgqbxUlLQNb/pub?gid=602931858&single=true&output=csv";

// ====== Elements ======
const form = document.getElementById("foodForm");
const issueSection = document.getElementById("issueSection");
const confirmation = document.getElementById("confirmation");

const restaurantSearch = document.getElementById("restaurantSearch");
const restaurantSelect = document.getElementById("restaurant");

const progressBar = document.getElementById("progressBar");

// Live Impact elements
const impactEls = {
  all_time_total: document.getElementById("impactAllTime"),
  today_total: document.getElementById("impactToday"),
  last7_total: document.getElementById("impactLast7"),
  last7_not_right: document.getElementById("impactNotRight7"),
  last7_right: document.getElementById("impactRight7"),
};

const impactUpdated = document.getElementById("impactUpdated");
const impactError = document.getElementById("impactError");

// ====== Helpers ======
function setHidden(el, hidden) {
  if (!el) return;
  el.classList.toggle("hidden", hidden);
}

function setProgress() {
  // 0%: nothing selected
  // 50%: restaurant selected
  // 75%: yes/no selected
  // 100%: if "No" then issue selected OR if "Yes" complete
  const restaurantChosen = !!restaurantSelect.value;
  const correct = form.querySelector('input[name="entry.1083003025"]:checked')?.value;

  let pct = 0;
  if (restaurantChosen) pct = 50;
  if (restaurantChosen && correct) pct = 75;

  if (restaurantChosen && correct === "Yes") pct = 100;

  if (restaurantChosen && correct === "No") {
    const issueChosen = !!document.getElementById("issue")?.value;
    pct = issueChosen ? 100 : 85;
  }

  if (progressBar) progressBar.style.width = `${pct}%`;
}

// Very small CSV parser (handles commas + quotes)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (cur.length || row.length) row.push(cur);
      if (row.length) rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter(r => r.some(cell => (cell ?? "").trim() !== ""));
}

function fmtNumber(val) {
  const n = Number(val);
  if (Number.isFinite(n)) return n.toLocaleString();
  return val ?? "—";
}

// ====== Live Impact fetch ======
async function fetchImpact() {
  try {
    setHidden(impactError, true);

    // cache-bust so it refreshes
    const url = `${STATS_CSV_URL}&_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

    const csvText = await res.text();
    const rows = parseCSV(csvText);

    // Expect: header row: metric,value
    // Then rows like: all_time_total,5
    const header = rows[0].map(h => (h || "").trim().toLowerCase());
    const metricIdx = header.indexOf("metric");
    const valueIdx = header.indexOf("value");

    if (metricIdx === -1 || valueIdx === -1) {
      throw new Error(`CSV header must include "metric" and "value".`);
    }

    const map = {};
    for (let i = 1; i < rows.length; i++) {
      const metric = (rows[i][metricIdx] || "").trim();
      const value = (rows[i][valueIdx] || "").trim();
      if (metric) map[metric] = value;
    }

    // Update UI
    Object.keys(impactEls).forEach((k) => {
      if (impactEls[k]) impactEls[k].textContent = fmtNumber(map[k] ?? "—");
    });

    const now = new Date();
    impactUpdated.textContent = `Updated ${now.toLocaleTimeString()}`;

  } catch (err) {
    impactUpdated.textContent = "Stats offline";
    setHidden(impactError, false);
    impactError.textContent =
      `Live stats couldn’t load. If this keeps happening, open your published CSV link in a new tab and make sure it loads. Error: ${err.message}`;
  }
}

// ====== Restaurant search box (filters dropdown) ======
restaurantSearch?.addEventListener("input", () => {
  const q = restaurantSearch.value.trim().toLowerCase();
  const opts = Array.from(restaurantSelect.options);

  // Keep first option always visible
  opts.forEach((opt, idx) => {
    if (idx === 0) return;
    const text = opt.textContent.toLowerCase();
    opt.hidden = q && !text.includes(q);
  });
});

// ====== Show/hide issue section ======
form.addEventListener("change", function (e) {
  if (e.target.name === "entry.1083003025") {
    if (e.target.value === "No") {
      issueSection.classList.remove("hidden");
    } else {
      issueSection.classList.add("hidden");
      // clear issue fields if they switch back to Yes
      document.getElementById("issue").value = "";
      document.getElementById("details").value = "";
    }
  }

  setProgress();
});

// ====== Submit behavior (keep Google submit) ======
form.addEventListener("submit", function () {
  confirmation.classList.remove("hidden");

  // Reset UI after submit
  setTimeout(() => {
    form.reset();
    issueSection.classList.add("hidden");
    setProgress();
  }, 120);

  setTimeout(() => {
    confirmation.classList.add("hidden");
  }, 4000);

  // give sheets a moment, then refresh stats
  setTimeout(fetchImpact, 1500);
});

// ====== Boot ======
setProgress();
fetchImpact();
setInterval(fetchImpact, 60000);
