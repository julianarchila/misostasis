import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ExplorerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session.isAuthenticated) {
    redirect('/sign-in')
  }
  if (session.sessionClaims?.metadata.onboardingComplete !== true) {
    redirect('/onboarding')
  }
  if (session.sessionClaims?.metadata.role !== 'explorer') {
    redirect('/business')
  }
  return <>{children}</>
}


