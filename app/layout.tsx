import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toast'
import { PostHogProvider } from '@/lib/analytics/posthog-client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pattern League - Visual Memory Skill Game',
  description: 'Challenge your visual memory skills with daily puzzles, compete in leagues, and climb the leaderboards. A competitive skill game for pattern recognition.',
  keywords: ['memory game', 'pattern recognition', 'skill game', 'daily challenge', 'leaderboards'],
  openGraph: {
    title: 'Pattern League - Visual Memory Skill Game',
    description: 'Challenge your visual memory skills with daily puzzles and compete in leagues.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PostHogProvider>
          {children}
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  )
}
