"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Quest = {
  id: string;
  title: string;
  xpReward: number;
  goldReward: number;
  completed: boolean;
};

type PlayerStats = {
  playerName: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  gold: number;
};

type GameContextType = {
  player: PlayerStats;
  quests: Quest[];
  toggleQuest: (id: string) => void;
  addQuest: (title: string) => void;
};

const XP_PER_LEVEL = 100;
const MIN_XP_REWARD = 10;
const MAX_XP_REWARD = 50;
const DEFAULT_GOLD_REWARD = 5;

// Random XP between 10 and 50 (inclusive) for every new quest
function randomXpReward() {
  return (
    Math.floor(Math.random() * (MAX_XP_REWARD - MIN_XP_REWARD + 1)) +
    MIN_XP_REWARD
  );
}

const initialQuests: Quest[] = [
  {
    id: "1",
    title: "Study Next.js for 30 minutes",
    xpReward: 20,
    goldReward: DEFAULT_GOLD_REWARD,
    completed: false,
  },
  {
    id: "2",
    title: "Go for a 20-minute walk",
    xpReward: 15,
    goldReward: DEFAULT_GOLD_REWARD,
    completed: false,
  },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerStats>({
    playerName: "Kaung",
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    gold: 0,
  });

  const [quests, setQuests] = useState<Quest[]>(initialQuests);

  function applyLevelUp(xp: number, level: number) {
    let newXp = xp;
    let newLevel = level;
    while (newXp >= XP_PER_LEVEL) {
      newXp -= XP_PER_LEVEL;
      newLevel += 1;
    }
    const levelsGained = newLevel - level;
    return { xp: newXp, level: newLevel, levelsGained };
  }

  // Click a quest to toggle it complete <-> incomplete, like a normal to-do list.
  // XP/gold are added when you check it off, and removed if you uncheck it.
  function toggleQuest(id: string) {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;

    const willBeCompleted = !quest.completed;

    setQuests((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, completed: willBeCompleted } : q
      )
    );

    const HP_PER_LEVEL = 20;
    const GOLD_PER_LEVEL = 20;

    setPlayer((prev) => {
      if (willBeCompleted) {
        const { xp, level, levelsGained } = applyLevelUp(
          prev.xp + quest.xpReward,
          prev.level
        );
        const newMaxHp = prev.maxHp + levelsGained * HP_PER_LEVEL;

        return {
          ...prev,
          xp,
          level,
          maxHp: newMaxHp,
          // leveling up heals you to the new max, same as most RPGs
          hp: levelsGained > 0 ? newMaxHp : prev.hp,
          gold: prev.gold + quest.goldReward + levelsGained * GOLD_PER_LEVEL,
        };
      } else {
        // Unchecking a quest just undoes its own XP/gold reward.
        // It intentionally does not undo a level-up, to avoid HP/gold
        // swinging back and forth confusingly if you misclick.
        return {
          ...prev,
          xp: Math.max(0, prev.xp - quest.xpReward),
          gold: Math.max(0, prev.gold - quest.goldReward),
        };
      }
    });
  }

  function addQuest(title: string) {
    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      xpReward: randomXpReward(),
      goldReward: DEFAULT_GOLD_REWARD,
      completed: false,
    };
    setQuests((prev) => [...prev, newQuest]);
  }

  return (
    <GameContext.Provider value={{ player, quests, toggleQuest, addQuest }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
}
