"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes, isRouteActive } from "@/lib/routes";
import { Compass, Heart, Settings } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

export function ExplorerNav() {
  const pathname = usePathname();
  const isDiscover = pathname === routes.explorer.feed;
  const isSaved = isRouteActive(pathname, routes.explorer.saved);
  const isPreferences = isRouteActive(pathname, routes.explorer.preferences);

  const linkBase =
    "flex flex-1 flex-col items-center gap-1 py-3 transition-colors text-gray-500";
  const active = "text-[#fd5564]";

  return (
    <nav className="border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-md">
        <Link
          href={routes.explorer.feed}
          className={cn(linkBase, isDiscover && active)}
        >
          <Compass className="h-6 w-6" />
          <span className="text-xs font-medium">Discover</span>
        </Link>

        <Link
          href={routes.explorer.saved}
          className={cn(linkBase, isSaved && active)}
        >
          <Heart className="h-6 w-6" />
          <span className="text-xs font-medium">Saved</span>
        </Link>

        <Link
          href={routes.explorer.preferences}
          className={cn(linkBase, isPreferences && active)}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs font-medium">Preferences</span>
        </Link>

        <div className={linkBase}>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <span className="text-xs font-medium">Profile</span>
        </div>
      </div>
    </nav>
  );
}
