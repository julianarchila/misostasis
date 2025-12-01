"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes, isRouteActive } from "@/lib/routes";
import { Plus, Store } from "lucide-react";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function BusinessNav() {
  const pathname = usePathname();
  const isPlaces = isRouteActive(pathname, routes.business.places.list, true) || pathname === routes.business.root;
  const isNew = pathname === routes.business.places.new;

  const linkBase =
    "flex flex-1 flex-col items-center gap-1 py-3 transition-colors text-gray-500";
  const active = "text-[#fd5564]";


  return <nav className="border-t border-gray-200 bg-white shadow-lg">
    <div className="mx-auto flex max-w-md">

      <Link
        href={routes.business.places.list}
        className={cn(linkBase, isPlaces && active)}
      >
        <Store className="h-6 w-6" />
        <span className="text-xs font-medium">Places</span>
      </Link>

      <Link
        href={routes.business.places.new}
        className={cn(linkBase, isNew && active)}
      >
        <Plus className="h-6 w-6" />
        <span className="text-xs font-medium">New</span>
      </Link>

      <div
        className={linkBase}
      >
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
  </nav>
}
