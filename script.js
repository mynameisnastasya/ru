/* ============================================================
   Вариант 01 «Aurora Botanical».
   База: меню, диагностика, reveal, форма, FAQ (из исходного script.js).
   Адаптации 21st.dev:
   - aceternity/flip-words → ротация слов (setInterval + классы enter/exit)
   - aceternity/card-spotlight → --mouse-x/--mouse-y на .service-card
   - aurora-background → пауза анимации при document.hidden
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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

/* ---------- Flip Words (aceternity/flip-words) ----------
   Ротация слов: exit (y вверх + blur + opacity) → замена текста →
   enter (снизу + blur → на место). Классы is-exiting / is-entering,
   переходы описаны в CSS. */

(function initFlipWords() {
  const el = document.querySelector("[data-flip-words]");
  if (!el || prefersReducedMotion.matches) return;

  let words;
  try {
    words = JSON.parse(el.dataset.flipWords);
  } catch {
    return;
  }
  if (!Array.isArray(words) || words.length < 2) return;

  const EXIT_MS = 350;
  const HOLD_MS = 2600;
  let index = Math.max(0, words.indexOf(el.textContent.trim()));
  let timer = 0;

  function flip() {
    el.classList.add("is-exiting");
    window.setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      el.classList.remove("is-exiting");
      el.classList.add("is-entering");
      // форсируем начальное состояние, затем анимируем в ноль
      void el.offsetWidth;
      el.classList.remove("is-entering");
    }, EXIT_MS);
  }

  function start() {
    if (timer) return;
    timer = window.setInterval(flip, HOLD_MS);
  }
  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  start();

  // Пауза, когда вкладка скрыта — незачем крутить слова в фоне
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
})();

/* ---------- Card Spotlight (aceternity/card-spotlight) ----------
   Свечение следует за курсором: пишем координаты в CSS custom
   properties, сам градиент — в styles.css (.service-card::after).
   Только для точных указателей: на тач эффект не имеет смысла. */

(function initCardSpotlight() {
  if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion.matches) return;

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    });
  });
})();

/* ---------- Aurora: пауза при скрытой вкладке ----------
   CSS-анимация лент ставится на паузу через html.page-hidden
   (см. styles.css). */

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("page-hidden", document.hidden);
});
