import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { logOutAction } from "@/app/(auth)/actions";
import { Nav } from "@/components/nav";
import { TimeZoneCookie } from "@/components/time-zone-cookie";
import { getUser } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prepped",
  description: "A meal-prep calorie tracker: log your prepped meals, hit your daily goal.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TimeZoneCookie />
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <Link href={user ? "/today" : "/"} className="text-lg font-bold tracking-tight">
              Prepped<span className="text-accent">.</span>
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
                <form action={logOutAction}>
                  <button type="submit" className="text-sm font-medium text-muted hover:text-foreground">
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link href="/login" className="text-muted hover:text-foreground">
                  Log in
                </Link>
                <Link href="/signup" className="rounded-lg bg-accent px-3 py-1.5 text-white hover:bg-accent-strong">
                  Sign up
                </Link>
              </div>
            )}
            {user && (
              <div className="w-full">
                <Nav />
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
