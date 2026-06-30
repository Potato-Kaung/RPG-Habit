import Link from "next/link";
// Home page

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">RPG Habit System</h1>
      <p className="mt-2 text-gray-600">
        Turn habits into quests. Earn XP. Don’t lose HP.
      </p>

      <div className="mt-6 flex gap-3">
        <Link className="rounded-lg bg-black px-4 py-2 text-white" href="/dashboard">
          Dashboard
        </Link>
        <Link className="rounded-lg border px-4 py-2" href="/quests">
          Quests
        </Link>
      </div>
    </main>
  );
}
