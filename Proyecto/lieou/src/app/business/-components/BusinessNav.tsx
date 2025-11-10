"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BusinessNav() {
  const pathname = usePathname();
  const isList = pathname === "/business/places" || pathname.startsWith("/business/places/");
  const isNew = pathname === "/business/places/new";

  const linkBase =
    "text-sm py-2 text-center rounded-md transition-colors hover:bg-neutral-100";
  const active =
    "bg-neutral-100 font-medium";

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 gap-2">
        <Link
          href="/business/places"
          className={cn(linkBase, isList && active)}
        >
          Places
        </Link>
        <Link
          href="/business/places/new"
          className={cn(linkBase, isNew && active)}
        >
          New
        </Link>
      </div>
    </div>
  );
}


