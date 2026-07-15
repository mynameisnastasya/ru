/* ============================================================
   Вариант 05 «3D Tactile».
   База: меню, диагностика, reveal, форма, FAQ — без изменений.
   Добавлено (адаптации 21st.dev на vanilla):
   — aceternity/3d-card ............. tilt hero-коллажа и карточек
   — aceternity/sticky-scroll-reveal  липкая сцена секции «Метод»
   — aceternity/typewriter-effect ... печать .microcopy в hero
   — jatin-yadav05/morphing-cursor .. точка-курсор → кольцо
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

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
const wideScreen = window.matchMedia("(min-width: 769px)");
const methodScreenWide = window.matchMedia("(min-width: 901px)");

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

/* ------------------------------------------------------------
   1. 3D Card / Tilt — aceternity/3d-card (vanilla)
   pointermove + rAF-lerp: rotateX/rotateY до ±7°, возврат в 0.
   Активен только на точном указателе и ширине > 768px.
   ------------------------------------------------------------ */
(() => {
  const MAX_TILT = 7;
  const tilts = [];

  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const state = {
      el,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      hovering: false,
    };
    tilts.push(state);

    el.addEventListener("pointerenter", (event) => {
      if (!tiltEnabled() || event.pointerType !== "mouse") return;
      state.hovering = true;
      // Отключаем транзишен .reveal по transform, чтобы не смазывать lerp
      el.style.transition = "none";
      startTiltLoop();
    });

    el.addEventListener("pointermove", (event) => {
      if (!state.hovering) return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      // Бенто-карточки проблем — деликатнее, до 3°
      const limit = el.classList.contains("problem-card") ? 3 : MAX_TILT;
      state.targetY = px * limit * 2;
      state.targetX = -py * limit * 2;
    });

    el.addEventListener("pointerleave", () => {
      state.hovering = false;
      state.targetX = 0;
      state.targetY = 0;
      state.currentX = 0;
      state.currentY = 0;
      // Плавный возврат в 0 через CSS transition
      el.style.transition = "transform 0.5s ease";
      el.style.transform = "";
      window.setTimeout(() => {
        el.style.transition = "";
      }, 520);
    });
  });

  function tiltEnabled() {
    return finePointer.matches && wideScreen.matches && !reducedMotion.matches;
  }

  let rafId = null;

  function startTiltLoop() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(tick);
  }

  function tick() {
    let anyActive = false;

    tilts.forEach((state) => {
      if (!state.hovering) return;
      anyActive = true;
      state.currentX += (state.targetX - state.currentX) * 0.12;
      state.currentY += (state.targetY - state.currentY) * 0.12;
      const lift = state.el.classList.contains("problem-card") ? " translateY(-4px)" : "";
      state.el.style.transform =
        "rotateX(" + state.currentX.toFixed(3) + "deg) rotateY(" + state.currentY.toFixed(3) + "deg)" + lift;
    });

    if (anyActive) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }
})();

/* ------------------------------------------------------------
   2. Sticky Scroll Reveal — aceternity/sticky-scroll-reveal (vanilla)
   Пин ~400vh, прогресс из позиции скролла, активный шаг
   и прогресс-бар обновляются в rAF. На узких экранах и
   reduced-motion CSS возвращает обычный список.
   ------------------------------------------------------------ */
(() => {
  const pin = document.querySelector("[data-method-pin]");
  const items = pin ? [...pin.querySelectorAll(".method-item")] : [];
  const currentLabel = pin?.querySelector("[data-method-current]");
  const bar = pin?.querySelector("[data-method-bar]");
  if (!pin || !items.length) return;

  let ticking = false;
  let activeIndex = -1;

  function stickyEnabled() {
    return methodScreenWide.matches && !reducedMotion.matches;
  }

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    items.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
      item.classList.toggle("is-passed", i < index);
    });
    if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, "0");
  }

  function resetSticky() {
    activeIndex = -1;
    items.forEach((item) => item.classList.remove("is-active", "is-passed"));
    if (bar) bar.style.transform = "";
  }

  function update() {
    ticking = false;
    if (!stickyEnabled()) {
      resetSticky();
      return;
    }

    const rect = pin.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) {
      setActive(0);
      return;
    }

    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    const index = Math.min(items.length - 1, Math.floor(progress * items.length));
    setActive(index);
    if (bar) bar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  methodScreenWide.addEventListener?.("change", requestUpdate);
  reducedMotion.addEventListener?.("change", requestUpdate);
  requestUpdate();
})();

