
"use client";

import { useState } from "react";
import { useGame } from "../context/GameContext";

const MAX_ACTIVE_QUESTS = 5;

export default function QuestsPage() {
  const {
    player,
    activeQuests,
    completedQuests,
    toggleQuest,
    addQuest,
    loading,
  } = useGame();

  const [title, setTitle] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || activeQuests.length >= MAX_ACTIVE_QUESTS) {
      return;
    }

    await addQuest(title.trim());
    setTitle("");
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Loading your quests...</div>;
  }

  const slotsRemaining = MAX_ACTIVE_QUESTS - activeQuests.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-slate-900 p-6 text-white shadow-lg">
        <h1 className="text-4xl font-bold">📜 Quests</h1>
        <p className="mt-2 text-gray-300">
          Complete challenges, earn rewards, and continue your adventure.
        </p>
      </div>

      {/* Player XP */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-bold">Level {player.level}</span>
          <span className="text-gray-500">{player.xp}/100 XP</span>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-300">
          <div
            className="h-4 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${player.xp}%` }}
          />
        </div>
      </div>

      {/* Active Quest Count */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            ⚔️ Active Quests
          </h2>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
            {activeQuests.length}/{MAX_ACTIVE_QUESTS}
          </span>
        </div>

        <div className="mb-3 flex gap-2">
          {Array.from({ length: MAX_ACTIVE_QUESTS }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index < activeQuests.length
                  ? "bg-blue-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-500">
          {slotsRemaining > 0
            ? `${slotsRemaining} quest slot${slotsRemaining === 1 ? "" : "s"} available.`
            : "All quest slots are full. Complete a quest to make room!"}
        </p>
      </div>

      {/* Add Custom Quest */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Create a new quest..."
          disabled={slotsRemaining === 0}
          className="min-w-0 flex-1 rounded-lg border bg-white px-4 py-3 text-lg disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={!title.trim() || slotsRemaining === 0}
          className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add
        </button>
      </form>

      {/* Active Quest List */}
      <div className="rounded-xl bg-white p-4 shadow">
        {activeQuests.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-3xl">🗺️</p>
            <h3 className="mt-2 text-lg font-bold text-slate-800">
              No Active Quests
            </h3>
            <p className="mt-1 text-gray-500">
              Your next adventure is waiting!
            </p>
          </div>
        ) : (
          <ul>
            {activeQuests.map((quest) => (
              <li
                key={quest.id}
                className="flex items-center gap-3 border-b px-3 py-4 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => void toggleQuest(quest.id)}
                  aria-label={`Complete ${quest.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
                />

                <span className="min-w-0 flex-1 text-lg text-gray-900">
                  {quest.title}
                </span>

                <span className="shrink-0 text-sm font-semibold text-blue-600">
                  +{quest.xpReward} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      
{/* Quest History */}
<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
  <button
    type="button"
    onClick={() => setShowHistory(!showHistory)}
    aria-expanded={showHistory}
    className="group flex w-full items-center justify-between p-5 text-left transition-colors duration-300 hover:bg-slate-50"
  >
    <div>
      <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-amber-600">
        🏆 Quest History
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        {completedQuests.length} quests completed
      </p>
    </div>

    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 ${
        showHistory ? "rotate-180 bg-amber-100 text-amber-600" : ""
      }`}
    >
      ▼
    </span>
  </button>

  <div
    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
      showHistory ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
    }`}
  >
    <div className="min-h-0 overflow-hidden">
      <div
        className={`border-t border-slate-100 transition-all duration-500 ease-out ${
          showHistory
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0"
        }`}
      >
        {completedQuests.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No completed quests yet. Your achievements will appear here!
          </p>
        ) : (
          <ul>
            {completedQuests.map((quest, index) => (
              <li
                key={quest.id}
                style={{ transitionDelay: showHistory ? `${index * 60}ms` : "0ms" }}
                className={`flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 transition-all duration-300 ${
                  showHistory
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-3 opacity-0"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  ✓
                </span>

                <span className="min-w-0 flex-1 text-gray-400 line-through">
                  {quest.title}
                </span>

                <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
                  +{quest.xpReward} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
</div>
</div>
  );
}

  

