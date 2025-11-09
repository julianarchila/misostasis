"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[100svh] bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <SignUp />
      </div>
    </div>
  );
}


