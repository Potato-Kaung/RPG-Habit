import {
  Heart,
  Shield,
  Sword,
  Gem,
  Footprints,
  Trophy,
  Flame,
  BookOpen,
  Sparkles,
  User,
} from "lucide-react";

import Image from "next/image";

export default function ProfilePage() {
  const player = {
    name: "Kaung",
    title: "Beginner Adventurer",
    level: 1,
    hp: 85,
    mana: 70,
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8 rounded-xl bg-slate-900 p-6 text-white shadow-lg">
          <h1 className="text-4xl font-bold">
            Character Profile
          </h1>

          <p className="mt-2 text-gray-300">
            Your RPG Character
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">

          {/* Character */}

          <div className="flex flex-col items-center">

            <div className="flex h-40 w-40 items-center justify-center rounded-xl border-4 border-slate-700 bg-slate-200">

              <Image
  src="/images/char_img.png"
  alt="Hero"
  width={180}
  height={180}
  className="pixelated"
/>

              

            </div>

            <h2 className="mt-5 text-3xl font-bold">
              {player.name}
            </h2>

            <p className="text-gray-500">
              {player.title}
            </p>

            <div className="mt-3 rounded-full bg-blue-600 px-5 py-2 font-bold text-white">
              Level {player.level}
            </div>

          </div>

          {/* HP */}

          <div className="mt-10">

            <div className="mb-2 flex justify-between">
              <div className="flex items-center gap-2">
                <Heart className="text-red-500" />
                HP
              </div>

              <span>{player.hp}/100</span>

            </div>

            <div className="h-5 rounded-full bg-gray-300">

              <div
                className="h-5 rounded-full bg-red-500 transition-all"
                style={{ width: `${player.hp}%` }}
              />

            </div>

          </div>

          {/* Mana */}

          <div className="mt-6">

            <div className="mb-2 flex justify-between">

              <div className="flex items-center gap-2">
                <Sparkles className="text-blue-500" />
                Mana
              </div>

              <span>{player.mana}/100</span>

            </div>

            <div className="h-5 rounded-full bg-gray-300">

              <div
                className="h-5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${player.mana}%` }}
              />

            </div>

          </div>

          {/* Equipment */}

          <div className="mt-10">

            <h2 className="mb-5 text-2xl font-bold">
              Equipment
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="flex items-center gap-3 rounded-lg bg-gray-100 p-4">
                <Sword />
                Wooden Sword
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-100 p-4">
                <Shield />
                Leather Armor
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-100 p-4">
                <Gem />
                Lucky Ring
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-100 p-4">
                <Footprints />
                Traveler Boots
              </div>

            </div>

          </div>

          {/* Achievements */}

          <div className="mt-10">

            <h2 className="mb-5 text-2xl font-bold">
              Achievements
            </h2>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-lg bg-yellow-100 p-5 text-center">
                <Trophy className="mx-auto mb-2 text-yellow-600" />
                <h3 className="font-bold">
                  First Quest
                </h3>
              </div>

              <div className="rounded-lg bg-orange-100 p-5 text-center">
                <Flame className="mx-auto mb-2 text-orange-600" />
                <h3 className="font-bold">
                  7-Day Streak
                </h3>
              </div>

              <div className="rounded-lg bg-blue-100 p-5 text-center">
                <BookOpen className="mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold">
                  Study Master
                </h3>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}