// source: kokonutui :: https://kokonutui.com/r/bento-grid.json
// deps: ["lucide-react","motion"]

// ---- /components/kokonutui/bento-grid.tsx ----
"use client";

/**
 * @author: @dorianbaffier
 * @description: Bento Grid
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Mic,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Anthropic from "@/components/icons/anthropic";
import AnthropicDark from "@/components/icons/anthropic-dark";
import DeepSeek from "@/components/icons/deepseek";
import Google from "@/components/icons/gemini";
import MistralAI from "@/components/icons/mistral";
import OpenAI from "@/components/icons/open-ai";
import OpenAIDark from "@/components/icons/open-ai-dark";
import { cn } from "@/lib/utils";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icons?: boolean;
  href?: string;
  feature?:
    | "chart"
    | "counter"
    | "code"
    | "timeline"
    | "spotlight"
    | "icons"
    | "typing"
    | "metrics";
  spotlightItems?: string[];
  timeline?: Array<{ year: string; event: string }>;
  code?: string;
  codeLang?: string;
  typingText?: string;
  metrics?: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
  statistic?: {
    value: string;
    label: string;
    start?: number;
    end?: number;
    suffix?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "main",
    title: "Building tomorrow's technology",
    description:
      "We architect and develop enterprise-grade applications that scale seamlessly with cloud-native technologies and microservices.",
    href: "#",
    feature: "spotlight",
    spotlightItems: [
      "Microservices architecture",
      "Serverless computing",
      "Container orchestration",
      "API-first design",
      "Event-driven systems",
    ],
    size: "lg",
    className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  },
  {
    id: "stat1",
    title: "AI Agents & Automation",
    description:
      "Intelligent agents that learn, adapt, and automate complex workflows",
    href: "#",
    feature: "typing",
    typingText:
      "const createAgent = async () => {\n  const agent = new AIAgent({\n    model: 'gpt-4-turbo',\n    tools: [codeAnalysis, dataProcessing],\n    memory: new ConversationalMemory()\n  });\n\n  // Train on domain knowledge\n  await agent.learn(domainData);\n\n  return agent;\n};",
    size: "md",
    className: "col-span-2 row-span-1 col-start-1 col-end-3",
  },
  {
    id: "partners",
    title: "Trusted partners",
    description:
      "Working with the leading AI and cloud providers to deliver cutting-edge solutions",
    icons: true,
    href: "#",
    feature: "icons",
    size: "md",
    className: "col-span-1 row-span-1",
  },
  {
    id: "innovation",
    title: "Innovation timeline",
    description:
      "Pioneering the future of AI and cloud computing with breakthrough innovations",
    href: "#",
    feature: "timeline",
    timeline: [
      { year: "2020", event: "Launch of Cloud-Native Platform" },
      { year: "2021", event: "Advanced AI Integration & LLM APIs" },
      { year: "2022", event: "Multi-Agent Systems & RAG Architecture" },
      { year: "2023", event: "Autonomous AI Agents & Neural Networks" },
      {
        year: "2024",
        event: "AGI-Ready Infrastructure & Edge Computing",
      },
    ],
    size: "sm",
    className: "col-span-1 row-span-1",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const SpotlightFeature = ({ items }: { items: string[] }) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item, index) => (
      <motion.li
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
        transition={{ delay: 0.1 * index }}
      >
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
        <span className="text-neutral-700 text-sm dark:text-neutral-300">
          {item}
        </span>
      </motion.li>
    ))}
  </ul>
);

const CounterAnimation = ({
  start,
  end,
  suffix = "",
}: {
  start: number;
  end: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easedProgress = 1 - (1 - progress) ** 3;
      const current = start + (end - start) * easedProgress;

      setCount(Math.min(current, end));

      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [start, end]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="font-bold text-3xl text-neutral-900 dark:text-neutral-100">
        {count.toFixed(1).replace(/\.0$/, "")}
      </span>
      <span className="font-medium text-neutral-900 text-xl dark:text-neutral-100">
        {suffix}
      </span>
    </div>
  );
};

const ChartAnimation = ({ value }: { value: number }) => (
  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
    <motion.div
      animate={{ width: `${value}%` }}
      className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
      initial={{ width: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
  </div>
);

const IconsFeature = () => (
  <div className="mt-4 grid grid-cols-3 gap-4">
    <motion.div className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-100/80 to-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300 dark:border-neutral-700/50 dark:from-neutral-800/80 dark:to-neutral-800 dark:hover:border-neutral-600">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <OpenAI className="h-7 w-7 transition-transform dark:hidden" />
        <OpenAIDark className="hidden h-7 w-7 transition-transform dark:block" />
      </div>
      <span className="text-center font-medium text-neutral-600 text-xs group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        OpenAI
      </span>
    </motion.div>
    <motion.div className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-100/80 to-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300 dark:border-neutral-700/50 dark:from-neutral-800/80 dark:to-neutral-800 dark:hover:border-neutral-600">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <Anthropic className="h-7 w-7 transition-transform dark:hidden" />
        <AnthropicDark className="hidden h-7 w-7 transition-transform dark:block" />
      </div>
      <span className="text-center font-medium text-neutral-600 text-xs group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        Anthropic
      </span>
    </motion.div>
    <motion.div className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-100/80 to-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300 dark:border-neutral-700/50 dark:from-neutral-800/80 dark:to-neutral-800 dark:hover:border-neutral-600">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <Google className="h-7 w-7 transition-transform" />
      </div>
      <span className="text-center font-medium text-neutral-600 text-xs group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        Google
      </span>
    </motion.div>
    <motion.div className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-100/80 to-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300 dark:border-neutral-700/50 dark:from-neutral-800/80 dark:to-neutral-800 dark:hover:border-neutral-600">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <MistralAI className="h-7 w-7 transition-transform" />
      </div>
      <span className="text-center font-medium text-neutral-600 text-xs group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        Mistral
      </span>
    </motion.div>
    <motion.div className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-100/80 to-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300 dark:border-neutral-700/50 dark:from-neutral-800/80 dark:to-neutral-800 dark:hover:border-neutral-600">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <DeepSeek className="h-7 w-7 transition-transform" />
      </div>
      <span className="text-center font-medium text-neutral-600 text-xs group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        DeepSeek
      </span>
    </motion.div>
    <motion.div className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-100/80 to-neutral-100 p-3 transition-all duration-300 hover:border-neutral-300 dark:border-neutral-700/50 dark:from-neutral-800/80 dark:to-neutral-800 dark:hover:border-neutral-600">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <Plus className="h-6 w-6 text-neutral-600 transition-transform dark:text-neutral-400" />
      </div>
      <span className="text-center font-medium text-neutral-600 text-xs group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        More
      </span>
    </motion.div>
  </div>
);

const TimelineFeature = ({
  timeline,
}: {
  timeline: Array<{ year: string; event: string }>;
}) => (
  <div className="relative mt-3">
    <div className="absolute top-0 bottom-0 left-[9px] w-[2px] bg-neutral-200 dark:bg-neutral-700" />
    {timeline.map((item) => (
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="relative mb-3 flex gap-3"
        initial={{ opacity: 0, x: -10 }}
        key={`timeline-${item.year}-${item.event
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
        transition={{
          delay: (0.15 * Number.parseInt(item.year)) % 10,
        }}
      >
        <div className="z-10 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800" />
        <div>
          <div className="font-medium text-neutral-900 text-sm dark:text-neutral-100">
            {item.year}
          </div>
          <div className="text-neutral-600 text-xs dark:text-neutral-400">
            {item.event}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const TypingCodeFeature = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);

          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        },
        Math.random() * 30 + 10
      ); // Random typing speed for realistic effect

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  // Reset animation when component unmounts and remounts
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mt-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-neutral-500 text-xs dark:text-neutral-400">
          server.ts
        </div>
      </div>
      <div
        className="h-[150px] overflow-y-auto rounded-md bg-neutral-900 p-3 font-mono text-neutral-100 text-xs dark:bg-black"
        ref={terminalRef}
      >
        <pre className="whitespace-pre-wrap">
          {displayedText}
          <span className="animate-pulse">|</span>
        </pre>
      </div>
    </div>
  );
};

const MetricsFeature = ({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
}) => {
  const getColorClass = (color = "emerald") => {
    const colors = {
      emerald: "bg-emerald-500 dark:bg-emerald-400",
      blue: "bg-blue-500 dark:bg-blue-400",
      violet: "bg-violet-500 dark:bg-violet-400",
      amber: "bg-amber-500 dark:bg-amber-400",
      rose: "bg-rose-500 dark:bg-rose-400",
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="mt-3 space-y-3">
      {metrics.map((metric, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
          initial={{ opacity: 0, y: 10 }}
          key={`metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
          transition={{ delay: 0.15 * index }}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
              {metric.label === "Uptime" && <Clock className="h-3.5 w-3.5" />}
              {metric.label === "Response time" && (
                <Zap className="h-3.5 w-3.5" />
              )}
              {metric.label === "Cost reduction" && (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {metric.label}
            </div>
            <div className="font-semibold text-neutral-700 dark:text-neutral-300">
              {metric.value}
              {metric.suffix}
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <motion.div
              animate={{
                width: `${Math.min(100, metric.value)}%`,
              }}
              className={`h-full rounded-full ${getColorClass(metric.color)}`}
              initial={{ width: 0 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.15 * index,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

function AIInput_Voice() {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, 3000);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo]);

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  return (
    <div className="w-full py-4">
      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-2">
        <button
          className={cn(
            "group flex h-16 w-16 items-center justify-center rounded-xl transition-colors",
            submitted
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          onClick={handleClick}
          type="button"
        >
          {submitted ? (
            <div
              className="pointer-events-auto h-6 w-6 animate-spin cursor-pointer rounded-sm bg-black dark:bg-white"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="h-6 w-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="flex h-4 w-64 items-center justify-center gap-0.5">
          {[...Array(48)].map((_, i) => (
            <div
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "animate-pulse bg-black/50 dark:bg-white/50"
                  : "h-1 bg-black/10 dark:bg-white/10"
              )}
              key={`voice-bar-${i}`}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-black/70 text-xs dark:text-white/70">
          {submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
}

const BentoCard = ({ item }: { item: BentoItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      className="h-full"
      onHoverEnd={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      variants={fadeInUp}
      whileHover={{ y: -5 }}
    >
      <Link
        aria-label={`${item.title} - ${item.description}`}
        className={`group relative flex h-full flex-col gap-4 rounded-xl border border-neutral-200/60 bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-[4px] transition-all duration-500 ease-out before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/10 before:via-white/20 before:to-transparent before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-0 after:z-[-1] after:rounded-xl after:bg-neutral-50/70 hover:border-neutral-300/50 hover:bg-gradient-to-b hover:from-neutral-50/60 hover:via-neutral-50/30 hover:to-neutral-50/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:backdrop-blur-[6px] dark:border-neutral-800/60 dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30 dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] dark:hover:border-neutral-700/50 dark:hover:from-neutral-800/60 dark:hover:via-neutral-800/30 dark:hover:to-neutral-800/20 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:after:bg-neutral-900/70 dark:before:from-black/10 dark:before:via-black/20 dark:before:to-transparent ${item.className}
                `}
        href={item.href || "#"}
        tabIndex={0}
      >
        <div
          className="relative z-10 flex h-full flex-col gap-3"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex flex-1 flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 text-xl tracking-tight transition-colors duration-300 group-hover:text-neutral-700 dark:text-neutral-100 dark:group-hover:text-neutral-300">
                {item.title}
              </h3>
              <div className="text-neutral-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-neutral-500">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <p className="text-neutral-600 text-sm tracking-tight dark:text-neutral-400">
              {item.description}
            </p>

            {/* Feature specific content */}
            {item.feature === "spotlight" && item.spotlightItems && (
              <SpotlightFeature items={item.spotlightItems} />
            )}

            {item.feature === "counter" && item.statistic && (
              <div className="mt-auto pt-3">
                <CounterAnimation
                  end={item.statistic.end || 100}
                  start={item.statistic.start || 0}
                  suffix={item.statistic.suffix}
                />
              </div>
            )}

            {item.feature === "chart" && item.statistic && (
              <div className="mt-auto pt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-neutral-700 text-sm dark:text-neutral-300">
                    {item.statistic.label}
                  </span>
                  <span className="font-medium text-neutral-700 text-sm dark:text-neutral-300">
                    {item.statistic.end}
                    {item.statistic.suffix}
                  </span>
                </div>
                <ChartAnimation value={item.statistic.end || 0} />
              </div>
            )}

            {item.feature === "timeline" && item.timeline && (
              <TimelineFeature timeline={item.timeline} />
            )}

            {item.feature === "icons" && <IconsFeature />}

            {item.feature === "typing" && item.typingText && (
              <TypingCodeFeature text={item.typingText} />
            )}

            {item.feature === "metrics" && item.metrics && (
              <MetricsFeature metrics={item.metrics} />
            )}

            {item.icons && !item.feature && (
              <div className="mt-auto flex flex-wrap items-center gap-4 border-neutral-200/70 border-t pt-4 dark:border-neutral-800/70">
                <OpenAI className="h-5 w-5 opacity-70 transition-opacity hover:opacity-100 dark:hidden" />
                <OpenAIDark className="hidden h-5 w-5 opacity-70 transition-opacity hover:opacity-100 dark:block" />
                <AnthropicDark className="hidden h-5 w-5 opacity-70 transition-opacity hover:opacity-100 dark:block" />
                <Anthropic className="h-5 w-5 opacity-70 transition-opacity hover:opacity-100 dark:hidden" />
                <Google className="h-5 w-5 opacity-70 transition-opacity hover:opacity-100" />
                <MistralAI className="h-5 w-5 opacity-70 transition-opacity hover:opacity-100" />
                <DeepSeek className="h-5 w-5 opacity-70 transition-opacity hover:opacity-100" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function BentoGrid() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Bento Grid */}
        <motion.div
          className="grid gap-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true }}
          whileInView="visible"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div className="md:col-span-2" variants={fadeInUp}>
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[2]} />
            </motion.div>
            <motion.div
              className="overflow-hidden rounded-xl border border-neutral-200/50 bg-gradient-to-b from-neutral-50/80 to-neutral-50 transition-all duration-300 hover:border-neutral-400/30 hover:shadow-lg hover:shadow-neutral-200/20 md:col-span-1 dark:border-neutral-800/50 dark:from-neutral-900/80 dark:to-neutral-900 dark:hover:border-neutral-600/30 dark:hover:shadow-neutral-900/20"
              variants={fadeInUp}
            >
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 text-xl tracking-tight dark:text-neutral-100">
                    Voice Assistant
                  </h3>
                </div>
                <p className="mb-4 text-neutral-600 text-sm tracking-tight dark:text-neutral-400">
                  Interact with our AI using natural voice commands. Experience
                  seamless voice-driven interactions with advanced speech
                  recognition.
                </p>
                <AIInput_Voice />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


