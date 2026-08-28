import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24 bg-transparent min-h-[calc(100vh-3.5rem)]">
      <div className="text-center">
        <p className="font-mono text-6xl font-bold text-slate-200 dark:text-zinc-800 tracking-widest">[ 404 ]</p>
        <h2 className="mt-4 font-mono text-sm font-semibold uppercase tracking-widest text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="mt-2 text-xs font-sans text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
          The requested path does not exist on this server.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          RETURN TO HOMEPAGE
        </Link>
      </div>
    </div>
  );
}
