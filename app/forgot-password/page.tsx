
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    setMessage("");

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address.");
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/update-password`,
          }
        );

      if (error) throw error;

      setMessage(
        "Password reset email sent! Please check your inbox."
      );
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
      <h1 className="text-2xl font-bold">
        Forgot Password?
      </h1>

      <p className="text-gray-600">
        Enter your registered email address.
        We will send you a password reset link.
      </p>

      <input
        className="w-full rounded border p-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        type="button"
        onClick={handleReset}
        disabled={loading || !email.trim()}
        className="w-full rounded bg-blue-600 p-3 text-white disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Reset Email"}
      </button>

      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}

      <Link
        href="/login"
        className="block text-center text-sm text-blue-600 underline"
      >
        Back to Login
      </Link>
    </main>
  );
}
