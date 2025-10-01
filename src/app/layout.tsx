import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intent Chat',
  description: 'Chat → intent → unsigned transactions and actionable cards'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
