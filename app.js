/* global LOSUNGEN_DATA */
(() => {
  const STORAGE_KEY = "losungen_current_index_v1";
  const STORAGE_SHOW_AT_KEY = "losungen_show_at_v1";
  const STORAGE_SHOW_NT_KEY = "losungen_show_nt_v1";

  const el = {
    dateText: document.getElementById("dateText"),
    losungText: document.getElementById("losungText"),
    losungRef: document.getElementById("losungRef"),
    lehrText: document.getElementById("lehrText"),
    lehrRef: document.getElementById("lehrRef"),

    sectionAT: document.getElementById("sectionAT"),
    sectionNT: document.getElementById("sectionNT"),
    btnToggleAT: document.getElementById("btnToggleAT"),
    btnToggleNT: document.getElementById("btnToggleNT"),

    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
  };

  function clamp(n, min, max){
    return Math.max(min, Math.min(max, n));
  }

  function loadIndex(){
    const raw = localStorage.getItem(STORAGE_KEY);
    const idx = raw === null ? 0 : Number(raw);
    if (!Number.isFinite(idx)) return 0;
    return clamp(idx, 0, LOSUNGEN_DATA.length - 1);
  }

  function saveIndex(idx){
    localStorage.setItem(STORAGE_KEY, String(idx));
  }

function loadBool(key, fallback){
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return fallback;
}

function saveBool(key, value){
  localStorage.setItem(key, value ? "1" : "0");
}

let showAT = true;
let showNT = true;

function applyVisibility(){
  if (el.sectionAT){
    el.sectionAT.classList.toggle("is-hidden", !showAT);
  }
  if (el.sectionNT){
    el.sectionNT.classList.toggle("is-hidden", !showNT);
  }

  if (el.btnToggleAT){
    el.btnToggleAT.setAttribute("aria-pressed", String(showAT));
    el.btnToggleAT.classList.toggle("is-off", !showAT);
  }
  if (el.btnToggleNT){
    el.btnToggleNT.setAttribute("aria-pressed", String(showNT));
    el.btnToggleNT.classList.toggle("is-off", !showNT);
  }
}

  let currentIndex = 0;

  function render(){
    if (!Array.isArray(LOSUNGEN_DATA) || LOSUNGEN_DATA.length === 0){
      el.dateText.textContent = "Keine Daten gefunden";
      el.losungText.textContent = "Bitte stelle sicher, dass losungen_2022.js im selben Ordner liegt und LOSUNGEN_DATA enthält.";
      el.losungRef.textContent = "";
      el.lehrText.textContent = "";
      el.lehrRef.textContent = "";
      el.btnPrev.disabled = true;
      el.btnNext.disabled = true;
      applyVisibility();
      return;
    }

    currentIndex = clamp(currentIndex, 0, LOSUNGEN_DATA.length - 1);
    const e = LOSUNGEN_DATA[currentIndex];

    el.dateText.textContent = e.date_text || "—";

    el.losungText.textContent = e.losung_text || "—";
    el.losungRef.textContent = e.losung_ref || "";

    el.lehrText.textContent = e.lehrtext_text || "—";
    el.lehrRef.textContent = e.lehrtext_ref || "";

    applyVisibility();

    el.btnPrev.disabled = currentIndex <= 0;
    el.btnNext.disabled = currentIndex >= LOSUNGEN_DATA.length - 1;

    saveIndex(currentIndex);
  }

  function go(delta){
    currentIndex = clamp(currentIndex + delta, 0, LOSUNGEN_DATA.length - 1);
    render();
  }

  el.btnPrev.addEventListener("click", () => go(-1));
  el.btnNext.addEventListener("click", () => go(1));

if (el.btnToggleAT){
  el.btnToggleAT.addEventListener("click", () => {
    showAT = !showAT;
    saveBool(STORAGE_SHOW_AT_KEY, showAT);
    applyVisibility();
  });
}

if (el.btnToggleNT){
  el.btnToggleNT.addEventListener("click", () => {
    showNT = !showNT;
    saveBool(STORAGE_SHOW_NT_KEY, showNT);
    applyVisibility();
  });
}

  // Keyboard navigation (desktop)
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowLeft") go(-1);
    if (ev.key === "ArrowRight") go(1);
  });

  // Basic swipe support (mobile)
  let touchStartX = null;
  let touchStartY = null;

  window.addEventListener("touchstart", (ev) => {
    const t = ev.touches && ev.touches[0];
    if (!t) return;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  window.addEventListener("touchend", (ev) => {
    const t = ev.changedTouches && ev.changedTouches[0];
    if (!t || touchStartX === null || touchStartY === null) return;

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4){
      if (dx < 0) go(1);   // swipe left -> next
      else go(-1);         // swipe right -> prev
    }

    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

// Init
showAT = loadBool(STORAGE_SHOW_AT_KEY, true);
showNT = loadBool(STORAGE_SHOW_NT_KEY, true);
applyVisibility();

currentIndex = loadIndex();
render();
})();
