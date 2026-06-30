import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "QuestForge",
  description: "AI-Powered Gamified Habit Formation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        {/* Navigation Bar */}
        <nav className="bg-slate-900 text-white shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <h1 className="text-2xl font-bold">⚔️ QuestForge</h1>

            <div className="flex gap-6">
              <Link href="/" className="hover:text-yellow-400">
                Home
              </Link>

              <Link href="/dashboard" className="hover:text-yellow-400">
                Dashboard
              </Link>

              <Link href="/quests" className="hover:text-yellow-400">
                Quests
              </Link>

              <Link href="/profile" className="hover:text-yellow-400">
                Profile
              </Link>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl p-6">
          {children}
        </main>
      </body>
    </html>
  );
}