
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setMessage("");

    try {
      if (!username.trim() || !email.trim() || password.length < 6) {
        throw new Error(
          "Please enter a username, valid email, and password of at least 6 characters."
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setMessage(
          "Account created! Please check your email to confirm your account, then log in."
        );
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
    <main className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-center">
        ⚔️ Create Your Account
      </h1>

      <p className="text-center text-gray-600">
        Start your QuestForge adventure!
      </p>

      <input
        className="w-full rounded border p-3"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="w-full rounded border p-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full rounded border p-3"
        type="password"
        placeholder="Password (at least 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full rounded bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      {message && (
        <p role="status" className="text-sm text-center">
          {message}
        </p>
      )}

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Login
        </Link>
      </p>
    </main>
  );
}
