import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdgeMap — Prediction Market Intelligence',
  description: 'Advanced prediction market analysis and edge detection powered by Claude AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#09090b] text-[#f4f4f5]">{children}</body>
    </html>
  );
}
