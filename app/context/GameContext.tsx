"use client";

import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function QuestsPage() {
  const { player, quests, toggleQuest, addQuest } = useGame();
  const [title, setTitle] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addQuest(title.trim());
    setTitle("");
  }

  return (
    <div>
      <div className="mb-8 rounded-xl bg-slate-900 p-6 text-white shadow-lg">
        <h1 className="text-4xl font-bold">📜 Quests</h1>
        <p className="mt-2 text-gray-300">Add a task, click it when done.</p>
      </div>

      {/* Live Level / XP bar — updates the instant a quest is checked off */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-bold">Level {player.level}</span>
          <span className="text-gray-500">{player.xp}/100 XP</span>
        </div>
        <div className="h-4 w-full rounded-full bg-gray-300">
          <div
            className="h-4 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${player.xp}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Type a new quest..."
          className="flex-1 rounded-lg border px-4 py-3 text-lg"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-700"
        >
          Add
        </button>
      </form>

      <div className="rounded-xl bg-white p-4 shadow">
        {quests.length === 0 ? (
          <p className="p-4 text-gray-500">
            No quests yet. Add one above to get started.
          </p>
        ) : (
          <ul>
            {quests.map((quest) => (
              <li
                key={quest.id}
                onClick={() => toggleQuest(quest.id)}
                className="flex cursor-pointer items-center gap-3 border-b px-3 py-4 last:border-b-0 hover:bg-gray-50"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    quest.completed
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {quest.completed && "✓"}
                </span>

                <span
                  className={`flex-1 text-lg ${
                    quest.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {quest.title}
                </span>

                <span
                  className={`text-sm font-semibold ${
                    quest.completed ? "text-gray-300" : "text-blue-600"
                  }`}
                >
                  +{quest.xpReward} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
