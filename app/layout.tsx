import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FXAdvance — Signal Analytics',
  description: 'Real-time trading signal analytics dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-zinc-100 antialiased">{children}</body>
    </html>
  )
}
