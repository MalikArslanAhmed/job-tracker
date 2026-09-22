import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Personal job application tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-slate-50">
          <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-5">
              <h1 className="text-lg font-bold text-slate-900">
                Job Tracker
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                UK Job Applications
              </p>
            </div>

            <nav className="space-y-1 p-4">
              <Link
                href="/"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Dashboard
              </Link>

              <Link
                href="/applications"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Applications
              </Link>
              <Link
                href="/follow-ups"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Follow-ups
              </Link>
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}