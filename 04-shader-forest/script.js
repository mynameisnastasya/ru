/* ============================================================
   Вариант 04 — «Shader Forest»
   База: меню, диагностика, reveal, форма, FAQ (из исходного script.js)
   + генеративный canvas-туман (minhxthanh/shader-background,
     kokonutui/beams-background), word rotate (magicui),
     card spotlight (aceternity) — vanilla-адаптации.
   ============================================================ */

/* ---------- база: контент диагностики ---------- */

const diagnosticContent = {
  offer: {
    index: "01 / 05",
    title: "Начните с оффера",
    copy: "Скорее всего, вам пока не нужен полный редизайн. Сначала нужно собрать понятное обещание и первый экран. Для этого подойдёт Conversion Sprint.",
  },
  premium: {
    index: "02 / 05",
    title: "Проверим разрыв в восприятии",
    copy: "Дело редко только в цветах. Обычно вместе работают визуальная система, доказательства, формулировки и сам процесс продажи.",
  },
  leads: {
    index: "03 / 05",
    title: "Сначала данные, потом обвинения",
    copy: "Без цифр нельзя сказать, что виноват сайт. Проверим трафик, понятность оффера, CTA и то, что происходит после клика.",
  },
  funnel: {
    index: "04 / 05",
    title: "Нужен один маршрут",
    copy: "Человек должен понимать, зачем переходить в Telegram, что он там получит и к какому действию придёт после прогрева.",
  },
  unknown: {
    index: "05 / 05",
    title: "Это нормальная точка старта",
    copy: "Если проблема пока не видна, начните с мини-разбора или Digital-диагностики. Не нужно покупать большой сайт наугад.",
  },
};

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const diagnosticButtons = [...document.querySelectorAll("[data-diagnostic]")];
const resultIndex = document.querySelector(".result-index");
const resultTitle = document.querySelector("[data-result-title]");
const resultCopy = document.querySelector("[data-result-copy]");
const form = document.querySelector("[data-audit-form]");
const formSuccess = document.querySelector("[data-form-success]");
const formReset = document.querySelector("[data-form-reset]");

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 767px)");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  mainNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  mainNav?.classList.toggle("is-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

diagnosticButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.diagnostic;
    const content = diagnosticContent[key];
    if (!content) return;

    diagnosticButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    resultIndex.textContent = content.index;
    resultTitle.textContent = content.title;
    resultCopy.textContent = content.copy;
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  form.hidden = true;
  formSuccess.hidden = false;
  formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  formSuccess.querySelector("h3")?.setAttribute("tabindex", "-1");
  formSuccess.querySelector("h3")?.focus({ preventScroll: true });
});

formReset?.addEventListener("click", () => {
  form?.reset();
  form.hidden = false;
  formSuccess.hidden = true;
});

document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll("details[open]").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

/* ============================================================
   1. Генеративный «лесной туман»
   По мотивам minhxthanh/shader-background и kokonutui/beams-background:
   canvas 2D, 5–7 больших радиальных блобов дрейфуют по синусоидам
   разных частот, composite 'lighter', blur поверх (CSS filter на канвасе).
   rAF + cap DPR 1.5 + пауза при document.hidden + полное отключение
   на <768px и при prefers-reduced-motion (fallback — CSS-градиент).
   ============================================================ */

const FOG_PALETTE = [
  { r: 41, g: 70, b: 50, a: 0.5 },   // forest #294632
  { r: 170, g: 183, b: 155, a: 0.1 }, // sage #aab79b (низкая альфа)
  { r: 141, g: 150, b: 114, a: 0.16 }, // brass #8d9672
  { r: 41, g: 70, b: 50, a: 0.42 },
  { r: 170, g: 183, b: 155, a: 0.08 },
  { r: 141, g: 150, b: 114, a: 0.12 },
  { r: 30, g: 55, b: 38, a: 0.45 },
];

