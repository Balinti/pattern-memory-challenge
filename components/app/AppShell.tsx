'use client'

import { TopNav } from './TopNav'
import { SideNav } from './SideNav'

interface AppShellProps {
  children: React.ReactNode
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

export function AppShell({ children, user, entitlement }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav user={user} entitlement={entitlement} />
      <div className="flex">
        <SideNav />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
