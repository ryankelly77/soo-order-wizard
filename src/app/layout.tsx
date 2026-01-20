import type { Metadata } from 'next';
import { Montserrat, Bodoni_Moda } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'SOO Catering - Premium Corporate Catering',
  description:
    'Premium corporate catering for your team meetings, events, and celebrations. Sense of Occasion brings elegance to every gathering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${bodoniModa.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
