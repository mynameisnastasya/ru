import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav style={{ position: "sticky", top: 0, zIndex: 120, minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, padding: "8px 14px", borderBottom: "1px solid #ddd5cc", background: "rgba(244,240,234,.96)", backdropFilter: "blur(16px)", fontFamily: "Inter, Arial, sans-serif", fontSize: 11, letterSpacing: ".05em" }}>
        <Link href="/admin/dashboard" style={{ color: "#171615", textDecoration: "none" }}>Сводка</Link>
        <Link href="/admin" style={{ color: "#171615", textDecoration: "none" }}>Заказы</Link>
        <Link href="/admin/clients" style={{ color: "#171615", textDecoration: "none" }}>Клиенты</Link>
      </nav>
      {children}
    </>
  );
}
