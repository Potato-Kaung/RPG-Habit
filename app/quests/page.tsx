
"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useGame } from "../context/GameContext";

const MAX_ACTIVE_QUESTS = 5;

interface AIQuest {
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedMinutes: number;
  xpReward: number;
  goldReward: number;
  completionCondition: string;
}

interface APIResponse {
  quest?: AIQuest;
  error?: string;
}

export default function QuestsPage() {
  const {
    player,
    theme,
    activeQuests,
    completedQuests,
    toggleQuest,
    addQuest,
    loading,
  } = useGame();

  const [title, setTitle] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const [suggestion, setSuggestion] = useState<AIQuest | null>(null);
  const [generating, setGenerating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [aiError, setAiError] = useState("");

  const slotsRemaining = Math.max(
    0,
    MAX_ACTIVE_QUESTS - activeQuests.length
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (
      !title.trim() ||
      activeQuests.length >= MAX_ACTIVE_QUESTS
    ) {
      return;
    }

    await addQuest(title.trim());
    setTitle("");
  }

  async function generateAIQuest() {
    if (
      generating ||
      accepting ||
      activeQuests.length >= MAX_ACTIVE_QUESTS
    ) {
      return;
    }

    setGenerating(true);
    setAiError("");
    setSuggestion(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please log in first.");
      }

      // Send the most recent completed quests.
      const recentCompleted = completedQuests
        .slice(-20)
        .reverse()
        .map((quest) => ({
          title: quest.title,
          xpReward: quest.xpReward,
          goldReward: quest.goldReward,
        }));

      const currentActive = activeQuests.map((quest) => ({
        title: quest.title,
        xpReward: quest.xpReward,
        goldReward: quest.goldReward,
      }));

      const response = await fetch("/api/quests/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          playerLevel: player.level,
          theme,
          activeQuests: currentActive,
          completedQuests: recentCompleted,
          availableMinutes: 30,
        }),
      });

      const responseText = await response.text();

      let data: APIResponse;

      try {
        data = JSON.parse(responseText) as APIResponse;
      } catch {
        console.error("Invalid API response:", responseText);

        throw new Error(
          `The server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Quest generation failed (${response.status}).`
        );
      }

      if (!data.quest || !data.quest.title) {
        throw new Error("The AI did not return a valid quest.");
      }

      const quest = data.quest;

      // Basic response validation.
      if (
        !quest.description ||
        !quest.completionCondition ||
        !["Easy", "Medium", "Hard"].includes(quest.difficulty)
      ) {
        throw new Error(
          "The AI generated an incomplete quest. Please try again."
        );
      }

      if (
        currentActive.some(
          (q) =>
            q.title.toLowerCase().trim() ===
            quest.title.toLowerCase().trim()
        )
      ) {
        throw new Error(
          "The AI generated an existing active quest. Please try again."
        );
      }

      setSuggestion(quest);
    } catch (error) {
      console.error("AI quest generation error:", error);

      setAiError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function acceptAIQuest() {
    if (
      !suggestion ||
      accepting ||
      activeQuests.length >= MAX_ACTIVE_QUESTS
    ) {
      return;
    }

    setAccepting(true);
    setAiError("");

    try {
      await addQuest(
        suggestion.title,
        suggestion.xpReward,
        suggestion.goldReward
      );

      setSuggestion(null);
    } catch (error) {
      console.error("Failed to accept AI quest:", error);
      setAiError("Could not accept this quest. Please try again.");
    } finally {
      setAccepting(false);
    }
  }

  function rejectAIQuest() {
    if (accepting) return;

    setSuggestion(null);
    setAiError("");
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading your quests...
      </div>
    );
  }

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
          <span className="text-lg font-bold">
            Level {player.level}
          </span>
          <span className="text-gray-500">
            {player.xp}/100 XP
          </span>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-300">
          <div
            className="h-4 rounded-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, player.xp))}%`,
            }}
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

      {/* AI Quest Master */}
      <div className="overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white shadow-xl">

        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-3xl">
              🧙
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                AI Quest Master
              </h2>
              <p className="text-sm text-purple-200">
                Your personal adventure guide
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            Your Quest Master analyzes your completed adventures,
            current missions, and player level to suggest your next challenge.
          </p>
        </div>

        <div className="p-6">

          {!suggestion && (
            <button
              type="button"
              onClick={generateAIQuest}
              disabled={
                generating ||
                accepting ||
                slotsRemaining === 0
              }
              className="w-full rounded-lg bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {generating
                ? "✨ Consulting the Quest Master..."
                : "✨ Generate an AI Quest"}
            </button>
          )}

          {generating && (
            <div className="mt-4 animate-pulse rounded-lg bg-white/5 p-5 text-center text-purple-200">
              The wizard is analyzing your previous adventures...
            </div>
          )}

          {aiError && (
            <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {aiError}
            </div>
          )}

          {suggestion && (
            <div className="mt-2 rounded-xl border border-purple-300/30 bg-white/10 p-5">

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-200">
                  ✨ AI GENERATED QUEST
                </span>

                <span className="text-xs text-purple-200">
                  {suggestion.category}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white">
                {suggestion.title}
              </h3>

              <p className="mt-3 leading-6 text-slate-300">
                {suggestion.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-200">
                  {suggestion.difficulty}
                </span>

                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-200">
                  ⏱ {suggestion.estimatedMinutes} min
                </span>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-200">
                  +{suggestion.xpReward} XP
                </span>

                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-200">
                  +{suggestion.goldReward} Gold
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Completion Condition
                </p>

                <p className="mt-2 text-sm text-slate-200">
                  {suggestion.completionCondition}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={acceptAIQuest}
                  disabled={
                    accepting ||
                    activeQuests.length >= MAX_ACTIVE_QUESTS
                  }
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-500 disabled:opacity-50"
                >
                  {accepting ? "Accepting..." : "✓ Accept Quest"}
                </button>

                <button
                  type="button"
                  onClick={rejectAIQuest}
                  disabled={accepting}
                  className="flex-1 rounded-lg bg-red-600/80 px-4 py-3 font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          )}
        </div>
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
              showHistory
                ? "rotate-180 bg-amber-100 text-amber-600"
                : ""
            }`}
          >
            ▼
          </span>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
            showHistory
              ? "grid-rows-[1fr]"
              : "grid-rows-[0fr]"
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
                  {[...completedQuests].reverse().map((quest, index) => (
                    <li
                      key={quest.id}
                      style={{
                        transitionDelay: showHistory
                          ? `${index * 60}ms`
                          : "0ms",
                      }}
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
