"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export default function LandingPage() {
  const { user } = useUser()
  const role = (user?.publicMetadata as any)?.role as "explorer" | "business" | undefined
  const dashboardHref = role === "business" ? "/business" : "/explorer"

  return (
    <main className="min-h-[100svh] bg-white">
      <Header />

      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm">
              <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">New</Badge>
              Discover places like never before
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Match with places you&apos;ll love.
            </h1>
            <p className="mt-3 text-neutral-600 md:text-lg">
              Lieou helps explorers find new experiences, and gives businesses a simple way
              to reach the right audience.
            </p>
            <SignedIn>
              <div className="mt-6">
                <Link href={dashboardHref}>
                  <Button className="h-10 px-5 rounded-full bg-[#6c47ff] text-white">
                    Open your dashboard
                  </Button>
                </Link>
              </div>
            </SignedIn>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="relative h-40 w-full rounded-md bg-neutral-100">
                    <Image
                      src="/globe.svg"
                      alt="Explore"
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Explore</div>
                  <div className="text-xs text-neutral-500">Swipe through nearby spots</div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="relative h-40 w-full rounded-md bg-neutral-100">
                    <Image
                      src="/window.svg"
                      alt="Showcase"
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Showcase</div>
                  <div className="text-xs text-neutral-500">Put your business in front of explorers</div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="relative h-40 w-full rounded-md bg-neutral-100">
                    <Image
                      src="/file.svg"
                      alt="Save"
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Save</div>
                  <div className="text-xs text-neutral-500">Keep your favorite places in one list</div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="relative h-40 w-full rounded-md bg-neutral-100">
                    <Image
                      src="/next.svg"
                      alt="Grow"
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Grow</div>
                  <div className="text-xs text-neutral-500">Reach more of the right people</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:pb-24">
        <h2 className="text-xl font-semibold md:text-2xl">How it works</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Step title="Create your profile" desc="Pick explorer or business in a quick onboarding." />
          <Step title="Match with places" desc="Swipe through curated options tailored to your taste." />
          <Step title="Save and share" desc="Keep favorites and share with friends or customers." />
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Header() {
  return (
    <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">Lieou</Link>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="h-9 px-3 text-sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="h-9 px-3 text-sm rounded-full bg-[#6c47ff] text-white">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  )
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-neutral-600">{desc}</div>
      </CardContent>
    </Card>
  )
}

function Footer() {
  return (
    <div className="border-t">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-xs text-neutral-500">
        <div>© {new Date().getFullYear()} Lieou</div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Get started</Link>
        </div>
      </div>
    </div>
  )
}
