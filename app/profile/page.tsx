import {
  User,
  Heart,
  Coins,
  Flame,
  ScrollText,
  Sword,
  Brain,
  Zap,
  Target,
  Trophy,
  Pencil,
} from "lucide-react";

export default function ProfilePage() {
  const player = {
    name: "Kaung",
    title: "Beginner Adventurer",
    level: 1,
    hp: 85,
    xp: 40,
    gold: 250,
    streak: 5,
    quests: 12,
    strength: 8,
    intelligence: 12,
    agility: 6,
    discipline: 10,
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 rounded-xl bg-slate-900 p-6 text-white shadow-lg">
          <h1 className="text-4xl font-bold">👤 Character Profile</h1>
          <p className="mt-2 text-gray-300">
            View your hero's current status.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl bg-white p-8 shadow-lg">

          <div className="flex flex-col items-center">

            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg">
              <User size={60} />
            </div>

            <h2 className="mt-4 text-3xl font-bold">
              {player.name}
            </h2>

            <p className="text-lg text-gray-500">
              {player.title}
            </p>

            <div className="mt-3 rounded-full bg-blue-100 px-5 py-2 text-blue-700 font-semibold">
              Level {player.level}
            </div>

          </div>

          {/* Basic Stats */}

          <div className="mt-10 grid gap-6 md:grid-cols-4">

            <div className="rounded-xl border p-5 text-center shadow hover:shadow-lg transition">
              <Heart className="mx-auto mb-2 text-red-500" />
              <p className="text-gray-500">HP</p>
              <h3 className="text-2xl font-bold">{player.hp}/100</h3>
            </div>

            <div className="rounded-xl border p-5 text-center shadow hover:shadow-lg transition">
              <Coins className="mx-auto mb-2 text-yellow-500" />
              <p className="text-gray-500">Gold</p>
              <h3 className="text-2xl font-bold">{player.gold}</h3>
            </div>

            <div className="rounded-xl border p-5 text-center shadow hover:shadow-lg transition">
              <Flame className="mx-auto mb-2 text-orange-500" />
              <p className="text-gray-500">Streak</p>
              <h3 className="text-2xl font-bold">
                {player.streak} Days
              </h3>
            </div>

            <div className="rounded-xl border p-5 text-center shadow hover:shadow-lg transition">
              <ScrollText className="mx-auto mb-2 text-blue-500" />
              <p className="text-gray-500">Completed Quests</p>
              <h3 className="text-2xl font-bold">
                {player.quests}
              </h3>
            </div>

          </div>

          {/* Character Stats */}

          <div className="mt-10 rounded-xl border p-6">

            <h2 className="mb-6 text-2xl font-bold">
              Character Stats
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <Sword className="text-red-500" />
                  <span>Strength</span>
                </div>
                <span className="font-bold">{player.strength}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <Brain className="text-purple-500" />
                  <span>Intelligence</span>
                </div>
                <span className="font-bold">{player.intelligence}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <Zap className="text-yellow-500" />
                  <span>Agility</span>
                </div>
                <span className="font-bold">{player.agility}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <Target className="text-green-500" />
                  <span>Discipline</span>
                </div>
                <span className="font-bold">{player.discipline}</span>
              </div>

            </div>

          </div>

          {/* Achievements */}

          <div className="mt-10 rounded-xl border p-6">

            <h2 className="mb-6 text-2xl font-bold">
              Achievements
            </h2>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-lg bg-yellow-100 p-5 text-center">
                <Trophy className="mx-auto mb-2 text-yellow-600" />
                <h3 className="font-bold">First Quest</h3>
                <p className="text-sm text-gray-600">
                  Completed your first quest.
                </p>
              </div>

              <div className="rounded-lg bg-orange-100 p-5 text-center">
                <Flame className="mx-auto mb-2 text-orange-600" />
                <h3 className="font-bold">7-Day Streak</h3>
                <p className="text-sm text-gray-600">
                  Stayed consistent for one week.
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-5 text-center">
                <Brain className="mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold">Study Master</h3>
                <p className="text-sm text-gray-600">
                  Earned 500 XP from studying.
                </p>
              </div>

            </div>

          </div>

          {/* Button */}

          <div className="mt-10 flex justify-center">

            <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700">
              <Pencil size={18} />
              Edit Profile
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}