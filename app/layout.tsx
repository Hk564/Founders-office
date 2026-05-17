import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "Harshitha K.L — Founder's Office",
  description:
    "Product builder who ships 0-1, builds AI agents, and solves problems end to end. Seeking Founder's Office at Gushwork.",
  metadataBase: new URL('https://foundersoffice.xyz'),
  openGraph: {
    title: "Harshitha K.L — Founder's Office",
    description:
      "Product builder who ships 0-1, builds AI agents, and solves problems end to end.",
    url: 'https://foundersoffice.xyz',
    siteName: 'foundersoffice.xyz',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#FAFAFA] text-[#09090B] antialiased">
        {children}
      </body>
    </html>
  )
}
