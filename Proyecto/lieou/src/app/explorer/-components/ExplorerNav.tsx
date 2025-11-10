"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ExplorerNav() {
  const pathname = usePathname();
  const isDiscover = pathname === "/explorer";
  const isSaved = pathname.startsWith("/explorer/saved");
  const isPreferences = pathname.startsWith("/explorer/preferences");

  const linkBase =
    "text-sm py-2 text-center rounded-md transition-colors hover:bg-neutral-100";
  const active =
    "bg-neutral-100 font-medium";

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-3 gap-2">
        <Link
          href="/explorer"
          className={cn(linkBase, isDiscover && active)}
        >
          Discover
        </Link>
        <Link
          href="/explorer/saved"
          className={cn(linkBase, isSaved && active)}
        >
          Saved
        </Link>
        <Link
          href="/explorer/preferences"
          className={cn(linkBase, isPreferences && active)}
        >
          Preferences
        </Link>
      </div>
    </div>
  );
}