function createFogScene(canvas, { muted = false } = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const host = canvas.parentElement;
  const alphaScale = muted ? 0.6 : 1; // финальный CTA — приглушённее
  let width = 0;
  let height = 0;
  let rafId = 0;
  let running = false;
  let blobs = [];

  function makeBlobs() {
    const count = muted ? 5 : 7;
    blobs = Array.from({ length: count }, (_, i) => {
      const tone = FOG_PALETTE[i % FOG_PALETTE.length];
      return {
        tone,
        // базовая точка + амплитуды и частоты синусоид дрейфа
        baseX: (0.12 + Math.random() * 0.76) * width,
        baseY: (0.12 + Math.random() * 0.76) * height,
        ampX: width * (0.08 + Math.random() * 0.14),
        ampY: height * (0.08 + Math.random() * 0.16),
        freqX: 0.00004 + Math.random() * 0.00007,
        freqY: 0.00003 + Math.random() * 0.00006,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        radius: Math.max(width, height) * (0.24 + Math.random() * 0.22),
        breathFreq: 0.00005 + Math.random() * 0.00008,
        breathPhase: Math.random() * Math.PI * 2,
      };
    });
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap DPR 1.5
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeBlobs();
  }

  function draw(time) {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (const blob of blobs) {
      const x = blob.baseX + Math.sin(time * blob.freqX + blob.phaseX) * blob.ampX;
      const y = blob.baseY + Math.sin(time * blob.freqY + blob.phaseY) * blob.ampY;
      const breath = 0.85 + Math.sin(time * blob.breathFreq + blob.breathPhase) * 0.15;
      const r = blob.radius * breath;
      const { tone } = blob;
      const alpha = tone.a * alphaScale;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, `rgba(${tone.r}, ${tone.g}, ${tone.b}, ${alpha})`);
      gradient.addColorStop(0.55, `rgba(${tone.r}, ${tone.g}, ${tone.b}, ${alpha * 0.45})`);
      gradient.addColorStop(1, `rgba(${tone.r}, ${tone.g}, ${tone.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(time) {
    if (!running) return;
    draw(time);
    rafId = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      resize();
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    resize() {
      if (running) resize();
    },
    get isRunning() {
      return running;
    },
  };
}

const fogScenes = [...document.querySelectorAll("[data-fog-canvas]")]
  .map((canvas) => createFogScene(canvas, { muted: canvas.hasAttribute("data-fog-muted") }))
  .filter(Boolean);

function fogAllowed() {
  return !reducedMotionQuery.matches && !mobileQuery.matches && !document.hidden;
}

function syncFog() {
  const allowed = fogAllowed();
  fogScenes.forEach((scene) => {
    if (allowed && !scene.isRunning) scene.start();
    if (!allowed && scene.isRunning) scene.stop(); // остаётся статичный CSS-градиент
  });
}

if (fogScenes.length) {
  syncFog();
  document.addEventListener("visibilitychange", syncFog); // пауза при document.hidden
  reducedMotionQuery.addEventListener?.("change", syncFog);
  mobileQuery.addEventListener?.("change", syncFog);

  let fogResizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(fogResizeTimer);
      fogResizeTimer = setTimeout(() => {
        syncFog();
        fogScenes.forEach((scene) => scene.resize());
      }, 150);
    },
    { passive: true },
  );
}

/* ============================================================
   2. Word Rotate (dillionverma/word-rotate, magicui)
   Слово уходит вверх, новое выезжает снизу; интервал ~2.5s.
   CSS transitions + JS, отключается при prefers-reduced-motion.
   ============================================================ */

document.querySelectorAll("[data-word-rotate]").forEach((el) => {
  let words = [];
  try {
    words = JSON.parse(el.dataset.words || "[]");
  } catch {
    words = [];
  }
  if (words.length < 2 || reducedMotionQuery.matches) return;

  let index = 0;

  setInterval(() => {
    if (document.hidden) return;
    el.classList.add("is-leaving");

    setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      // мгновенно ставим слово под нижний край…
      el.classList.remove("is-leaving");
      el.classList.add("is-entering");
      // …и в следующем кадре плавно поднимаем на место
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.remove("is-entering"));
      });
    }, 300);
  }, 2500);
});

/* ============================================================
   3. Card Spotlight (manuarora700/card-spotlight, aceternity)
   Курсорная radial-подсветка: пишем --mx/--my на pointermove,
   отрисовка — чисто в CSS (::after), только pointer: fine.
   ============================================================ */

if (window.matchMedia("(pointer: fine)").matches && !reducedMotionQuery.matches) {
  document.querySelectorAll(".problem-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}
