
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

const XP_PER_LEVEL = 100;
const HP_PER_LEVEL = 20;
const GOLD_PER_LEVEL = 20;
const DEFAULT_GOLD_REWARD = 5;

export interface Quest {
  id: number;
  title: string;
  xpReward: number;
  goldReward: number;
  completed: boolean;
}

export interface PlayerStats {
  playerName: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  gold: number;
}

interface GameContextType {
  quests: Quest[];
  player: PlayerStats;
  loading: boolean;
  toggleQuest: (questId: number) => Promise<void>;
  addQuest: (title: string) => Promise<void>;
  loadPlayer: () => Promise<void>;
}

const defaultPlayer: PlayerStats = {
  playerName: "Adventurer",
  level: 1,
  hp: 100,
  maxHp: 100,
  xp: 0,
  gold: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [player, setPlayer] = useState<PlayerStats>(defaultPlayer);
  const [loading, setLoading] = useState(true);

  const loadPlayer = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setQuests([]);
        setPlayer(defaultPlayer);
        return;
      }

      const [
        { data: profile, error: profileError },
        { data: stats, error: statsError },
        { data: tasks, error: tasksError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("player_stats")
          .select("xp, hp, player_level, gold")
          .eq("user_id", user.id)
          .single(),

        supabase
          .from("tasks")
          .select("id, title, xp_reward, gold_reward, completed")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      if (profileError) throw profileError;
      if (statsError) throw statsError;
      if (tasksError) throw tasksError;

      const level = Math.max(1, stats.player_level ?? 1);
      const maxHp = 100 + (level - 1) * HP_PER_LEVEL;
      const currentHp = Math.max(
        0,
        Math.min(stats.hp ?? 100, maxHp)
      );

      setPlayer({
        playerName: profile?.username || user.email?.split("@")[0] || "Adventurer",
        level,
        hp: currentHp,
        maxHp,
        xp: stats.xp ?? 0,
        gold: stats.gold ?? 0,
      });

      setQuests(
        (tasks ?? []).map((task) => ({
          id: task.id,
          title: task.title,
          xpReward: task.xp_reward,
          goldReward: task.gold_reward,
          completed: task.completed,
        }))
      );
    } catch (error) {
      console.error("Failed to load player data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlayer();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadPlayer();
    });

    return () => subscription.unsubscribe();
  }, [loadPlayer]);

  const toggleQuest = async (questId: number) => {
    const quest = quests.find((item) => item.id === questId);

    if (!quest) return;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
      return;
    }

    if (!user) return;

    const completing = !quest.completed;

    let newXp = player.xp;
    let newGold = player.gold;
    let newLevel = player.level;
    let levelsGained = 0;

    if (completing) {
      newXp += quest.xpReward;
      newGold += quest.goldReward;

      while (newXp >= XP_PER_LEVEL) {
        newXp -= XP_PER_LEVEL;
        newLevel += 1;
        levelsGained += 1;
      }
    } else {
      newXp = Math.max(0, newXp - quest.xpReward);
      newGold = Math.max(0, newGold - quest.goldReward);
    }

    const newMaxHp = 100 + (newLevel - 1) * HP_PER_LEVEL;

    // IMPORTANT: Refill HP only when the player gains a level.
    const newHp =
      levelsGained > 0
        ? newMaxHp
        : Math.min(player.hp, newMaxHp);

    // Save the quest completion first.
    const { error: questError } = await supabase
      .from("tasks")
      .update({ completed: completing })
      .eq("id", questId)
      .eq("user_id", user.id);

    if (questError) {
      console.error("Failed to update quest:", questError);
      return;
    }

    // Save XP, HP, level, and gold to Supabase.
    const { error: statsError } = await supabase
      .from("player_stats")
      .update({
        xp: newXp,
        hp: newHp,
        player_level: newLevel,
        gold: newGold,
      })
      .eq("user_id", user.id);

    if (statsError) {
      console.error("Failed to update player stats:", statsError);

      // Reload to keep the screen consistent with the database.
      await loadPlayer();
      return;
    }

    // Update the screen only after the database saves successfully.
    setQuests((previous) =>
      previous.map((item) =>
        item.id === questId
          ? { ...item, completed: completing }
          : item
      )
    );

    setPlayer((previous) => ({
      ...previous,
      xp: newXp,
      gold: newGold,
      level: newLevel,
      hp: newHp,
      maxHp: newMaxHp,
    }));
  };

  const addQuest = async (title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
      return;
    }

    if (!user) return;

    const xpReward = Math.floor(Math.random() * 41) + 10;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: trimmedTitle,
        xp_reward: xpReward,
        gold_reward: DEFAULT_GOLD_REWARD,
        completed: false,
      })
      .select("id, title, xp_reward, gold_reward, completed")
      .single();

    if (error) {
      console.error("Failed to add quest:", error);
      return;
    }

    setQuests((previous) => [
      ...previous,
      {
        id: data.id,
        title: data.title,
        xpReward: data.xp_reward,
        goldReward: data.gold_reward,
        completed: data.completed,
      },
    ]);
  };

  return (
    <GameContext.Provider
      value={{
        quests,
        player,
        loading,
        toggleQuest,
        addQuest,
        loadPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}
