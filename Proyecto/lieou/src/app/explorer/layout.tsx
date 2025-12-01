import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ExplorerHeader } from './-components/ExplorerHeader'
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
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-md px-4 pb-6">
        <ExplorerHeader />
        <div className="pt-4">
          {children}
        </div>
      </div>
    </main>
  )
}


