import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session.isAuthenticated) {
    redirect('/sign-in')
  }
  if (session.sessionClaims?.metadata.onboardingComplete !== true) {
    redirect('/onboarding')
  }
  if (session.sessionClaims?.metadata.role !== 'business') {
    redirect('/explorer')
  }
  return <>{children}</>
}


