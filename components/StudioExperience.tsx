"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { FormEvent, PointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { caseStudies, faqs, offers } from "@/lib/content";

const navItems = [
  ["WORK", "#work"],
  ["METHOD", "#method"],
  ["SERVICES", "#services"],
  ["ABOUT", "#about"],
  ["CONTACT", "#contact"],
] as const;

const methodSteps = [
  ["01", "STRATEGY", "Что человек должен почувствовать, понять и сделать."],
  ["02", "DIRECTION", "Одна сильная идея вместо пятнадцати красивых настроений."],
  ["03", "PROTOTYPE", "Поведение проверяется до того, как становится дорогим кодом."],
  ["04", "BUILD", "Responsive production без потери арт-дирекшна."],
  ["05", "QA", "Браузер, клавиатура, скорость, мобильный ритм и здравый смысл."],
  ["06", "LAUNCH", "Рабочая система и материал для первого сильного выхода."],
] as const;

const backstage = [
  ["BRIEF", "Что изменилось в бизнесе — и что сайт всё ещё не показывает."],
  ["INSIGHT", "Одна правда, вокруг которой можно строить."],
  ["DIRECTIONS", "Три разные системы, не три оттенка одного экрана."],
  ["BAD IDEAS", "Красивое, модное, ожидаемое — и не ваше. Уходит."],
  ["SELECTION", "Направление, которое выдерживает смысл, mobile и production."],
  ["PROTOTYPE", "Проверка жеста до полировки."],
  ["BUILD + QA", "Код, адаптив, доступность и финальные решения."],
] as const;

const formSteps = [
  { key: "product", label: "Что вы продаёте и кому?", kind: "textarea" },
  { key: "link", label: "Ссылка на сайт / продукт / соцсеть", kind: "url" },
  { key: "problem", label: "Что сейчас не работает?", kind: "textarea" },
  {
    key: "perception",
    label: "Что должно измениться в восприятии бренда после запуска?",
    kind: "textarea",
  },
  { key: "format", label: "Какой формат рассматриваете?", kind: "format" },
  { key: "budget", label: "Какой бюджет рассматриваете?", kind: "budget" },
  { key: "launch", label: "Когда нужен запуск?", kind: "text" },
  { key: "dateReason", label: "Почему важна эта дата?", kind: "textarea" },
  { key: "decision", label: "Кто принимает финальное решение?", kind: "text" },
] as const;

