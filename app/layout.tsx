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
  title: "WINK — когда надо красиво поздравить",
  description: "Современный бренд подарков и красивых поздравлений. Выберите повод и настроение — WINK соберёт красивое решение без сложного выбора.",
  openGraph: {
    title: "WINK — когда надо красиво поздравить",
    description: "Меньше выбора. Больше вкуса. Меньше хлопот. Больше эмоции.",
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
      <body>
        <style>{`a[href$="/search"],a[href$="/favorites"],a[href$="/account"]{display:none!important}`}</style>
        {children}
      </body>
    </html>
  );
}
