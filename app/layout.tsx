import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ソフトボール大会管理システム",
  description: "研究室対抗ソフトボール大会の運営を効率化する管理システム",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚾</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
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
