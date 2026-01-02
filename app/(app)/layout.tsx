import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth/requireUser'
import { AppShell } from '@/components/app/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getUserWithProfile()

  if (!userData) {
    redirect('/login')
  }

  return (
    <AppShell
      user={{
        id: userData.user.id,
        display_name: userData.profile?.display_name || userData.user.email?.split('@')[0] || 'Player',
        avatar_url: userData.profile?.avatar_url || null,
      }}
      entitlement={userData.entitlement || undefined}
    >
      {children}
    </AppShell>
  )
}
