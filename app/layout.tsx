import type { Metadata, Viewport } from "next";
import { WINK_DEMO } from "@/lib/wink-mode";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/inter/cyrillic-400.css";
import "@fontsource/inter/cyrillic-500.css";
import "@fontsource/inter/cyrillic-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import WinkAnalytics2026 from "@/components/WinkAnalytics2026";
import WinkMotionRuntime from "@/components/WinkMotionRuntime";
import "./globals.css";
import "./wink-cleanup.css";
import "./wink-storefront.css";
import "./wink-editorial.css";
import "./wink-cinematic.css";
import "./wink-cinematic-audit.css";
import "./wink-motion-luxury.css";
import "./wink-motion-runtime.css";

export const metadata: Metadata = {
  robots: WINK_DEMO ? { index: false, follow: false } : undefined,
  title: "WINK — красивые поздравления и подарки в Кемерово",
  description:
    "Когда надо красиво поздравить: готовые подарочные композиции и подбор WINK без долгого выбора. Назовите повод, человека и бюджет — поможем выбрать решение и согласуем доставку по Кемерову.",
  openGraph: {
    title: "WINK — когда надо красиво поздравить",
    description: "Красивый результат без сложного выбора. Готовые решения и WINK MATCH в Кемерово.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F3",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <WinkAnalytics2026 />
        <WinkMotionRuntime />
        {children}
      </body>
    </html>
  );
}