const formOptions = {
  format: [
    "Brand Direction Sprint",
    "Signature Site",
    "Full Digital Identity",
    "Interaction Lab",
    "Пока не уверена / не уверен",
  ],
  budget: ["до 85K ₽", "85–120K ₽", "140–200K ₽", "240K+ ₽"],
};

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function MagneticLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    event.currentTarget.style.setProperty("--mx", `${x}px`);
    event.currentTarget.style.setProperty("--my", `${y}px`);
  };

  const reset = (event: PointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--mx", "0px");
    event.currentTarget.style.setProperty("--my", "0px");
  };

  return (
    <a
      className={`action-link${secondary ? " action-link-secondary" : ""}`}
      href={href}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="action-arrow">↗</span>
    </a>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main">К содержанию</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="NASTASYA / ONLY STAIS — наверх">
          <span>NASTASYA</span>
          <span className="wordmark-slash">/</span>
          <span>ONLY STAIS</span>
        </a>
        <nav aria-label="Основная навигация" className="desktop-nav">
          {navItems.map(([label, href]) => <a href={href} key={label}>{label}</a>)}
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? "CLOSE" : "INDEX"}</span>
          <span aria-hidden="true">{open ? "×" : "/"}</span>
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Мобильная навигация"
            className="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {navItems.map(([label, href], index) => (
              <a href={href} key={label} onClick={() => setOpen(false)}>
                <span>0{index + 1}</span>{label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const frameScale = useTransform(scrollYProgress, [0, 0.55, 1], [0.88, 0.94, 1]);
  const frameRadius = useTransform(scrollYProgress, [0, 0.72], [12, 0]);
  const headlineX = useTransform(scrollYProgress, [0, 0.52], [0, -42]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.38, 0.7], [1, 1, 0]);
  const proofOpacity = useTransform(scrollYProgress, [0.5, 0.82], [0, 1]);
  const proofY = useTransform(scrollYProgress, [0.48, 0.88], [60, 0]);

  return (
    <section className="hero-scroll" id="top" ref={ref} aria-labelledby="hero-title">
      <div className="hero-sticky">
        <motion.div
          className="hero-frame"
          style={{
            scale: reduceMotion ? 1 : frameScale,
            borderRadius: reduceMotion ? 0 : frameRadius,
          }}
        >
          <div className="frame-coordinates" aria-hidden="true">
            <span>OS/01</span><span>55.7558°N</span><span>WILD PRECISION</span>
          </div>
          <motion.div className="hero-copy" style={{ opacity: reduceMotion ? 1 : copyOpacity }}>
            <p className="hero-kicker">FOUNDER-LED CREATIVE WEB STUDIO</p>
            <motion.h1 id="hero-title" style={{ x: reduceMotion ? 0 : headlineX }}>
              <span>САЙТЫ ДЛЯ</span>
              <span>БРЕНДОВ, КОТОРЫМ</span>
              <span className="pressure-line">ТЕСНО <i>В ШАБЛОНАХ.</i></span>
            </motion.h1>
            <div className="hero-bottom">
              <p>
                Strategy, art direction и custom digital experiences для экспертов и founder-led брендов,
                которые уже выросли из generic web.
              </p>
              <div className="hero-actions">
                <MagneticLink href="#contact">ОБСУДИТЬ ПРОЕКТ</MagneticLink>
                <MagneticLink href="#work" secondary>СМОТРЕТЬ РАБОТЫ</MagneticLink>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="hero-proof"
            aria-hidden={reduceMotion ? true : undefined}
            style={{ opacity: reduceMotion ? 0 : proofOpacity, y: reduceMotion ? 0 : proofY }}
          >
            <div className="proof-title">YOUR BRAND,</div>
            <div className="proof-title proof-title-serif">IMPOSSIBLE</div>
            <div className="proof-title proof-title-right">TO TEMPLATE.</div>
            <div className="proof-slice proof-slice-a"><span>STRATEGY</span><b>01</b></div>
            <div className="proof-slice proof-slice-b"><span>INTERACTION</span><b>02</b></div>
            <div className="proof-slice proof-slice-c"><span>BUILD / QA</span><b>03</b></div>
          </motion.div>
          <div className="frame-pressure" aria-hidden="true"><span /><span /></div>
        </motion.div>
        <div className="hero-scroll-note" aria-hidden="true">SCROLL TO APPLY PRESSURE <span>↓</span></div>
      </div>
    </section>
  );
}

