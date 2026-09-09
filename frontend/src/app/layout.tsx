import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kisisel Blog",
  description: "Kisisel blog sistemi"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body><header className="site-header"><Link className="brand" href="/">Kişisel Blog</Link><nav><Link href="/blog">Blog</Link><Link href="/about">Hakkımda</Link><Link href="/projects">Projeler</Link><Link href="/contact">İletişim</Link><Link href="/admin/login">Yönetim</Link></nav></header>{children}</body>
    </html>
  );
}
