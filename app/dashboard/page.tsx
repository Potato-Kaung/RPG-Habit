"use client";

import { Heart, Star, Coins, Trophy } from "lucide-react";
import { useGame } from "../context/GameContext";

export default function DashboardPage() {
  const { player, quests, toggleQuest } = useGame();
  const { playerName, level, hp, maxHp, xp, gold } = player;
  const hpPercent = Math.min(100, Math.round((hp / maxHp) * 100));
  const todaysQuest = quests.find((q) => !q.completed);

  return (
    <div>
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
            <Heart className="icon-spin inline-block h-5 w-5 cursor-pointer text-red-500" />
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {hp}/{maxHp}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">
            <Star className="icon-spin inline-block h-5 w-5 cursor-pointer text-yellow-500" />
          </p>
          <h2 className="mt-2 text-3xl font-bold">{xp}/100</h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">
            <Coins className="icon-spin inline-block h-5 w-5 cursor-pointer text-yellow-500" />
          </p>
          <h2 className="mt-2 text-3xl font-bold">{gold}</h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">
            <Trophy className="icon-spin inline-block h-5 w-5 cursor-pointer text-blue-500" />
          </p>
          <h2 className="mt-2 text-3xl font-bold">{level}</h2>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Character Status</h2>

        <div className="mb-6">
          <div className="mb-2 flex justify-between">
            <span>HP</span>
            <span>
              {hp}/{maxHp}
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-300">
            <div
              className="h-4 rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${hpPercent}%` }}
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
        <h2 className="mb-4 text-2xl font-bold">📜 Today's Quest</h2>

        {todaysQuest ? (
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">{todaysQuest.title}</h3>
            <p className="mt-2 text-gray-600">
              Reward: ⭐ +{todaysQuest.xpReward} XP | 🪙 +
              {todaysQuest.goldReward} Gold
            </p>
            <button
              onClick={() => toggleQuest(todaysQuest.id)}
              className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
            >
              Complete Quest
            </button>
          </div>
        ) : (
          <p className="text-gray-500">
            All quests complete! Head to the Quests page to add more.
          </p>
        )}
      </div>
    </div>
  );
}
