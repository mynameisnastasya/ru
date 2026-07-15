/* ============================================================
   Editorial Cut — база + типографические адаптации 21st.dev:
   fancy/vertical-cut-reveal, magicui/text-reveal,
   aceternity/timeline, magicui/scroll-progress
   (marquee — чистый CSS, см. styles.css)
   ============================================================ */

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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

/* ------------------------------------------------------------
   1. fancy/vertical-cut-reveal — заголовки [data-cut]
   Оборачивает каждое слово в .cut-word > .cut-inner, сохраняя
   <em> и <br>, и раздаёт стаггер ~60ms. Показ — по IO.
   ------------------------------------------------------------ */
const CUT_STAGGER = 60; // ms между словами

function wrapCutWords(heading) {
  let wordIndex = 0;

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "cut-word";
        const inner = document.createElement("span");
        inner.className = "cut-inner";
        inner.textContent = part;
        inner.style.transitionDelay = `${wordIndex * CUT_STAGGER}ms`;
        word.appendChild(inner);
        fragment.appendChild(word);
        wordIndex += 1;
      });
      node.replaceWith(fragment);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
      [...node.childNodes].forEach(processNode);
    }
  }

  [...heading.childNodes].forEach(processNode);
  heading.classList.add("is-cut-ready");
}

if (!prefersReducedMotion) {
  const cutHeadings = [...document.querySelectorAll("[data-cut]")];
  cutHeadings.forEach(wrapCutWords);

  const cutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-cut");
          cutObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 },
  );

  cutHeadings.forEach((heading) => cutObserver.observe(heading));
}

/* ------------------------------------------------------------
   2. magicui/text-reveal — манифест [data-text-reveal]
   Слова проявляются opacity 0.15→1 по прогрессу секции.
   ------------------------------------------------------------ */
const textRevealTargets = [];

if (!prefersReducedMotion) {
  document.querySelectorAll("[data-text-reveal]").forEach((paragraph) => {
    const words = paragraph.textContent.trim().split(/\s+/);
    paragraph.textContent = "";
    paragraph.classList.add("is-tr");
    const spans = words.map((word, i) => {
      const span = document.createElement("span");
      span.className = "tr-word";
      span.textContent = word;
      span.style.opacity = "0.15";
      paragraph.appendChild(span);
      if (i !== words.length - 1) paragraph.appendChild(document.createTextNode(" "));
      return span;
    });
    textRevealTargets.push({ section: paragraph.closest("section") || paragraph, spans });
  });
}

function updateTextReveal() {
  const vh = window.innerHeight;
  textRevealTargets.forEach(({ section, spans }) => {
    const rect = section.getBoundingClientRect();
    // 0 — секция только вошла снизу, 1 — её низ дошёл до середины экрана
    const total = rect.height + vh * 0.5;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / total));
    spans.forEach((span, i) => {
      const start = i / spans.length;
      const end = start + 1 / spans.length;
      const local = Math.min(1, Math.max(0, (progress - start) / (end - start)));
      span.style.opacity = String(0.15 + local * 0.85);
    });
  });
}

/* ------------------------------------------------------------
   3. aceternity/timeline — прогресс линии метода (--progress)
   ------------------------------------------------------------ */
const timeline = document.querySelector("[data-timeline]");

function updateTimeline() {
  if (!timeline || prefersReducedMotion) return;
  const rect = timeline.getBoundingClientRect();
  const vh = window.innerHeight;
  // заливка растёт, пока середина экрана проходит таймлайн
  const progress = Math.min(1, Math.max(0, (vh * 0.6 - rect.top) / rect.height));
  timeline.style.setProperty("--progress", progress.toFixed(4));
}

/* ------------------------------------------------------------
   4. magicui/scroll-progress — полоса прогресса чтения
   ------------------------------------------------------------ */
const scrollProgressBar = document.querySelector("[data-scroll-progress]");

function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  scrollProgressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
}

/* Один rAF-цикл на все скролл-эффекты */
let scrollTicking = false;

function onScrollFrame() {
  scrollTicking = false;
  updateHeader();
  updateScrollProgress();
  updateTimeline();
  updateTextReveal();
}

function requestScrollFrame() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(onScrollFrame);
}

window.addEventListener("scroll", requestScrollFrame, { passive: true });
window.addEventListener("resize", requestScrollFrame, { passive: true });
onScrollFrame();