function Showreel() {
  return (
    <section className="showreel-section" id="work" aria-labelledby="showreel-title">
      <div className="section-index"><span>02</span><span>PROOF WINDOW</span><span>12 SEC / DOM</span></div>
      <Reveal className="showreel-intro">
        <p>Сайт не обещает interaction craft.</p>
        <h2 id="showreel-title">ОН ДОЛЖЕН<br /><em>ПОКАЗАТЬ</em> ЕГО.</h2>
      </Reveal>
      <div className="reel-frame" aria-label="Автоматическая 12-секундная демонстрация визуального языка сайта">
        <div className="reel-scene reel-scene-one">
          <span className="reel-label">SCENE / 01</span>
          <strong>PRESSURE<br /><i>CREATES</i><br />FORM.</strong>
        </div>
        <div className="reel-scene reel-scene-two">
          <span className="reel-label">SCENE / 02</span>
          <div className="interface-lines"><span /><span /><span /><span /></div>
          <strong>NOT A<br />DECORATION.</strong>
        </div>
        <div className="reel-scene reel-scene-three">
          <span className="reel-label">SCENE / 03</span>
          <div className="mobile-specimen"><span>ONLY</span><b>STAIS</b><small>MOBILE / AUTHORED</small></div>
          <strong>ONE IDEA.<br />EVERY SCREEN.</strong>
        </div>
        <div className="reel-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="problem-section" aria-labelledby="problem-title">
      <div className="section-index dark-index"><span>03</span><span>THE GAP</span><span>RECOGNITION BEFORE SALES</span></div>
      <Reveal>
        <h2 id="problem-title">ВАШ ПРОДУКТ<br />УЖЕ <em>ВЫРОС.</em><br />А САЙТ — ЕЩЁ НЕТ.</h2>
      </Reveal>
      <div className="problem-lines">
        {[
          ["01", "ПОВЫСИЛИ ЧЕК", "сайт всё ещё выглядит на старую цену."],
          ["02", "ВЫХОДИТЕ НА НОВЫЙ РЫНОК", "digital всё ещё generic."],
          ["03", "У ПРОДУКТА ЕСТЬ ХАРАКТЕР", "на сайте его не видно."],
          ["04", "КАЖДЫЙ РАЗ ОБЪЯСНЯЕТЕ", "почему стоите дороже."],
        ].map(([number, lead, text]) => (
          <Reveal className="problem-line" key={number}>
            <span>{number}</span><strong>{lead}</strong><p>{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Cases() {
  const [activeCase, setActiveCase] = useState(caseStudies[0].id);

  return (
    <section className="cases-section" aria-labelledby="cases-title">
      <div className="section-index"><span>04</span><span>SELECTED WORLDS</span><span>HONEST CONCEPT WORK</span></div>
      <Reveal className="cases-heading">
        <h2 id="cases-title">НЕ КАРТОЧКИ.<br /><em>МИРЫ,</em> В КОТОРЫЕ<br />МОЖНО ВОЙТИ.</h2>
        <p>Реальные коммерческие результаты не выдуманы. Эти self-initiated концепты показывают логику: контекст → решение → digital-жест.</p>
      </Reveal>
      <div className="case-list">
        {caseStudies.map((item) => {
          const open = activeCase === item.id;
          return (
            <article className={`case-chapter ${open ? "is-open" : ""}`} key={item.id}>
              <button
                className="case-trigger"
                type="button"
                aria-expanded={open}
                aria-controls={`case-${item.id}`}
                onClick={() => setActiveCase(open ? "" : item.id)}
              >
                <span className="case-number">{item.index}</span>
                <span className="case-name">{item.title}</span>
                <span className="case-category">{item.category}</span>
                <span className="case-action" aria-hidden="true">{open ? "CLOSE ×" : "ENTER ↗"}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`case-${item.id}`}
                    className="case-world"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={`case-visual ${item.palette}`}>
                      <div className="case-visual-meta"><span>ONLY STAIS / CONCEPT</span><span>{item.index}—03</span></div>
                      <div className="case-visual-word">{item.title.split(" / ")[0]}</div>
                      <div className="case-object" aria-hidden="true"><span /><span /><span /></div>
                      <p>{item.idea}</p>
                    </div>
                    <div className="case-story">
                      <div><span>CONTEXT</span><p>{item.context}</p></div>
                      <div><span>TENSION</span><p>{item.tension}</p></div>
                      <div><span>INSIGHT</span><p>{item.insight}</p></div>
                      <div><span>SIGNATURE INTERACTION</span><p>{item.interaction}</p></div>
                      <div><span>COMMERCIAL ROLE</span><p>{item.role}</p></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SignatureInteraction() {
  const [active, setActive] = useState(0);
  const gestures = [
    ["SCENE SHIFT", "Смена раздела ощущается как смена сцены, а не как новый прямоугольник."],
    ["TYPE TENSION", "Ключевое слово меняет пространство только в момент смыслового давления."],
    ["MAGNETIC FOCUS", "Фокус отвечает на ввод — мягко, без цирка и ловушек для курсора."],
    ["DEPTH REVEAL", "Маленькое доказательство раскрывается в историю из той же точки."],
  ];

  return (
    <section className="signature-section" aria-labelledby="signature-title">
      <div className="section-index"><span>05</span><span>SIGNATURE INTERACTION</span><span>ONE GESTURE / ONE BRAND</span></div>
      <Reveal>
        <h2 id="signature-title">КАЖДОМУ БРЕНДУ —<br />ОДИН <em>DIGITAL-ЖЕСТ,</em><br />КОТОРЫЙ НЕ СПУТАЕШЬ.</h2>
      </Reveal>
      <div className="gesture-stage">
        <div className="gesture-index" aria-label="Словарь взаимодействия">
          {gestures.map(([title], index) => (
            <button
              key={title}
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span>0{index + 1}</span>{title}
            </button>
          ))}
        </div>
        <div className={`gesture-canvas gesture-state-${active}`} aria-live="polite">
          <span className="gesture-orbit" aria-hidden="true" />
          <div className="gesture-copy">
            <small>ACTIVE GESTURE / 0{active + 1}</small>
            <strong>{gestures[active][0]}</strong>
            <p>{gestures[active][1]}</p>
          </div>
          <div className="gesture-mark" aria-hidden="true">/</div>
        </div>
      </div>
    </section>
  );
}

function Method() {
  const [active, setActive] = useState(0);

  return (
    <section className="method-section" id="method" aria-labelledby="method-title">
      <div className="section-index dark-index"><span>06</span><span>METHOD</span><span>STRATEGY BEFORE DECORATION</span></div>
      <Reveal className="method-heading">
        <p>Я не начинаю проект со шрифта.</p>
        <h2 id="method-title">СНАЧАЛА —<br /><em>РЕШЕНИЕ.</em><br />ПОТОМ — КРАСОТА.</h2>
      </Reveal>
      <div className="method-grid">
        <div className={`method-specimen method-stage-${active}`}>
          <div className="specimen-final"><span>FINAL INTERFACE</span><strong>FORM<br />FOLLOWS<br /><i>DECISION.</i></strong></div>
          <div className="specimen-wire" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="specimen-note">WHAT MUST CHANGE<br />IN PERCEPTION?</div>
        </div>
        <div className="method-steps" aria-label="Этапы метода">
          {methodSteps.map(([number, name, text], index) => (
            <button
              key={name}
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <span>{number}</span><strong>{name}</strong><p>{text}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const [active, setActive] = useState(2);

  return (
    <section className="services-section" id="services" aria-labelledby="services-title">
      <div className="section-index"><span>07</span><span>OFFERS</span><span>PRICES / AUG 2026</span></div>
      <Reveal className="services-heading">
        <h2 id="services-title">НЕ ПАКЕТЫ.<br /><em>РАЗНЫЕ ТОЧКИ ВХОДА.</em></h2>
        <p>Цена видна. Срок виден. Какую проблему решает формат — тоже. Без «узнайте на созвоне» ради самого созвона.</p>
      </Reveal>
      <div className="offers-list">
        {offers.map((offer, index) => {
          const open = active === index;
          return (
            <div className={`offer-row ${open ? "is-open" : ""}`} key={offer.name}>
              <button type="button" aria-expanded={open} onClick={() => setActive(index)}>
                <span className="offer-index">0{index + 1}</span>
                <strong>{offer.name}</strong>
                <span>{offer.price}</span>
                <span>{offer.duration}</span>
                <span className="offer-plus" aria-hidden="true">{open ? "—" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    className="offer-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p><span>ДЛЯ КОГО</span>{offer.fit}</p>
                    <p><span>РЕЗУЛЬТАТ</span>{offer.result}</p>
                    <MagneticLink href="#contact">ОБСУДИТЬ ЭТОТ ФОРМАТ</MagneticLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="founder-section" id="about" aria-labelledby="founder-title">
      <div className="section-index"><span>08</span><span>FOUNDER / CREATIVE DIRECTION</span><span>PERSONAL RESPONSIBILITY</span></div>
      <div className="founder-grid">
        <Reveal className="founder-copy">
          <h2 id="founder-title">Я НЕ НАЧИНАЮ<br />ПРОЕКТ <em>СО ШРИФТА.</em></h2>
          <p className="founder-lead">Сначала я нахожу, что человек должен почувствовать, понять и сделать. Потом строю вокруг этого визуальную систему.</p>
          <div className="founder-facts">
            <p><span>NASTASYA</span>Основательница, creative direction, коммуникация и финальные решения.</p>
            <p><span>ONLY STAIS</span>Система production: prototype, build, responsive, QA и launch.</p>
          </div>
          <blockquote>Я люблю красивые вещи. Ещё больше — когда они, сука, работают.</blockquote>
        </Reveal>
        <div className="founder-media" aria-label="Место для реального портрета Настасьи перед публичным запуском">
          <div className="portrait-placeholder">
            <span className="portrait-letter">Н</span>
            <div className="portrait-shutter" aria-hidden="true" />
            <p>FOUNDER PORTRAIT<br /><b>REAL IMAGE REQUIRED</b></p>
          </div>
          <div className="portrait-note"><span>NO STOCK FACE</span><p>Заменить на реальный close crop: direct eye contact / flash / shadow / movement.</p></div>
        </div>
      </div>
    </section>
  );
}

function Backstage() {
  return (
    <section className="backstage-section" aria-labelledby="backstage-title">
      <div className="section-index"><span>09</span><span>BACKSTAGE</span><span>AI-NATIVE / HUMAN-DIRECTED</span></div>
      <Reveal className="backstage-heading">
        <h2 id="backstage-title">AI-NATIVE PRODUCTION.<br /><em>HUMAN DIRECTION.</em></h2>
        <p>AI ускоряет production, рутину и итерации. Но вкус, решение и ответственность делегировать ему я не собираюсь.</p>
      </Reveal>
      <div className="backstage-rail">
        {backstage.map(([name, description], index) => (
          <Reveal className={`backstage-step ${name === "BAD IDEAS" ? "is-rejected" : ""}`} key={name}>
            <span>0{index + 1}</span><strong>{name}</strong><p>{description}</p>
          </Reveal>
        ))}
      </div>
      <div className="rejection-proof">
        <span>DELIBERATELY REJECTED</span>
        <p><s>purple orb</s> <s>glass cards</s> <s>random WebGL</s> <s>generic premium</s> <s>AI made it</s></p>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="section-index dark-index"><span>10</span><span>FAQ</span><span>BUYING QUESTIONS</span></div>
      <Reveal><h2 id="faq-title">БЕЗ МЕЛКОГО<br /><em>ШРИФТА.</em></h2></Reveal>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <details key={question}>
            <summary><span>0{index + 1}</span><strong>{question}</strong><i aria-hidden="true">+</i></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Application() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const current = formSteps[step];
  const value = answers[current?.key] ?? "";

  const next = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    if (step === formSteps.length - 1) {
      setSubmitted(true);
      return;
    }
    setStep((index) => index + 1);
  };

  const setValue = (nextValue: string) => {
    setAnswers((state) => ({ ...state, [current.key]: nextValue }));
  };

  const copyBrief = async () => {
    const brief = formSteps.map((item, index) => `${index + 1}. ${item.label}\n${answers[item.key] ?? "—"}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="application-section" id="contact" aria-labelledby="application-title">
      <div className="application-top">
        <span>11 / APPLICATION</span><span>QUALIFIED PROJECTS / 2026</span>
      </div>
      <h2 id="application-title">ЕСЛИ ПРОДУКТ УЖЕ СИЛЬНЕЕ<br />СВОЕГО САЙТА —<br /><em>ПОРА ЭТО ПОКАЗАТЬ.</em></h2>
      <div className="application-grid">
        <p className="application-note">Девять коротких вопросов. Без бюрократии. В финале можно скопировать собранный бриф и отправить Настасье в удобный канал.</p>
        <div className="form-shell">
          {!submitted ? (
            <form onSubmit={next}>
              <div className="form-progress" aria-label={`Шаг ${step + 1} из ${formSteps.length}`}>
                <span>0{step + 1}</span>
                <div><i style={{ width: `${((step + 1) / formSteps.length) * 100}%` }} /></div>
                <span>0{formSteps.length}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.fieldset
                  key={current.key}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <legend>{current.label}</legend>
                  {current.kind === "textarea" && (
                    <textarea
                      required
                      rows={4}
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder="Коротко и честно"
                    />
                  )}
                  {(current.kind === "url" || current.kind === "text") && (
                    <input
                      required
                      type={current.kind === "url" ? "url" : "text"}
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder={current.kind === "url" ? "https://" : "Ваш ответ"}
                    />
                  )}
                  {(current.kind === "format" || current.kind === "budget") && (
                    <div className="form-options">
                      {formOptions[current.kind].map((option) => (
                        <label key={option}>
                          <input
                            type="radio"
                            name={current.key}
                            value={option}
                            checked={value === option}
                            onChange={(event) => setValue(event.target.value)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </motion.fieldset>
              </AnimatePresence>
              <div className="form-actions">
                <button type="button" disabled={step === 0} onClick={() => setStep((index) => Math.max(0, index - 1))}>НАЗАД</button>
                <button className="form-next" type="submit" disabled={!value.trim()}>{step === formSteps.length - 1 ? "СОБРАТЬ БРИФ" : "ДАЛЬШЕ ↗"}</button>
              </div>
            </form>
          ) : (
            <div className="form-success" role="status">
              <span>APPLICATION / COMPLETE</span>
              <strong>БРИФ СОБРАН.</strong>
              <p>Контактный endpoint намеренно не выдуман. Скопируйте ответы и отправьте их Настасье в том канале, где вы уже общаетесь.</p>
              <button type="button" onClick={copyBrief}>{copied ? "СКОПИРОВАНО ✓" : "СКОПИРОВАТЬ БРИФ"}</button>
              <button className="success-reset" type="button" onClick={() => { setSubmitted(false); setStep(0); }}>ИЗМЕНИТЬ ОТВЕТЫ</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div><span>NASTASYA</span><span>/</span><span>ONLY STAIS</span></div>
      <strong>YOUR BRAND,<br /><i>IMPOSSIBLE TO TEMPLATE.</i></strong>
      <div className="footer-bottom"><span>FOUNDER-LED CREATIVE WEB STUDIO</span><span>© 2026</span><a href="#top">BACK TO TOP ↑</a></div>
    </footer>
  );
}

export function StudioExperience() {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <Showreel />
        <Problem />
        <Cases />
        <SignatureInteraction />
        <Method />
        <Services />
        <Founder />
        <Backstage />
        <FAQ />
        <Application />
      </main>
      <Footer />
    </>
  );
}
