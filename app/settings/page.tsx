
"use client";

import { useState } from "react";
import { Castle, Check, Sparkles, Shield } from "lucide-react";
import { useGame } from "../context/GameContext";

export default function SettingsPage() {
  const { theme, updateTheme } = useGame();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleThemeSelection() {
    setSaving(true);
    setMessage("");

    try {
      await updateTheme("fantasy");
      setMessage("Your adventure theme has been saved!");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-slate-900 p-6 text-white shadow-lg">
        <h1 className="text-4xl font-bold">⚙️ Settings</h1>
        <p className="mt-2 text-gray-300">
          Customize your QuestForge adventure.
        </p>
      </div>

      {/* Adventure Theme */}
      <section className="rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <Castle className="text-amber-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Adventure Theme
            </h2>
            <p className="text-sm text-gray-500">
              Choose the world of your adventure.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border-2 border-amber-400 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-800 p-6 text-white shadow-md">
          <div className="absolute right-4 top-4 text-5xl opacity-20">
            🏰
          </div>

          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="text-amber-300" />
              <span className="text-sm font-semibold uppercase tracking-widest text-amber-300">
                Your selected world
              </span>
            </div>

            <h3 className="text-3xl font-bold">
              Fantasy Kingdom
            </h3>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-300">
              Enter a medieval world of legendary heroes, ancient
              magic, powerful kingdoms, and mysterious adventures.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Knights", "Magic", "Guilds", "Ancient Quests"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200"
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            <button
              type="button"
              onClick={handleThemeSelection}
              disabled={saving || theme === "fantasy"}
              className="mt-6 flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Check size={18} />
              {saving
                ? "Saving..."
                : theme === "fantasy"
                  ? "Currently Selected"
                  : "Select Fantasy Kingdom"}
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-4 text-sm text-green-600" role="status">
            {message}
          </p>
        )}
      </section>

      {/* Future Settings */}
      <section className="rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-3 flex items-center gap-3">
          <Shield className="text-blue-600" size={26} />
          <h2 className="text-xl font-bold text-slate-900">
            More Settings
          </h2>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-slate-800">
              🎯 Quest Difficulty
            </p>
            <p className="text-sm text-gray-500">
              Personalized difficulty settings coming soon.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-slate-800">
              🤖 AI Quest Master
            </p>
            <p className="text-sm text-gray-500">
              AI preferences and personalized challenges coming soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
