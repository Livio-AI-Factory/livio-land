import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/session";
import { signout } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Livio Land — Powered Land & Data Center Capacity Marketplace",
  description:
    "Connect off-takers with powered land and data center capacity. List your site, search by MW and location, and ask the questions that matter — water, PPA, interconnection.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white font-bold">
                L
              </span>
              <span className="text-lg font-bold text-slate-900">Livio Land</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              <Link href="/listings/dc" className="hover:text-brand-600">
                DC Capacity
              </Link>
              <Link href="/listings/land" className="hover:text-brand-600">
                Powered Land
              </Link>
              {user ? (
                <>
                  {user.isAdmin && (
                    <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 border border-red-200">
                      Admin
                    </span>
                  )}
                  <Link href="/dashboard" className="hover:text-brand-600">
                    Dashboard
                  </Link>
                  <Link
                    href="/listings/new"
                    className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
                  >
                    + List a site
                  </Link>
                  <form action={signout}>
                    <button
                      type="submit"
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="hover:text-brand-600">
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} Livio Land</span>
            <span>Connecting off-takers with powered land & DC capacity</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
