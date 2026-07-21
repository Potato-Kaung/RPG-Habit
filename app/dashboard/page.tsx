import { Heart, Star, Coins, Trophy } from "lucide-react";
export default function DashboardPage() {
  const playerName = "Kaung";
  const level = 1;
  const hp = 85;
  const xp = 40;
  const gold = 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 rounded-xl bg-slate-900 p-6 text-white shadow-lg">
          <h1 className="text-4xl font-bold">🏰 RPG Habit Dashboard</h1>
          <p className="mt-2 text-gray-300">
            Welcome back, <span className="font-semibold">{playerName}</span>!
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              <Heart className="inline-block h-5 w-5 text-red-500 cursor-pointer icon-spin" /></p>
            <h2 className="mt-2 text-3xl font-bold">{hp}/100</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              <Star className="inline-block h-5 w-5 text-yellow-500 cursor-pointer icon-spin" />
              </p>
            <h2 className="mt-2 text-3xl font-bold">{xp}/100</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
                <Coins className="inline-block h-5 w-5 text-yellow-500 cursor-pointer icon-spin" />
                </p>
            <h2 className="mt-2 text-3xl font-bold">{gold}</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
            <Trophy className="inline-block h-5 w-5 text-blue-500 cursor-pointer icon-spin" />
              </p>
            <h2 className="mt-2 text-3xl font-bold">{level}</h2>
          </div>

        </div>

        {/* Progress Bars */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">

          <h2 className="mb-4 text-2xl font-bold">
            Character Status
          </h2>

          <div className="mb-6">
            <div className="mb-2 flex justify-between">
              <span>HP</span>
              <span>{hp}%</span>
            </div>

            <div className="h-4 w-full rounded-full bg-gray-300">
              <div
                className="h-4 rounded-full bg-green-500"
                style={{ width: `${hp}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between">
              <span>XP</span>
              <span>{xp}%</span>
            </div>

            <div className="h-4 w-full rounded-full bg-gray-300">
              <div
                className="h-4 rounded-full bg-blue-500"
                style={{ width: `${xp}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Today's Quest */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            📜 Today's Quest
          </h2>

          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">
              Study Next.js for 30 Minutes
            </h3>

            <p className="mt-2 text-gray-600">
              Reward: ⭐ +20 XP | 🪙 +10 Gold
            </p>

            <button className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700">
              Complete Quest
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}