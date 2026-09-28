import { TIMELINE_EVENTS } from "../data/events.js";

// ---------------------------------------------------------------
// RENDER
// ---------------------------------------------------------------
const track = document.getElementById("track");
document.getElementById("eventCount").textContent = TIMELINE_EVENTS.length;

function shortDate(d) {
  const parts = d.split("-");
  const dt = new Date(Date.UTC(+parts[0], +parts[1]-1, +parts[2]));
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

const trackItems = document.createDocumentFragment();
TIMELINE_EVENTS.forEach((ev, i) => {
  const btn = document.createElement("button");
  btn.className = "stop" + (ev.era ? " era" : "") + (ev.type === "community" ? " community" : "") + (ev.type === "incident" ? " incident" : "") + (ev.type === "exploit" ? " exploit" : "");
  btn.style.setProperty("--i", i);
  btn.setAttribute("aria-haspopup", "dialog");
  btn.innerHTML = `
    <span class="stop-marker"></span>
    <span class="stop-date">${shortDate(ev.date)}</span>
    <span class="stop-label">${ev.label}</span>
    <span class="stop-tag">${ev.type === "community" ? "Community Milestone" : (ev.type === "incident" ? "Incident" : (ev.type === "exploit" ? "Exploit" : (ev.era ? "Major Update" : "Update")))}</span>
  `;
  btn.addEventListener("click", (e) => {
    if (suppressNextClick) {
      e.preventDefault();
      return;
    }
    openModal(ev, btn);
  });
  trackItems.appendChild(btn);
});
track.appendChild(trackItems);

const scrollBox = document.getElementById("trackScroll");
const overlay = document.getElementById("overlay");
let modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const taskStage = document.getElementById("taskStage");
const prevPreview = document.getElementById("prevPreview");
const nextPreview = document.getElementById("nextPreview");
const prevEvent = document.getElementById("prevEvent");
const nextEvent = document.getElementById("nextEvent");
const taskPosition = document.getElementById("taskPosition");

function formatDate(d) {
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const dt = new Date(Date.UTC(+parts[0], +parts[1]-1, +parts[2]));
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function cleanPatchText(text) {
  return text
    .replace(/\[\s*(?:\d+|Acquisitionmethod\d*)\s*\]/gi, "")
    .replace(/\\([!~])/g, "$1")
    .replace(/^\s*[>−-]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeSectionTitle(text) {
  const t = cleanPatchText(text);
  if (!t) return false;
  if (/^\d+\.?\s*[.)-]?\s*\S+/.test(t) && t.length < 90) return true;
  if (t.length > 78) return false;
  if (/[.!?]$/.test(t)) return false;
  return /^(add|added|new|bee|beesmas|balance|bug|code|field|hat|hidden|honey|map|package|quest|return|sticker|fix|supreme|wealth|egg|day|night|achievement|sprinkler|gifted|ant|mama|panda|summer|travel|micro|ready|robo|dapper|drives|planter|other|retro|coconut|petal|npc|snowflake|gingerbread|beequip|gummy|balloon|blue deck|fuzzy|leaderboard|blender|petals)/i.test(t);
}

function normalizeHeading(text) {
  return cleanPatchText(text)
    .replace(/^\d+\.?\s*[.)-]?\s*/, "")
    .replace(/^[*•]+\s*/, "")
    .replace(/\s*:+\s*$/, "")
    .trim();
}


function revisePatchText(text) {
  let t = cleanPatchText(text);
  const replacements = [
    [/\bpunishment simulator\b/gi, "Bee Swarm Simulator"],
    [/\bBlue Haikyuu\b/gi, "Blue HQ"],
    [/\bRed Haikyuu\b/gi, "Red HQ"],
    [/\bBuckko Bee\b/gi, "Bucko Bee"],
    [/\bBerco Bee\b/gi, "Bucko Bee"],
    [/\bBerko\b/gi, "Bucko Bee"],
    [/\bStickberg\b/gi, "Stick Bug"],
    [/\bHall of Wind\b/gi, "Wind Shrine"],
    [/\bMemorial Match\b/gi, "Memory Match"],
    [/\bCocount Canister\b/gi, "Coconut Canister"],
    [/\bCoconut Clog\b/gi, "Coconut Clogs"],
    [/\bGumi Baller\b/gi, "Gummyballer"],
    [/\bGumi Rain\b/gi, "Gummy Bee"],
    [/\bchewy snacks \(Gumdrops\)/gi, "Gumdrops"],
    [/\bflower garden\b/gi, "field"],
    [/\bflower bed\b/gi, "field"],
    [/\bstamina\b/gi, "health"],
    [/\bwon\b/gi, "Honey"],
    [/\bnew punishment\b/gi, "new bee"],
    [/\bpunishments\b/gi, "bees"],
    [/\bpunishment\b/gi, "bee"],
    [/\bBulsimul\b/gi, "Bee Swarm Simulator"],
    [/\bBarambee\b/gi, "Windy Bee"],
    [/\bShinhwa Egg\b/gi, "Mythic Egg"],
    [/\bBismas\b/gi, "Beesmas"],
    [/\bBismuth\b/gi, "Beesmas"],
    [/\bhoneycomb skins\b/gi, "hive skins"],
    [/\btransaction server\b/gi, "Hive Hub"],
    [/\bcollection luck\b/gi, "Loot Luck"],
  ];
  replacements.forEach(([pattern, value]) => { t = t.replace(pattern, value); });
  t = t
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s{2,}/g, " ")
    .trim();
  return t;
}

function concisePatchTitle(text) {
  const original = revisePatchText(text);
  const lower = original.toLowerCase();
  const named = [
    ["gumdrops", "Gumdrops"], ["gummy bee", "Gummy Bee"], ["gummy bear", "Gummy Bear"],
    ["token link", "Token Link"], ["sun bear", "Sun Bear"], ["tabby bee", "Tabby Bee"],
    ["crimson bee", "Crimson & Cobalt Bee"], ["cobalt bee", "Crimson & Cobalt Bee"],
    ["ant challenge", "Ant Challenge"], ["gifted bee", "Gifted Bees"], ["star amulet", "Star Amulets"],
    ["porcelain port-o-hive", "Porcelain Port-O-Hive"], ["puppy bee", "Puppy & Vicious Bee"],
    ["vicious bee", "Puppy & Vicious Bee"], ["sprinkler", "Sprinklers"], ["moon amulet", "Moon Amulet"],
    ["wealth clock", "Wealth Clock"], ["stubborn bee", "New Bees"], ["carpenter bee", "New Bees"],
    ["stick bug", "Stick Bug Challenge"], ["bee bear", "Bee Bear"], ["festive bee", "Festive Bee"],
    ["night bell", "Festive Bean & Night Bell"], ["honey bee npc", "Honey Bee"],
    ["micro-converter", "New Items"], ["field dice", "New Items"], ["golden rake", "New Tools"],
    ["spark staff", "New Tools"], ["egg hunt", "Egg Hunt"], ["jellybean", "Jelly Beans"],
    ["marshmallow bee", "Marshmallow Bee"], ["coconut", "Coconut & Pepper Expansion"],
    ["spirit bear", "Spirit Bear"], ["windy bee", "Windy Bee"], ["wind shrine", "Wind Shrine"],
    ["memory match", "Memory Match"], ["mythic", "Mythic Bees & Eggs"], ["cub buddy", "Cub Buddy"],
    ["fuzzy bee", "Fuzzy Bee"], ["supreme star amulet", "Supreme Star Amulet"],
    ["ready player two", "Ready Player Two"], ["beequip", "Beequips"], ["planter", "Planters"],
    ["nectar", "Nectar"], ["puffshroom", "Puffshrooms"], ["gummyballer", "Gummyballer"],
    ["tide popper", "Tide Popper"], ["robo bear", "Robo Bear"], ["robo challenge", "Robo Challenge"],
    ["digital bee", "Digital Bee"], ["sticker", "Stickers"], ["retro swarm", "Retro Swarm Challenge"],
    ["coconut belt", "Coconut Belt"], ["petals", "Petals"]
  ];
  for (const [needle, label] of named) if (lower.includes(needle)) return label;
  if (/\bcode\b/.test(lower)) return "Codes";
  if (/\bachievement/.test(lower)) return "Achievements";
  if (/\baccessor/.test(lower)) return "Accessories";
  if (/\bticket/.test(lower) && /currency/.test(lower)) return "Tickets";
  if (/\bfield boost/.test(lower)) return "Field Boosters";
  if (/\bscience bear|polar bear/.test(lower)) return "Bear Quests";
  if (/\bpackage/.test(lower)) return "Limited Packages";
  if (/\bleaderboard/.test(lower)) return "Leaderboards";
  if (/\bbalance/.test(lower)) return "Balance Changes";
  if (/\bbug|error/.test(lower)) return "Bug Fixes";
  if (/\bmap/.test(lower)) return "Map Changes";
  if (/\bnew item/.test(lower)) return "New Items";
  if (/\bnew tool/.test(lower)) return "New Tools";
  if (/\bnew bee/.test(lower)) return "New Bees";
  if (/\bnew area/.test(lower)) return "New Area";
  if (/\bquest/.test(lower)) return "Quests";
  if (original.length <= 58 && !/[.!?]$/.test(original)) return original;
  const beforeColon = original.split(":")[0].trim();
  if (beforeColon.length >= 4 && beforeColon.length <= 58) return beforeColon;
  const sentence = original.split(/[.!?]/)[0].trim();
  if (sentence.length <= 58) return sentence;
  return sentence.slice(0, 55).replace(/\s+\S*$/, "").trim() + "…";
}

function groupTextBlob(group) {
  return [group.title, ...group.details, ...group.bullets].join(" ").toLowerCase();
}

function classifyPatchGroup(group) {
  const text = groupTextBlob(group);
  const title = (group.title || "").toLowerCase();

  if (/^no patch details listed$/i.test(group.title)) return "summary";
  if (/\b(beesmas|egg hunt|classic event|retro swarm|retro|event|events|quest|quests|npc|npcs|bear|translator|mission|missions|present|presents|challenge|challenges|travel bear|bee bear|gummy bear|sun bear|spirit bear|science bear|polar bear|panda bear|mama bear|black bear|brown bear|bucko|riley)\b/.test(text)) return "quest";
  if (/\b(balance|balanced|rebalance|buff|buffed|nerf|nerfed|changed|change|cooldown|reduced|reduction|increased|increase|decreased|adjusted|adjustment|fix|fixed|bug|bugs|error|errors|reset|server|settings|quality of life|qol|visible|translucent|removed|disable|disabled|patch)\b/.test(text)) return "balance";
  if (/\b(add|added|new|released|release|return|returns|introduced|created|create|shop|store|area|bee|bees|item|items|tool|tools|equipment|mechanic|mechanics|facility|facilities|amulet|backpack|mask|belt|wand|clog|canister|sprinkler|sticker|hive skin|planter|slot|code|package|packages|clock|blender|field booster|booster|leaderboard|badge|badges)\b/.test(text) || /^(add|new)\b/.test(title)) return "new";
  return "other";
}

function renderPatchEntry(group) {
  const genericTitle = /^(patch notes|other changes|summary)$/i.test(group.title || "");
  const hasTitle = !genericTitle && group.title;
  const compact = !group.details.length && !group.bullets.length;
  let html = `<article class="patch-entry${compact ? " compact" : ""}">`;
  if (hasTitle) html += `<h4 class="patch-entry-title">${escapeHtml(group.title)}</h4>`;
  if (group.details.length) {
    html += `<div class="patch-entry-body">${group.details.map(x => `<p>${escapeHtml(x)}</p>`).join("")}</div>`;
  }
  if (group.bullets.length) {
    html += `<ul class="patch-entry-bullets">${group.bullets.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }
  if (!hasTitle && !group.details.length && !group.bullets.length) {
    html += `<div class="patch-entry-body"><p>${escapeHtml(group.title || "Patch note")}</p></div>`;
  }
  html += `</article>`;
  return html;
}

function buildPatchNotes(ev) {
  if (ev.type === "community" || ev.type === "incident" || ev.type === "exploit") {
    const doc = new DOMParser().parseFromString(`<div id="specialRoot">${ev.sourceHtml}</div>`, "text/html");
    const root = doc.getElementById("specialRoot");
    const bullets = [...root.querySelectorAll("li")].map(li => cleanPatchText(li.textContent)).filter(Boolean);
    const details = [...root.querySelectorAll("p")].map(p => cleanPatchText(p.textContent)).filter(Boolean);
    const isIncident = ev.type === "incident";
    const isExploit = ev.type === "exploit";
    const heading = isExploit ? "Exploit" : (isIncident ? "Incident" : "Community milestone");
    const classes = isExploit ? "category-exploit" : (isIncident ? "category-incident" : "community-note category-community");
    let html = `<div class="patch-stack"><section class="patch-section ${classes}" style="--section-i:0"><h3 class="patch-heading">${heading}</h3>`;
    if (bullets.length) html += `<ul class="patch-bullets">${bullets.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
    if (details.length) html += `<div class="patch-details">${details.map(x => `<p>${escapeHtml(x)}</p>`).join("")}</div>`;
    html += `</section></div>`;
    return html;
  }

  const doc = new DOMParser().parseFromString(`<div id="patchRoot">${ev.sourceHtml}</div>`, "text/html");
  const root = doc.getElementById("patchRoot");
  const groups = [];
  let current = null;
  let intro = "";
  let detachedBullets = false;

  const startGroup = (title) => {
    const clean = normalizeHeading(title) || "Patch notes";
    current = { title: clean, details: [], bullets: [] };
    groups.push(current);
  };

  const ensureGroup = () => {
    if (!current) startGroup("Patch notes");
    return current;
  };

  const addDetail = (text) => {
    const t = cleanPatchText(text);
    if (!t) return;
    ensureGroup().details.push(t);
  };

  const addBullet = (text) => {
    const t = cleanPatchText(text);
    if (!t) return;
    ensureGroup().bullets.push(t);
  };

  [...root.children].forEach((node, idx) => {
    if (node.tagName === "UL") {
      const items = [...node.querySelectorAll(":scope > li")]
        .map(li => cleanPatchText(li.textContent))
        .filter(Boolean);

      // Some source pages use an empty list as a visual section break.
      // Reset the active heading so following dash-lines are categorized on their own.
      if (!items.length) {
        current = null;
        detachedBullets = true;
        return;
      }

      if (items.length === 1) {
        const one = items[0];
        if (current && !current.details.length && !current.bullets.length && (one.length > 95 || /[.!?]$/.test(one))) {
          current.details.push(one);
        } else {
          startGroup(one);
        }
        detachedBullets = false;
      } else {
        const g = ensureGroup();
        items.forEach(item => g.bullets.push(item));
        detachedBullets = false;
      }
      return;
    }

    if (node.tagName === "P") {
      const raw = node.textContent || "";
      const rawTrim = raw.trim();
      const t = cleanPatchText(raw);
      if (!t) return;

      // A leading • is commonly used by the source as a new subsection heading.
      if (rawTrim.startsWith("•")) {
        startGroup(raw);
        detachedBullets = false;
        return;
      }

      // Dash/arrow-prefixed lines are patch-note content. Previously short lines
      // such as "Snail health increased..." were mistaken for headings, which
      // split cards and left labels like "New Items" stranded as loose bullets.
      if (/^(?:−|-|>)\s*/.test(rawTrim)) {
        if (detachedBullets || !current) {
          startGroup(raw);
          detachedBullets = true;
        } else {
          addBullet(raw);
        }
        return;
      }

      if (!current && !looksLikeSectionTitle(raw) && t.length < 240) {
        intro = t;
        return;
      }

      if (looksLikeSectionTitle(raw)) {
        startGroup(raw);
        detachedBullets = false;
      } else {
        addDetail(raw);
      }
    }
  });

  const cleaned = [];
  groups.forEach(g => {
    const rawTitle = revisePatchText(normalizeHeading(g.title));
    g.details = [...new Set(g.details.map(revisePatchText).filter(Boolean))];
    g.bullets = [...new Set(g.bullets.map(revisePatchText).filter(Boolean))];
    const shortTitle = concisePatchTitle(rawTitle);
    if (rawTitle && rawTitle !== shortTitle && (rawTitle.length > 64 || /[.!?]$/.test(rawTitle))) {
      if (!g.details.includes(rawTitle)) g.details.unshift(rawTitle);
    }
    g.title = shortTitle;
    if (!g.title && !g.details.length && !g.bullets.length) return;
    const prev = cleaned[cleaned.length - 1];
    if (prev && prev.title.toLowerCase() === g.title.toLowerCase()) {
      prev.details.push(...g.details);
      prev.bullets.push(...g.bullets);
    } else {
      cleaned.push(g);
    }
  });

  if (!cleaned.length && !intro) {
    cleaned.push({ title: "No patch details listed", details: ["The supplied source includes this date but does not list any update details underneath it."], bullets: [] });
  }

  const categories = [
    { key: "summary", title: "Overview", className: "category-summary", simple: [], entries: [] },
    { key: "new", title: "New content", className: "category-new", simple: [], entries: [] },
    { key: "quest", title: "Quests & events", className: "category-quest", simple: [], entries: [] },
    { key: "balance", title: "Balance & fixes", className: "category-balance", simple: [], entries: [] },
    { key: "other", title: "Other changes", className: "category-other", simple: [], entries: [] }
  ];
  const categoryMap = Object.fromEntries(categories.map(c => [c.key, c]));

  // Introductory source text belongs inside the same rounded card system as the rest
  // of the patch, rather than floating above the cards.
  if (intro) {
    categoryMap.summary.entries.push({ title: "Summary", details: [intro], bullets: [] });
  }

  cleaned.forEach(group => {
    const key = classifyPatchGroup(group);
    const bucket = categoryMap[key] || categoryMap.other;
    const titleOnly = group.title && !group.details.length && !group.bullets.length;
    if (titleOnly) bucket.simple.push(group.title);
    else bucket.entries.push(group);
  });

  let html = `<div class="patch-stack" id="patchStack">`;

  let sectionIndex = 0;
  categories.forEach(cat => {
    const simple = [...new Set(cat.simple.map(cleanPatchText).filter(Boolean))];
    if (!simple.length && !cat.entries.length) return;
    html += `<section class="patch-section ${cat.className}" style="--section-i:${Math.min(sectionIndex, 8)}">`;
    html += `<h3 class="patch-heading">${escapeHtml(cat.title)}</h3>`;
    if (simple.length) {
      html += `<ul class="patch-simple-list">${simple.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
    }
    if (cat.entries.length) {
      html += `<div class="patch-entry-list">${cat.entries.map(renderPatchEntry).join("")}</div>`;
    }
    html += `</section>`;
    sectionIndex += 1;
  });

  html += `</div>`;
  return html;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setModalOrigin(originEl) {
  const rect = originEl?.getBoundingClientRect();
  if (!rect) {
    modal.style.setProperty("--modal-x", "0px");
    modal.style.setProperty("--modal-y", "28px");
    return;
  }
  const x = rect.left + rect.width / 2 - window.innerWidth / 2;
  const y = rect.top + rect.height / 2 - window.innerHeight / 2;
  modal.style.setProperty("--modal-x", `${x}px`);
  modal.style.setProperty("--modal-y", `${y}px`);
}

const DEFAULT_GAME_ART = "assets/images/BeeSwarmActualFirstIcon.webp";

// Original artwork stored alongside this site in the GitHub repository.
// Dates without a dedicated historical thumbnail intentionally fall back to
// the first Bee Swarm Simulator game icon instead of generated artwork.
const UPDATE_ARTWORK = {
  "2018-05-07": "assets/images/BeeSwarmActualFirstIcon.webp",
  "2018-06-02": "assets/images/CrimsonCobaltIcon.webp",
  "2023-05-07": "assets/images/BSSRoboBearUpdate2xThumb.webp",
  "2018-04-10": "assets/images/BeeSwarmActualFirstIcon.webp",
  "2018-04-27": "assets/images/BeeSwarmActualFirstIcon.webp",
  "2018-05-12": "assets/images/TabbyUpdateIcon.webp",
  "2018-05-26": "assets/images/BSSGummyInvasionUpdate.webp",
  "2018-07-11": "assets/images/BSSMotherBearUpdate.webp",
  "2018-09-10": "assets/images/NighttimeUpdateIcon.webp",
  "2018-12-19": "assets/images/BSSIconJan19.webp",
  "2018-12-25": "assets/images/BSSIconJan19.webp",
  "2019-04-17": "assets/images/BSSEggHunt2019Update.webp",
  "2019-09-27": "assets/images/Windycover.webp",
  "2019-12-22": "assets/images/Bssbeesmas2019cover.webp",
  "2020-04-07": "assets/images/Beeswarmegghuntlogo.webp",
  "2022-12-26": "assets/images/BSSRoboBearUpdateThumb.webp",
  "2022-12-30": "assets/images/BSSRoboBearUpdate2xThumb.webp",
  "2024-01-13": "assets/images/BSSStickerUpdateIcon.webp",
  "2024-01-17": "assets/images/BSSStickerUpdate2xIcon.webp",
  "2024-05-24": "assets/images/BSSClassicIcon.webp",
  "2025-12-26": "assets/images/BSSBeesmas20252xEvent.webp"
};

function getEventArtwork(ev) {
  if (ev.type === "community") return DEFAULT_GAME_ART;
  return UPDATE_ARTWORK[ev.date] || DEFAULT_GAME_ART;
}

const patchHtmlCache = new WeakMap();
let lastModalTrigger = null;
let activeEventIndex = 0;
let closeTimer = 0;

function renderTaskPreview(button, index, direction) {
  const ev = TIMELINE_EVENTS[index];
  button.disabled = !ev;
  if (!ev) return;
  button.setAttribute("aria-label", `${direction}: ${ev.title}, ${formatDate(ev.date)}`);
  button.querySelector(".task-peek-art").src = getEventArtwork(ev);
  button.querySelector(".task-peek-date").textContent = formatDate(ev.date);
  button.querySelector(".task-peek-title").textContent = ev.title;
}

function updateTaskNavigation() {
  renderTaskPreview(prevPreview, activeEventIndex - 1, "Previous update");
  renderTaskPreview(nextPreview, activeEventIndex + 1, "Next update");
  prevEvent.disabled = activeEventIndex === 0;
  nextEvent.disabled = activeEventIndex === TIMELINE_EVENTS.length - 1;
  taskPosition.textContent = `${activeEventIndex + 1} of ${TIMELINE_EVENTS.length}`;
}

let queuedEventIndex = null;
let switchAnimations = [];
let switchIncoming = null;
let switchPreview = null;
let switchPhase = "idle";
let switchSequence = 0;

function cancelUpdateSwitch() {
  switchSequence++;
  switchAnimations.forEach(animation => animation.cancel());
  switchAnimations = [];
  switchIncoming?.remove();
  switchIncoming = null;
  if (switchPreview) switchPreview.style.visibility = "";
  switchPreview = null;
  switchPhase = "idle";
  queuedEventIndex = null;
}

function browseUpdate(direction) {
  const baseIndex = queuedEventIndex ?? activeEventIndex;
  const nextIndex = baseIndex + direction;
  if (nextIndex < 0 || nextIndex >= TIMELINE_EVENTS.length) return;
  queuedEventIndex = nextIndex;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !modal.animate) {
    const selected = queuedEventIndex;
    cancelUpdateSwitch();
    openModal(TIMELINE_EVENTS[selected]);
    return;
  }

  // Queue rapid presses as individual chapters, preserving the visible path.
  if (switchPhase === "idle") advanceQueuedUpdate();
}

function advanceQueuedUpdate() {
  if (queuedEventIndex === null || queuedEventIndex === activeEventIndex) {
    queuedEventIndex = null;
    return;
  }
  const direction = Math.sign(queuedEventIndex - activeEventIndex);
  const selected = activeEventIndex + direction;
  const preview = direction > 0 ? nextPreview : prevPreview;
  const cardWidth = modal.offsetWidth;
  const peekRect = preview.getBoundingClientRect();
  const cardRect = modal.getBoundingClientRect();
  const visiblePeek = Math.max(32, Math.min(120, direction > 0
    ? peekRect.right - cardRect.right : cardRect.left - peekRect.left));
  const travel = cardWidth - visiblePeek;

  // Build the entire next chapter before motion starts. Both cards remain
  // separate DOM surfaces until the new one reaches the center.
  const incoming = modal.cloneNode(false);
  incoming.removeAttribute("id");
  incoming.removeAttribute("role");
  incoming.removeAttribute("aria-modal");
  incoming.removeAttribute("aria-labelledby");
  incoming.removeAttribute("style");
  incoming.classList.add("task-incoming");
  incoming.setAttribute("aria-hidden", "true");
  incoming.appendChild(modal.querySelector(".modal-head").cloneNode(true));
  incoming.appendChild(document.createElement("div"));
  incoming.lastElementChild.className = "modal-body";
  incoming.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
  populateModalCard(incoming, TIMELINE_EVENTS[selected]);
  incoming.style.setProperty("--incoming-left", `${modal.offsetLeft}px`);
  incoming.style.setProperty("--incoming-top", `${modal.offsetTop}px`);
  incoming.style.setProperty("--incoming-width", `${cardWidth}px`);
  incoming.style.setProperty("--incoming-height", `${modal.offsetHeight}px`);
  taskStage.appendChild(incoming);
  preview.style.visibility = "hidden";
  switchIncoming = incoming;
  switchPreview = preview;
  switchPhase = "moving";
  const sequence = ++switchSequence;

  const incomingAnimation = incoming.animate([
    { opacity: .76, transform: `translate3d(${direction * travel}px,0,0) scale(.94)` },
    { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
  ], { duration: 520, easing: "cubic-bezier(.22,.82,.18,1)", fill: "forwards" });
  const outgoing = modal.animate([
    { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
    { opacity: .88, transform: `translate3d(${-direction * Math.min(cardWidth * .12, 105)}px,0,0) scale(.98)`, offset: .4 },
    { opacity: 0, transform: `translate3d(${-direction * Math.min(cardWidth * .32, 280)}px,0,0) scale(.92)` }
  ], { duration: 430, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
  switchAnimations = [incomingAnimation, outgoing];

  Promise.all([incomingAnimation.finished, outgoing.finished]).then(() => {
    if (sequence !== switchSequence) return;
    const oldModal = modal;
    oldModal.remove();
    outgoing.cancel();
    incomingAnimation.cancel();
    incoming.classList.remove("task-incoming");
    incoming.removeAttribute("aria-hidden");
    incoming.style.removeProperty("--incoming-left");
    incoming.style.removeProperty("--incoming-top");
    incoming.style.removeProperty("--incoming-width");
    incoming.style.removeProperty("--incoming-height");
    incoming.id = "modal";
    incoming.setAttribute("role", "dialog");
    incoming.setAttribute("aria-modal", "true");
    incoming.setAttribute("aria-labelledby", "modalTitle");
    [[".modal-date", "modalDate"], [".modal-badge", "modalBadge"],
      [".modal-title", "modalTitle"], [".modal-art", "modalArt"],
      [".modal-body", "modalBody"]].forEach(([selector, id]) => {
      incoming.querySelector(selector).id = id;
    });
    taskStage.insertBefore(incoming, nextPreview);
    modal = incoming;
    activeEventIndex = selected;
    updateTaskNavigation();
    preview.style.visibility = "";
    switchIncoming = null;
    switchPreview = null;
    switchAnimations = [];
    switchPhase = "idle";
    advanceQueuedUpdate();
  }).catch(() => {});
}

function populateModalCard(card, ev) {
  const date = card.querySelector(".modal-date");
  const badge = card.querySelector(".modal-badge");
  const title = card.querySelector(".modal-title");
  const art = card.querySelector(".modal-art");
  const body = card.querySelector(".modal-body");
  date.textContent = formatDate(ev.date);
  badge.textContent = ev.type === "community" ? "Community Milestone" : (ev.type === "incident" ? "Incident" : (ev.type === "exploit" ? "Exploit" : (ev.era ? "Major Update" : "Update")));
  badge.className = "modal-badge" + (ev.type === "community" ? " community" : (ev.type === "incident" ? " incident" : (ev.type === "exploit" ? " exploit" : (ev.era ? "" : " update"))));
  title.textContent = ev.title;
  art.onerror = () => {
    art.onerror = null;
    art.src = DEFAULT_GAME_ART;
  };
  art.src = getEventArtwork(ev);
  art.alt = `${ev.title} update artwork`;

  let html = patchHtmlCache.get(ev);
  if (html === undefined) {
    html = buildPatchNotes(ev);
    patchHtmlCache.set(ev, html);
  }
  const sourceLabel = ev.type === "community" ? "Community milestone source" : ((ev.type === "incident" || ev.type === "exploit") ? "Incident source" : `Primary source — ${formatDate(ev.date)}`);
  const sourceLinks = [{ href: ev.sourceHref, label: sourceLabel }, ...(ev.extraSources || [])];
  html += `<p class="source-note">${sourceLinks.length > 1 ? "Sources" : "Source"}: ${sourceLinks.map(src => `<a href="${src.href}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.label)}</a>`).join(" · ")}</p>`;

  body.innerHTML = html;

  const toggle = body.querySelector("#patchToggle");
  if (toggle) {
    toggle.dataset.label = toggle.textContent;
    toggle.addEventListener("click", () => {
      const stack = body.querySelector("#patchStack");
      const expanded = stack.classList.toggle("expanded");
      toggle.textContent = expanded ? "Show less" : toggle.dataset.label;
    });
  }
}

function openModal(ev, originEl) {
  const isAlreadyOpen = overlay.classList.contains("open");
  clearTimeout(closeTimer);
  if (!isAlreadyOpen) lastModalTrigger = originEl || document.activeElement;
  overlay.classList.remove("closing");
  if (!isAlreadyOpen) setModalOrigin(originEl);
  activeEventIndex = TIMELINE_EVENTS.indexOf(ev);
  updateTaskNavigation();
  populateModalCard(modal, ev);
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  modal.scrollTop = 0;
  if (!isAlreadyOpen) closeBtn.focus({ preventScroll: true });
}

function closeModal() {
  if (!overlay.classList.contains("open")) return;
  cancelUpdateSwitch();
  overlay.classList.remove("open");
  overlay.classList.add("closing");
  closeTimer = setTimeout(() => {
    overlay.classList.remove("closing");
    document.body.style.overflow = "";
    if (lastModalTrigger && typeof lastModalTrigger.focus === "function") {
      lastModalTrigger.focus({ preventScroll: true });
    }
    lastModalTrigger = null;
  }, 240);
}

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
prevPreview.addEventListener("click", () => browseUpdate(-1));
nextPreview.addEventListener("click", () => browseUpdate(1));
prevEvent.addEventListener("click", () => browseUpdate(-1));
nextEvent.addEventListener("click", () => browseUpdate(1));

let taskGesture = null;
let suppressTaskClick = false;
let taskSettleTimer = 0;
let taskDragFrame = 0;
let taskDragX = 0;

function flushTaskDrag() {
  taskDragFrame = 0;
  taskStage.style.transform = `translate3d(${taskDragX}px, 0, 0)`;
}

function cancelTaskDragFrame() {
  if (taskDragFrame) cancelAnimationFrame(taskDragFrame);
  taskDragFrame = 0;
}

function settleTaskStage() {
  cancelTaskDragFrame();
  taskStage.classList.add("is-settling");
  taskStage.style.transform = "translate3d(0, 0, 0)";
  clearTimeout(taskSettleTimer);
  taskSettleTimer = setTimeout(() => taskStage.classList.remove("is-settling"), 400);
}

taskStage.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || !overlay.classList.contains("open")) return;
  if (e.target.closest?.("a, input, select, textarea, [contenteditable]")) return;

  const matrix = getComputedStyle(taskStage).transform;
  const currentX = matrix === "none" ? 0 : (new DOMMatrixReadOnly(matrix).m41 || 0);
  cancelTaskDragFrame();
  clearTimeout(taskSettleTimer);
  taskStage.classList.remove("is-settling");
  taskStage.style.transform = `translate3d(${currentX}px, 0, 0)`;
  taskGesture = { id: e.pointerId, x: e.clientX, y: e.clientY, offset: currentX, dragging: false };
});

taskStage.addEventListener("pointermove", (e) => {
  if (!taskGesture || taskGesture.id !== e.pointerId) return;
  const dx = e.clientX - taskGesture.x;
  const dy = e.clientY - taskGesture.y;

  if (!taskGesture.dragging) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
      taskGesture = null; // keep native vertical reading/scrolling
      settleTaskStage();
      return;
    }
    if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    taskGesture.dragging = true;
    taskStage.classList.add("is-dragging");
    try { taskStage.setPointerCapture(e.pointerId); } catch {}
    window.getSelection()?.removeAllRanges();
  }

  e.preventDefault();
  taskDragX = Math.max(-170, Math.min(170, taskGesture.offset + dx * .8));
  if (!taskDragFrame) taskDragFrame = requestAnimationFrame(flushTaskDrag);
});

function endTaskGesture(e, cancelled = false) {
  if (!taskGesture || taskGesture.id !== e.pointerId) return;
  const { dragging, x } = taskGesture;
  taskGesture = null;
  taskStage.classList.remove("is-dragging");
  if (dragging) {
    suppressTaskClick = true;
    setTimeout(() => { suppressTaskClick = false; }, 0);
    const dx = e.clientX - x;
    if (!cancelled && Math.abs(dx) > 70) browseUpdate(dx < 0 ? 1 : -1);
  }
  settleTaskStage();
}

taskStage.addEventListener("pointerup", (e) => endTaskGesture(e));
taskStage.addEventListener("pointercancel", (e) => endTaskGesture(e, true));
taskStage.addEventListener("click", (e) => {
  if (!suppressTaskClick) return;
  e.preventDefault();
  e.stopPropagation();
}, true);
document.addEventListener("keydown", (e) => {
  if (!overlay.classList.contains("open")) return;

  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    browseUpdate(e.key === "ArrowLeft" ? -1 : 1);
    return;
  }

  if (e.key !== "Tab") return;

  const focusable = [...overlay.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((node) => !node.hidden && node.getClientRects().length);

  if (!focusable.length) {
    e.preventDefault();
    closeBtn.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

let suppressNextClick = false;

function edgeLimitInfo(el) {
  return { max: Math.max(0, el.scrollWidth - el.clientWidth) };
}

(function enableDragScroll(el) {
  let isDown = false;
  let dragButton = null;
  let startX = 0;
  let scrollLeft = 0;
  let didDrag = false;
  let activeEdge = null;

  // Smooth wheel scrolling state.
  let targetScroll = el.scrollLeft;
  let smoothWheelRaf = 0;

  const animateWheelScroll = () => {
    const distance = targetScroll - el.scrollLeft;

    if (Math.abs(distance) < 0.35) {
      el.scrollLeft = targetScroll;
      smoothWheelRaf = 0;
      return;
    }

    // Ease toward the target instead of jumping one wheel step at a time.
    el.scrollLeft += distance * 0.16;
    smoothWheelRaf = requestAnimationFrame(animateWheelScroll);
  };

  el.addEventListener("pointerdown", (e) => {
    // Touch uses native horizontal scrolling and momentum. Pointer capture
    // here cancels a phone's swipe after the first few pixels.
    if (e.pointerType === "touch") return;
    // Left-click drag and middle-mouse drag both pan the timeline.
    if (e.button !== 0 && e.button !== 1) return;

    isDown = true;
    dragButton = e.button;
    if (smoothWheelRaf) {
      cancelAnimationFrame(smoothWheelRaf);
      smoothWheelRaf = 0;
    }
    // Leave simple clicks on the date button; capture only after a drag starts.
    didDrag = false;
    activeEdge = null;
    track.classList.remove("rubberbanding");
    el.classList.add("dragging");
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    targetScroll = el.scrollLeft;

    // Stop the browser's native middle-click autoscroll so the timeline owns it.
    if (e.button === 1) e.preventDefault();
  });

  el.addEventListener("pointermove", (e) => {
    if (!isDown) return;

    const x = e.pageX - el.offsetLeft;
    const delta = x - startX;
    const dragScale = e.pointerType === "mouse" ? 1.2 : 1;
    const rawTarget = scrollLeft - delta * dragScale;
    const { max } = edgeLimitInfo(el);

    if (!didDrag && Math.abs(delta) > 5) {
      didDrag = true;
      if (typeof el.setPointerCapture === "function") {
        try { el.setPointerCapture(e.pointerId); } catch {}
      }
    }
    if (!didDrag) return;

    e.preventDefault();

    const atLeft = rawTarget < 0;
    const atRight = rawTarget > max;

    if (atLeft || atRight) {
      activeEdge = atLeft ? "left" : "right";
      const edge = activeEdge === "left" ? 0 : max;
      const over = Math.abs(rawTarget - edge);
      const pull = Math.min(96, over * 0.38);
      const signed = activeEdge === "left" ? pull : -pull;

      el.scrollLeft = edge;
      targetScroll = edge;
      track.style.transform = `translate3d(${signed}px, 0, 0)`;
      return;
    }

    activeEdge = null;
    track.style.transform = "translate3d(0, 0, 0)";
    el.scrollLeft = Math.max(0, Math.min(max, rawTarget));
    targetScroll = el.scrollLeft;
  });

  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    el.classList.remove("dragging");

    // Only left-drag needs click suppression; middle mouse never opens a date.
    if (didDrag && dragButton === 0) {
      suppressNextClick = true;
      setTimeout(() => { suppressNextClick = false; }, 0);
    }

    if (activeEdge) {
      track.classList.add("rubberbanding");
      track.style.transform = "translate3d(0, 0, 0)";
      setTimeout(() => track.classList.remove("rubberbanding"), 320);
    } else {
      track.style.transform = "translate3d(0, 0, 0)";
    }

    activeEdge = null;
    dragButton = null;
  };

  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  el.addEventListener("lostpointercapture", endDrag);
  window.addEventListener("pointerup", endDrag);

  // Keep wheel targets in sync after native touch scrolling on hybrid devices.
  el.addEventListener("scroll", () => {
    if (!smoothWheelRaf && !isDown) targetScroll = el.scrollLeft;
  }, { passive: true });

  // Mouse wheel scrolls the horizontal timeline with eased momentum.
  el.addEventListener("wheel", (e) => {
    const { max } = edgeLimitInfo(el);
    if (max <= 0) return;

    const amount = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (!amount) return;

    // Keep accumulating wheel input into a target so quick wheel movements
    // flow together instead of producing several visible jumps.
    targetScroll = Math.max(0, Math.min(max, targetScroll + amount * 1.08));

    const movingTowardTimeline =
      (amount > 0 && targetScroll > el.scrollLeft) ||
      (amount < 0 && targetScroll < el.scrollLeft);

    if (movingTowardTimeline || Math.abs(targetScroll - el.scrollLeft) > 0.5) {
      e.preventDefault();
      if (!smoothWheelRaf) {
        smoothWheelRaf = requestAnimationFrame(animateWheelScroll);
      }
    }
  }, { passive: false });

  // Prevent browser middle-click autoscroll from appearing over the timeline.
  el.addEventListener("auxclick", (e) => {
    if (e.button === 1) e.preventDefault();
  });
})(scrollBox);

window.addEventListener("resize", () => {
  const { max } = edgeLimitInfo(scrollBox);
  if (scrollBox.scrollLeft > max) scrollBox.scrollLeft = max;
}, { passive: true });
