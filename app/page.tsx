
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">RPG Habit System</h1>

      <p className="mt-2 text-center text-gray-600">
        Turn habits into quests. Earn XP. Don’t lose HP.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="rounded-lg border px-6 py-3 font-semibold hover:bg-gray-100"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
