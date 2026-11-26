"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGame } from "../context/GameContext";

export default function Navbar() {
  const router = useRouter();
  const { player } = useGame();
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(!!session);
      setChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setLoggedIn(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <h1 className="text-2xl font-bold">⚔️ QuestForge</h1>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-yellow-400">
            Home
          </Link>

          {!checking && loggedIn && (
            <>
              <Link href="/dashboard" className="hover:text-yellow-400">
                Dashboard
              </Link>

              <Link href="/quests" className="hover:text-yellow-400">
                Quests
              </Link>

              <Link href="/shop" className="hover:text-yellow-400">
                Shop
              </Link>

              <Link href="/profile" className="hover:text-yellow-400">
                Profile
              </Link>

              <Link href="/settings" className="hover:text-yellow-400">
                Settings
              </Link>

              <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-sm font-bold text-yellow-400">
                <Coins className="h-4 w-4" />
                <span>{player.gold} G</span>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}

          {!checking && !loggedIn && (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}