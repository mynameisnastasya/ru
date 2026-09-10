import type { Metadata, Viewport } from "next";
import { WINK_DEMO } from "@/lib/wink-mode";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/inter/cyrillic-400.css";
import "@fontsource/inter/cyrillic-500.css";
import "@fontsource/inter/cyrillic-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
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

export const metadata: Metadata = {
  robots: WINK_DEMO ? { index: false, follow: false } : undefined,
  title: "WINK — красивые поздравления без сложного выбора | Кемерово",
  description:
    "Скажите, кого поздравляем, повод и бюджет. WINK предложит до двух готовых решений, поможет персонализировать подарок и согласует доставку по Кемерову до оплаты.",
  openGraph: {
    title: "WINK — важный повод, красивый жест",
    description:
      "Два точных решения вместо бесконечного выбора. Персонализация и доставка по Кемерову.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
