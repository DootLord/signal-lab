import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Signal Lab — Research to practice',
  description: 'Evidence-first AI research. Practical experiments for TypeScript and Node.js developers.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
