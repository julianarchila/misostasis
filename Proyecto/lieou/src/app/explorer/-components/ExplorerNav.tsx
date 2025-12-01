"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes, isRouteActive } from "@/lib/routes";

export function ExplorerNav() {
  const pathname = usePathname();
  const isDiscover = pathname === routes.explorer.feed;
  const isSaved = isRouteActive(pathname, routes.explorer.saved);
  const isPreferences = isRouteActive(pathname, routes.explorer.preferences);

  const linkBase =
    "text-sm py-2 text-center rounded-md transition-colors hover:bg-neutral-100";
  const active =
    "bg-neutral-100 font-medium";

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-3 gap-2">
        <Link
          href={routes.explorer.feed}
          className={cn(linkBase, isDiscover && active)}
        >
          Discover
        </Link>
        <Link
          href={routes.explorer.saved}
          className={cn(linkBase, isSaved && active)}
        >
          Saved
        </Link>
        <Link
          href={routes.explorer.preferences}
          className={cn(linkBase, isPreferences && active)}
        >
          Preferences
        </Link>
      </div>
    </div>
  );
}
