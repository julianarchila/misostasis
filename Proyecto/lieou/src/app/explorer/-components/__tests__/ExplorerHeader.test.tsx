/**
 * @vitest-environment jsdom
 */

import * as React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ExplorerHeader } from "../ExplorerHeader";
import * as nav from "next/navigation";
import * as clerk from "@clerk/nextjs";

vi.mock("next/navigation", () => {
  let pathname = "/explorer";
  return {
    usePathname: () => pathname,
    __setPathname: (p: string) => {
      pathname = p;
    },
  };
});

vi.mock("@clerk/nextjs", () => {
  let signedIn = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SignedIn = ({ children }: any) => (signedIn ? <>{children}</> : null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SignedOut = ({ children }: any) => (signedIn ? null : <>{children}</>);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SignInButton = ({ children }: any) => <span>{children ?? "Sign In"}</span>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SignUpButton = ({ children }: any) => <span>{children ?? "Sign Up"}</span>;
  const UserButton = () => <button data-testid="user">User</button>;
  return {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
    __setSignedIn: (v: boolean) => {
      signedIn = v;
    },
  };
});

vi.mock("../ExplorerNav", () => ({ ExplorerNav: () => <nav /> }));


function setPathname(p: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (nav as any).__setPathname(p);
}

function setSignedIn(v: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (clerk as any).__setSignedIn(v);
}

describe("ExplorerHeader", () => {
  beforeEach(() => {
    cleanup();
    
    setPathname("/explorer");
    setSignedIn(false);
  });

  afterEach(() => {
    cleanup();
  });

  it("handles nested saved paths and shows Saved for `/explorer/saved/*`", () => {
    setPathname("/explorer/saved/abc123");
    setSignedIn(true);

    render(<ExplorerHeader />);

    expect(screen.getByText("Saved")).toBeDefined();
    
    expect(screen.getByRole("navigation")).toBeDefined();
  });

  it("treats '/explorer/' (trailing slash) as Explorer (not Discover)", () => {
    setPathname("/explorer/");
    setSignedIn(false);

    render(<ExplorerHeader />);

    expect(screen.queryByText("Discover")).toBeNull();
    expect(screen.getByText("Explorer")).toBeDefined();
  });

  it("updates title when pathname changes without remount (rerender)", () => {
    
    setPathname("/explorer/saved/abc123");
    const { rerender } = render(<ExplorerHeader />);
    expect(screen.getByText("Saved")).toBeDefined();

    
    setPathname("/explorer/preferences/account");
    rerender(<ExplorerHeader />);
    expect(screen.getByText("Preferences")).toBeDefined();
    expect(screen.queryByText("Saved")).toBeNull();
  });
});