// ---- /components/icons/anthropic.tsx ----
const Anthropic = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="#000"
    fillRule="evenodd"
    height="1em"
    style={{
      flex: "none",
      lineHeight: 1,
    }}
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>{"Anthropic"}</title>
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
  </svg>
);
export default Anthropic;


// ---- /components/icons/anthropic-dark.tsx ----
import type { SVGProps } from "react";

const AnthropicDark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="#ffff"
    fillRule="evenodd"
    height="1em"
    style={{
      flex: "none",
      lineHeight: 1,
    }}
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>{"Anthropic"}</title>
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
  </svg>
);
export default AnthropicDark;


// ---- /components/icons/gemini.tsx ----
const Gemini = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    style={{
      flex: "none",
      lineHeight: 1,
    }}
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>{"Gemini"}</title>
    <defs>
      <linearGradient
        id="lobe-icons-gemini-fill"
        x1="0%"
        x2="68.73%"
        y1="100%"
        y2="30.395%"
      >
        <stop offset="0%" stopColor="#1C7DFF" />
        <stop offset="52.021%" stopColor="#1C69FF" />
        <stop offset="100%" stopColor="#F0DCD6" />
      </linearGradient>
    </defs>
    <path
      d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
      fill="url(#lobe-icons-gemini-fill)"
      fillRule="nonzero"
    />
  </svg>
);
export default Gemini;


