'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Trophy, BarChart3, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/format'

const navItems = [
  { href: '/app', label: 'Dashboard', icon: Home },
  { href: '/app/play', label: 'Daily Play', icon: Play },
  { href: '/app/run/weekly', label: 'Weekly Run', icon: Trophy },
  { href: '/app/leaderboards', label: 'Leaderboards', icon: BarChart3 },
  { href: '/app/stats', label: 'Stats', icon: BarChart3 },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30 min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          In-game skill metrics only.
          <br />
          Not medical/cognitive measures.
        </p>
      </div>
    </aside>
  )
}
