/* ============================================================
   Вариант 02 — «Spotlight Atelier»
   База: меню, диагностика, reveal, форма, FAQ (полностью из исходника).
   Адаптации 21st.dev: floating-navbar (скрытие шапки по направлению
   скролла), glowing-effect (угол conic-градиента к курсору),
   spotlight cursor (пятно света с lerp через rAF).
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
const finePointer = window.matchMedia("(pointer: fine)");

/* ---- aceternity / floating-navbar: скрытие по направлению скролла ---- */
let lastScrollY = window.scrollY;

function updateHeader() {
  const currentY = window.scrollY;
  header?.classList.toggle("is-scrolled", currentY > 24);

  // У самого верха шапка всегда видима; меню открыто — не прячем
  if (currentY < 80 || document.body.classList.contains("menu-open")) {
    header?.classList.remove("is-hidden");
  } else if (currentY > lastScrollY) {
    header?.classList.add("is-hidden");
  } else if (currentY < lastScrollY) {
    header?.classList.remove("is-hidden");
  }
  lastScrollY = currentY;
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
  if (willOpen) header?.classList.remove("is-hidden");
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

/* ---- Диагностика ---- */
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

/* ---- Reveal ---- */
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

/* ---- Форма ---- */
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

/* ---- FAQ ---- */
document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll("details[open]").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

/* ---- aceternity / glowing-effect: угол conic-градиента к курсору ----
   Для каждой .glow-card считаем atan2 от центра карточки к курсору,
   пишем в --start (deg) и включаем --active. Один pointermove + rAF
   на все карточки; на тач/reduced-motion не запускается — остаётся
   статичная border-подсветка из CSS. */
(() => {
  if (!finePointer.matches || prefersReducedMotion.matches) return;

  const cards = [...document.querySelectorAll(".glow-card")];
  if (!cards.length) return;

  const PROXIMITY = 80; // px вокруг карточки, где glow активен
  let pointerX = -1e4;
  let pointerY = -1e4;
  let frame = 0;

  const states = cards.map((card) => ({ card, angle: 0 }));

  function update() {
    frame = 0;
    states.forEach((state) => {
      const rect = state.card.getBoundingClientRect();
      if (rect.bottom < -PROXIMITY || rect.top > window.innerHeight + PROXIMITY) {
        state.card.style.setProperty("--active", "0");
        return;
      }

      const isActive =
        pointerX > rect.left - PROXIMITY &&
        pointerX < rect.right + PROXIMITY &&
        pointerY > rect.top - PROXIMITY &&
        pointerY < rect.bottom + PROXIMITY;

      state.card.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;

      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const target = (180 * Math.atan2(pointerY - centerY, pointerX - centerX)) / Math.PI + 90;

      // Плавный поворот по кратчайшей дуге (сглаживание вместо motion/animate)
      const diff = ((target - state.angle + 180) % 360 + 360) % 360 - 180;
      state.angle += diff * 0.12;
      state.card.style.setProperty("--start", String(state.angle));
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  document.body.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedule();
    },
    { passive: true },
  );
  window.addEventListener("scroll", schedule, { passive: true });
})();

/* ---- Spotlight cursor: пятно света следует за курсором (lerp + rAF) ----
   Нативный курсор не скрываем; слой fixed с pointer-events: none. */
(() => {
  if (!finePointer.matches || prefersReducedMotion.matches) return;

  const spot = document.querySelector(".spotlight-cursor");
  if (!spot) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let rafId = 0;
  let running = false;

  function tick() {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    spot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    if (Math.abs(targetX - currentX) > 0.3 || Math.abs(targetY - currentY) > 0.3) {
      rafId = requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      spot.classList.add("is-on");
      start();
    },
    { passive: true },
  );

  document.addEventListener("pointerleave", () => spot.classList.remove("is-on"));

  // Пауза, когда вкладка скрыта
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      running = false;
    } else {
      start();
    }
  });
})();
