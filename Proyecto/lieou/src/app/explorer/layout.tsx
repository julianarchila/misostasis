import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ExplorerNav } from './-components/ExplorerNav'
import { routes } from '@/lib/routes'

export default async function ExplorerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session.isAuthenticated) {
    redirect(routes.signIn)
  }
  if (session.sessionClaims?.metadata.onboardingComplete !== true) {
    redirect(routes.onboarding)
  }
  if (session.sessionClaims?.metadata.role !== 'explorer') {
    redirect(routes.business.root)
  }
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <main className="flex-1 overflow-auto">{children}</main>

      <ExplorerNav />
    </div>
  )
}


