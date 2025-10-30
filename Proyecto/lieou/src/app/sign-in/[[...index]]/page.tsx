"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[100svh] bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <SignIn routing="path" />
      </div>
    </div>
  );
}