/* ------------------------------------------------------------
   3. Morphing Cursor — jatin-yadav05/morphing-cursor (vanilla)
   Точка 10px следует за мышью через lerp; на a/button/summary
   морфится в кольцо 44px. Слой pointer-events: none, только
   pointer: fine; reduced-motion — курсор не запускается.
   ------------------------------------------------------------ */
(() => {
  const cursor = document.querySelector("[data-cursor]");
  if (!cursor) return;

  function cursorEnabled() {
    return finePointer.matches && wideScreen.matches && !reducedMotion.matches;
  }

  let mouseX = -100;
  let mouseY = -100;
  let curX = -100;
  let curY = -100;
  let rafId = null;
  let seen = false;

  const INTERACTIVE = "a, button, summary, input, textarea, select, label";

  function loop() {
    curX += (mouseX - curX) * 0.22;
    curY += (mouseY - curY) * 0.22;
    cursor.style.transform = "translate3d(" + curX.toFixed(2) + "px, " + curY.toFixed(2) + "px, 0)";
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId === null) rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    cursor.classList.remove("is-visible", "is-ring", "is-pressed");
    seen = false;
  }

  document.addEventListener("pointermove", (event) => {
    if (!cursorEnabled() || event.pointerType !== "mouse") return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!seen) {
      seen = true;
      curX = mouseX;
      curY = mouseY;
      cursor.classList.add("is-visible");
      start();
    }
    cursor.classList.toggle("is-ring", Boolean(event.target.closest?.(INTERACTIVE)));
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") cursor.classList.add("is-pressed");
  });
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));

  document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("mouseenter", () => {
    if (seen && cursorEnabled()) cursor.classList.add("is-visible");
  });

  // Пауза rAF, когда вкладка скрыта
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (seen && cursorEnabled()) {
      start();
    }
  });

  reducedMotion.addEventListener?.("change", () => {
    if (!cursorEnabled()) stop();
  });
  wideScreen.addEventListener?.("change", () => {
    if (!cursorEnabled()) stop();
  });
})();

/* ------------------------------------------------------------
   4. Typewriter Effect — aceternity/typewriter-effect (vanilla)
   .microcopy печатается посимвольно (~30ms/символ) с мигающей
   кареткой, старт — когда элемент попал во viewport.
   reduced-motion — текст выводится сразу.
   ------------------------------------------------------------ */
(() => {
  const target = document.querySelector("[data-typewriter]");
  if (!target) return;

  const fullText = target.textContent.trim();

  if (reducedMotion.matches) return; // текст уже на месте

  const caret = document.createElement("span");
  caret.className = "tw-caret";
  caret.setAttribute("aria-hidden", "true");

  let started = false;

  const twObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        twObserver.disconnect();
        run();
      });
    },
    { threshold: 0.4 },
  );

  // Доступность: скринридеру отдаём полный текст сразу
  target.setAttribute("aria-label", fullText);
  target.textContent = "";
  target.appendChild(caret);
  twObserver.observe(target);

  function run() {
    if (reducedMotion.matches) {
      target.textContent = fullText;
      target.removeAttribute("aria-label");
      return;
    }

    let index = 0;
    const textNode = document.createTextNode("");
    target.insertBefore(textNode, caret);

    const timer = window.setInterval(() => {
      index += 1;
      textNode.textContent = fullText.slice(0, index);
      if (index >= fullText.length) {
        window.clearInterval(timer);
        window.setTimeout(() => caret.remove(), 2400);
      }
    }, 30);
  }
})();
