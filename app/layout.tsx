import type { Metadata, Viewport } from "next";
import { WINK_DEMO } from "@/lib/wink-mode";
import "@fontsource/cormorant-garamond/cyrillic-400.css";
import "@fontsource/cormorant-garamond/cyrillic-400-italic.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/inter/cyrillic-400.css";
import "@fontsource/inter/cyrillic-500.css";
import "@fontsource/inter/cyrillic-600.css";
import "@fontsource/inter/cyrillic-800.css";
import "@fontsource/inter/cyrillic-900.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-800.css";
import "@fontsource/inter/latin-900.css";
import WinkAnalytics2026 from "@/components/WinkAnalytics2026";
import "./globals.css";
import "./wink-cleanup.css";
import "./wink-storefront.css";
import "./wink-editorial.css";
import "./wink-cinematic.css";
import "./wink-cinematic-audit.css";
import "./wink-v2.css";
import "./wink-v2-audit.css";
import "./wink-v3.css";
import "./wink-v3-font.css";
import "./wink-v3-audit.css";
import "./wink-v4.css";
import "./wink-v4-audit.css";

export const metadata: Metadata = {
  robots: WINK_DEMO ? { index: false, follow: false } : undefined,
  title: "WINK — подарок без мук выбора | Кемерово",
  description:
    "Ответьте на четыре вопроса — WINK предложит до двух готовых подарочных решений, поможет персонализировать и согласует доставку по Кемерову.",
  openGraph: {
    title: "WINK — подарок без мук выбора",
    description:
      "Четыре ответа. До двух вариантов. Персонализация и доставка по Кемерову.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4f9a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <WinkAnalytics2026 />
        {children}
      </body>
    </html>
  );
}
