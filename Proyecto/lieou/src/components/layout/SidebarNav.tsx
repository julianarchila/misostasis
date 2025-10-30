"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

function isActive(viewParam: string | null, target: "discover" | "saved") {
  const current = viewParam ?? "discover";
  return current === target;
}

export function SidebarNav() {
  const search = useSearchParams();
  const pathname = usePathname();
  const view = search.get("view");

  return (
    <aside className="flex md:h-[100svh] md:w-60 md:flex-col md:justify-between border-b md:border-b-0 md:border-r bg-white">
      <div className="flex md:flex-col items-center md:items-stretch gap-2 p-2 md:p-4">
        <div className="hidden md:block text-lg font-semibold px-2 py-1">Places</div>
        <nav className="flex md:flex-col gap-2 w-full">
          <Link href={`${pathname}?view=discover`} className="w-full">
            <Button variant={isActive(view, "discover") ? "default" : "outline"} className="w-full justify-start">
              Discover
            </Button>
          </Link>
          <Link href={`${pathname}?view=saved`} className="w-full">
            <Button variant={isActive(view, "saved") ? "default" : "outline"} className="w-full justify-start">
              Saved
            </Button>
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-between gap-2 p-2 md:p-4 border-t md:border-t-0 md:mt-auto">
        <SignedOut>
          <div className="flex gap-2 w-full">
            <SignInButton mode="modal" signInUrl="/sign-in">
              <Button variant="outline" className="w-full">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal" signUpUrl="/sign-up">
              <Button className="w-full">Sign Up</Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="ml-auto">
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </aside>
  );
}


