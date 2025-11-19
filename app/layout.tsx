import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ソフトボール大会管理システム",
  description: "研究室対抗ソフトボール大会の運営を効率化する管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
