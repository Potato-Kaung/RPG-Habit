
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    setLoading(true);
    setMessage("");

    try {
      if (password.length < 6) {
        throw new Error(
          "Password must be at least 6 characters."
        );
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage("Password updated successfully!");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1500);
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
        Create New Password
      </h1>

      <p className="text-gray-600">
        Enter your new password below.
      </p>

      <input
        className="w-full rounded border p-3"
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="w-full rounded border p-3"
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="button"
        onClick={handleUpdatePassword}
        disabled={loading || !password || !confirmPassword}
        className="w-full rounded bg-blue-600 p-3 text-white disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
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
