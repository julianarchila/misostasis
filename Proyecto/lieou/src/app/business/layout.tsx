import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { BusinessHeader } from './-components/BusinessHeader'

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
  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <BusinessHeader />
        <div className="pt-4">
          {children}
        </div>
      </div>
    </main>
  )
}


