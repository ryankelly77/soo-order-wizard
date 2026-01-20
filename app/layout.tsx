import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sense of Occasion | Executive Catering',
  description: 'Premium executive catering for your most important meetings and events.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
