'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Settings, LogOut, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface TopNavProps {
  user?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  entitlement?: {
    plan: string
    status: string
  }
}

export function TopNav({ user, entitlement }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isPaid = entitlement?.plan !== 'free' && entitlement?.status === 'active'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <Link href="/app" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🧠</span>
          <span className="hidden sm:inline">Pattern League</span>
        </Link>

        <nav className="ml-6 hidden md:flex items-center gap-4 text-sm">
          <Link
            href="/app"
            className={pathname === '/app' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
          >
            Dashboard
          </Link>
          <Link
            href="/app/play"
            className={pathname.startsWith('/app/play') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
          >
            Daily Play
          </Link>
          <Link
            href="/app/run/weekly"
            className={pathname.startsWith('/app/run') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
          >
            Weekly Run
          </Link>
          <Link
            href="/app/leaderboards"
            className={pathname.startsWith('/app/leaderboards') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
          >
            Leaderboards
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isPaid && (
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                Upgrade
              </Button>
            </Link>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{user.display_name}</span>
                  {isPaid && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      League+
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/stats">
                    <span className="mr-2">📊</span>
                    Stats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
