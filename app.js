/* global LOSUNGEN_DATA */
(() => {
  const STORAGE_KEY = "losungen_current_index_v1";

  const el = {
    dateText: document.getElementById("dateText"),
    losungText: document.getElementById("losungText"),
    losungRef: document.getElementById("losungRef"),
    lehrText: document.getElementById("lehrText"),
    lehrRef: document.getElementById("lehrRef"),
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
      return;
    }

    currentIndex = clamp(currentIndex, 0, LOSUNGEN_DATA.length - 1);
    const e = LOSUNGEN_DATA[currentIndex];

    el.dateText.textContent = e.date_text || "—";

    el.losungText.textContent = e.losung_text || "—";
    el.losungRef.textContent = e.losung_ref || "";

    el.lehrText.textContent = e.lehrtext_text || "—";
    el.lehrRef.textContent = e.lehrtext_ref || "";

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
  currentIndex = loadIndex();
  render();
})();
