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
import "./wink-v3-font.css";
import "./wink-v3-audit.css";
import "./wink-v6.css";
import "./wink-v6-audit.css";

export const metadata: Metadata = {
  robots: WINK_DEMO ? { index: false, follow: false } : undefined,
  title: "WINK — подарок без мучительного выбора | Кемерово",
  description:
    "Скажите, кого поздравляете, повод и бюджет. WINK оставит максимум два точных решения, поможет с личной деталью и согласует доставку по Кемерову до оплаты.",
  openGraph: {
    title: "WINK — вы знаете человека. Мы знаем, как поздравить.",
    description:
      "Четыре ответа, максимум два решения, персонализация и доставка по Кемерову.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f1",
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
