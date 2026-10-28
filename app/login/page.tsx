
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(isSignup: boolean) {
    setLoading(true);
    setMessage("");

    try {
      if (!email.trim() || password.length < 6) {
        throw new Error(
          "Enter a valid email and a password of at least 6 characters."
        );
      }

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim() || "Player",
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setMessage(
            "Registration successful! Check your email to confirm your account, then sign in."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "No session was returned. Please try signing in again."
          );
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">QuestForge Login</h1>

      <p>Sign in to continue your adventure.</p>

      <input
        className="w-full rounded border p-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="w-full rounded border p-3"
        type="password"
        placeholder="Password (at least 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="button"
        className="w-full rounded bg-blue-600 p-3 text-white disabled:opacity-50"
        disabled={loading || !email.trim() || password.length < 6}
        onClick={() => handleAuth(false)}
      >
        {loading ? "Please wait..." : "Login"}
      </button>

      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}

      <p className="text-center text-sm">
        New player?{" "}
        <Link
          href="/signup"
          className="text-blue-600 underline"
        >
          Create an account
        </Link>
      </p>

      <Link
        href="/"
        className="block text-center text-sm text-gray-600 underline"
      >
        Back to Home
      </Link>
    </main>
  );
}
