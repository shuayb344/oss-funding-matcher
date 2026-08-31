"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, Shield, LayoutDashboard, Database, HelpCircle, LogIn, LogOut } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0d]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-none p-0.5 border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
            <img
              src="/logo-transparent.png"
              alt="FM Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            OSS FUNDING MATCHER
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 font-mono text-xs">
          <Link
            href="/about"
            className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase"
          >
            HOW IT WORKS
          </Link>
          <Link
            href="/funders"
            className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase"
          >
            FUNDERS
          </Link>
          {status === "authenticated" && (
            <Link
              href="/dashboard"
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase"
            >
              DASHBOARD
            </Link>
          )}

          {session?.user?.id === process.env.NEXT_PUBLIC_ADMIN_GITHUB_ID && (
            <Link
              href="/admin/funders"
              className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all font-mono text-[11px] uppercase tracking-wider font-semibold"
            >
              <Shield className="h-3.5 w-3.5" />
              ADMIN
            </Link>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 font-mono text-xs">
          <ThemeToggle />

          {status === "loading" ? (
            <div className="h-8 w-24 rounded-none bg-slate-200 dark:bg-white/5 animate-pulse" />
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-7 w-7 rounded-none border border-slate-300 dark:border-white/20 object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-none bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                  {session.user?.name?.[0] || "U"}
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white transition-all uppercase text-[11px]"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase font-semibold text-[11px]"
            >
              <LogIn className="h-3 w-3" />
              Sign in
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-none border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-zinc-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0d] px-4 py-4 space-y-3 font-mono text-xs transition-colors shadow-lg">
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 py-1"
          >
            <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            HOW IT WORKS
          </Link>
          <Link
            href="/funders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 py-1"
          >
            <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            FUNDERS DIRECTORY
          </Link>
          {status === "authenticated" && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 py-1"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              DASHBOARD
            </Link>
          )}

          {session?.user?.id === process.env.NEXT_PUBLIC_ADMIN_GITHUB_ID && (
            <Link
              href="/admin/funders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 py-1 font-bold"
            >
              <Shield className="h-4 w-4" />
              ADMIN CONTROL PANEL
            </Link>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            {status === "authenticated" ? (
              <button
                onClick={() => signOut()}
                className="w-full text-left py-1 text-red-500 font-bold uppercase"
              >
                SIGN OUT ({session.user?.name})
              </button>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="w-full text-left py-1 text-emerald-600 dark:text-emerald-400 font-bold uppercase"
              >
                SIGN IN WITH GITHUB
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
