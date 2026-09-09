"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type MotionKey =
  | "manifesto"
  | "edit"
  | "finder"
  | "personal"
  | "order"
  | "faq"
  | "closing";

const KEYS: MotionKey[] = [
  "manifesto",
  "edit",
  "finder",
  "personal",
  "order",
  "faq",
  "closing",
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function sectionProgress(element: Element | null) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  const distance = viewport + Math.max(rect.height, viewport * 0.4);
  return clamp((viewport - rect.top) / distance);
}

function stage(progress: number, start: number, duration: number) {
  return clamp((progress - start) / duration);
}

function px(value: number) {
  return `${value.toFixed(2)}px`;
}

function num(value: number) {
  return value.toFixed(4);
}

export default function WinkMotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".wx-home");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      root.dataset.motionRuntime = "off";
      return;
    }

    const sections: Record<MotionKey, Element | null> = {
      manifesto: root.querySelector(".wx-manifesto"),
      edit: root.querySelector(".wx-edit"),
      finder: root.querySelector(".wx-finder"),
      personal: root.querySelector(".wx-personal"),
      order: root.querySelector(".wx-order"),
      faq: root.querySelector(".wx-faq"),
      closing: root.querySelector(".wx-closing"),
    };

    const current = Object.fromEntries(KEYS.map((key) => [key, 0])) as Record<MotionKey, number>;
    const target = { ...current };
    let frame = 0;
    let mounted = true;

    root.dataset.motionRuntime = "on";

    function sample() {
      for (const key of KEYS) target[key] = sectionProgress(sections[key]);
    }

    function set(name: string, value: string) {
      root.style.setProperty(name, value);
    }

    function paint() {
      frame = 0;
      if (!mounted) return;

      let unsettled = false;
      for (const key of KEYS) {
        const delta = target[key] - current[key];
        current[key] += delta * 0.14;
        if (Math.abs(delta) > 0.001) unsettled = true;
      }

      const manifesto = current.manifesto;
      set("--wx-rt-manifesto-a-y", px((0.5 - manifesto) * 92));
      set("--wx-rt-manifesto-b-y", px((manifesto - 0.5) * 128));
      set("--wx-rt-manifesto-scale", num(1.07 - stage(manifesto, 0.08, 0.58) * 0.045));

      const edit = current.edit;
      const editHead = stage(edit, 0.03, 0.28);
      set("--wx-rt-edit-head-y", px((1 - editHead) * 78));
      set("--wx-rt-edit-head-opacity", num(0.18 + editHead * 0.82));
      [0.08, 0.16, 0.24, 0.32].forEach((start, index) => {
        const value = stage(edit, start, 0.24);
        set(`--wx-rt-card-${index + 1}-y`, px((1 - value) * (74 + index * 9)));
        set(`--wx-rt-card-${index + 1}-opacity`, num(0.08 + value * 0.92));
        set(`--wx-rt-card-${index + 1}-scale`, num(0.965 + value * 0.035));
      });

      const finder = current.finder;
      const finderStage = stage(finder, 0.05, 0.42);
      set("--wx-rt-finder-y", px((1 - finderStage) * 96));
      set("--wx-rt-finder-scale", num(0.925 + finderStage * 0.075));
      set("--wx-rt-finder-rotate", `${((1 - finderStage) * 1.25).toFixed(3)}deg`);
      set("--wx-rt-finder-opacity", num(0.16 + finderStage * 0.84));

      const personal = current.personal;
      set("--wx-rt-personal-media-y", px((0.5 - personal) * 118));
      set("--wx-rt-personal-media-scale", num(1.12 - stage(personal, 0.04, 0.78) * 0.07));
      [0.12, 0.31, 0.5].forEach((start, index) => {
        const value = stage(personal, start, 0.2);
        set(`--wx-rt-personal-${index + 1}-y`, px((1 - value) * 66));
        set(`--wx-rt-personal-${index + 1}-opacity`, num(0.12 + value * 0.88));
      });

      const order = current.order;
      const orderHead = stage(order, 0.03, 0.24);
      set("--wx-rt-order-head-x", px((1 - orderHead) * -72));
      set("--wx-rt-order-head-opacity", num(0.18 + orderHead * 0.82));
      [0.14, 0.27, 0.4, 0.53].forEach((start, index) => {
        const value = stage(order, start, 0.18);
        set(`--wx-rt-order-${index + 1}-y`, px((1 - value) * 48));
        set(`--wx-rt-order-${index + 1}-opacity`, num(0.12 + value * 0.88));
      });

      const faq = current.faq;
      set("--wx-rt-faq-y", px((1 - stage(faq, 0.04, 0.28)) * 64));
      set("--wx-rt-faq-opacity", num(0.2 + stage(faq, 0.04, 0.28) * 0.8));

      const closing = current.closing;
      const closingStage = stage(closing, 0.04, 0.54);
      set("--wx-rt-closing-y", px((1 - closingStage) * 92));
      set("--wx-rt-closing-scale", num(0.88 + closingStage * 0.12));
      set("--wx-rt-closing-opacity", num(0.12 + closingStage * 0.88));
      set("--wx-rt-closing-orbit-a", `${(-18 + closing * 54).toFixed(2)}deg`);
      set("--wx-rt-closing-orbit-b", `${(12 - closing * 46).toFixed(2)}deg`);

      if (unsettled) frame = window.requestAnimationFrame(paint);
    }

    function schedule() {
      sample();
      if (!frame) frame = window.requestAnimationFrame(paint);
    }

    sample();
    for (const key of KEYS) current[key] = target[key];
    paint();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      mounted = false;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      delete root.dataset.motionRuntime;
      for (const name of Array.from(root.style)) {
        if (name.startsWith("--wx-rt-")) root.style.removeProperty(name);
      }
    };
  }, [pathname]);

  return null;
}
