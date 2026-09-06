import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/inter/cyrillic-400.css";
import "@fontsource/inter/cyrillic-500.css";
import "@fontsource/inter/cyrillic-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "WINK — gifts that make a moment",
  description: "Премиальные подарочные композиции: готовые WINK-сеты, персонализация, цифры, оформление комнаты и gift-first доставка.",
  openGraph: {
    title: "WINK — gifts that make a moment",
    description: "Подарок, который невозможно не сфотографировать.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F3EE",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
