"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExplorerNav } from "./ExplorerNav";

export function ExplorerHeader() {
  const pathname = usePathname();
  const title =
    pathname === "/explorer" ? "Discover" :
    pathname.startsWith("/explorer/saved") ? "Saved" :
    pathname.startsWith("/explorer/preferences") ? "Preferences" :
    "Explorer";

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="h-14 flex items-center justify-between">
        <div className="text-lg font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal" >
              <Button variant="outline" className="h-9 px-3 text-sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal" >
              <Button className="h-9 px-3 text-sm rounded-full bg-[#6c47ff] text-white">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <div className="pt-3">
        <ExplorerNav />
      </div>
    </div>
  );
}