// ---- /components/icons/open-ai.tsx ----
const OpenAI = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 260"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>OpenAI</title>
    <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
  </svg>
);

export default OpenAI;


// ---- /components/icons/open-ai-dark.tsx ----
import type { SVGProps } from "react";

const OpenAIDark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 260"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>OpenAI</title>
    <path
      d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
      fill="#fff"
    />
  </svg>
);
export default OpenAIDark;


// ---- /components/icons/mistral.tsx ----
const MistralAI = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 233"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Mistral AI</title>
    <path d="M186.18182 0h46.54545v46.54545h-46.54545z" />
    <path d="M209.45454 0h46.54545v46.54545h-46.54545z" fill="#F7D046" />
    <path d="M0 0h46.54545v46.54545H0zM0 46.54545h46.54545V93.0909H0zM0 93.09091h46.54545v46.54545H0zM0 139.63636h46.54545v46.54545H0zM0 186.18182h46.54545v46.54545H0z" />
    <path d="M23.27273 0h46.54545v46.54545H23.27273z" fill="#F7D046" />
    <path
      d="M209.45454 46.54545h46.54545V93.0909h-46.54545zM23.27273 46.54545h46.54545V93.0909H23.27273z"
      fill="#F2A73B"
    />
    <path d="M139.63636 46.54545h46.54545V93.0909h-46.54545z" />
    <path
      d="M162.90909 46.54545h46.54545V93.0909h-46.54545zM69.81818 46.54545h46.54545V93.0909H69.81818z"
      fill="#F2A73B"
    />
    <path
      d="M116.36364 93.09091h46.54545v46.54545h-46.54545zM162.90909 93.09091h46.54545v46.54545h-46.54545zM69.81818 93.09091h46.54545v46.54545H69.81818z"
      fill="#EE792F"
    />
    <path d="M93.09091 139.63636h46.54545v46.54545H93.09091z" />
    <path
      d="M116.36364 139.63636h46.54545v46.54545h-46.54545z"
      fill="#EB5829"
    />
    <path
      d="M209.45454 93.09091h46.54545v46.54545h-46.54545zM23.27273 93.09091h46.54545v46.54545H23.27273z"
      fill="#EE792F"
    />
    <path d="M186.18182 139.63636h46.54545v46.54545h-46.54545z" />
    <path
      d="M209.45454 139.63636h46.54545v46.54545h-46.54545z"
      fill="#EB5829"
    />
    <path d="M186.18182 186.18182h46.54545v46.54545h-46.54545z" />
    <path d="M23.27273 139.63636h46.54545v46.54545H23.27273z" fill="#EB5829" />
    <path
      d="M209.45454 186.18182h46.54545v46.54545h-46.54545zM23.27273 186.18182h46.54545v46.54545H23.27273z"
      fill="#EA3326"
    />
  </svg>
);
export default MistralAI;


// ---- /components/icons/deepseek.tsx ----
const DeepSeek = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    style={{
      flex: "none",
      lineHeight: 1,
    }}
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>DeepSeek</title>
    <path
      d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"
      fill="#4D6BFE"
    />
  </svg>
);
export default DeepSeek;


