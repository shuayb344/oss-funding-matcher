import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="text-center">
        <p className="text-4xl font-bold text-zinc-800">404</p>
        <h2 className="mt-4 text-sm font-semibold text-zinc-200">Page not found</h2>
        <p className="mt-2 text-sm text-zinc-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
