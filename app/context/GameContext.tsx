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
import { SHOP_ITEMS, type EquipmentSlot } from "@/lib/shopItems";

const XP_PER_LEVEL = 100;
const HP_PER_LEVEL = 20;
const DEFAULT_GOLD_REWARD = 5;
const MAX_ACTIVE_QUESTS = 5;

export type AdventureTheme = "fantasy";

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

export type EquippedGear = Record<EquipmentSlot, string>;

interface GameContextType {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  player: PlayerStats;
  loading: boolean;
  theme: AdventureTheme;
  ownedItems: string[];
  equipped: EquippedGear;
  toggleQuest: (questId: number) => Promise<void>;
  addQuest: (
    title: string,
    xpReward?: number,
    goldReward?: number
  ) => Promise<void>;
  loadPlayer: () => Promise<void>;
  updateTheme: (theme: AdventureTheme) => Promise<void>;
  buyItem: (itemId: string) => Promise<{ ok: boolean; message: string }>;
  equipItem: (itemId: string) => void;
}

const defaultPlayer: PlayerStats = {
  playerName: "Adventurer",
  level: 1,
  hp: 100,
  maxHp: 100,
  xp: 0,
  gold: 0,
};

const defaultEquipped: EquippedGear = {
  weapon: "Wooden Sword",
  shield: "Leather Armor",
  accessory: "Lucky Ring",
  boots: "Traveler Boots",
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [player, setPlayer] = useState<PlayerStats>(defaultPlayer);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<AdventureTheme>("fantasy");
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<EquippedGear>(defaultEquipped);

  // Separate active quests from completed quest history.
  const activeQuests = quests.filter((quest) => !quest.completed);
  const completedQuests = quests.filter((quest) => quest.completed);

  // Restore purchased inventory and equipped gear from localStorage.
  useEffect(() => {
    try {
      const savedOwned = localStorage.getItem("rpg_habit_owned_items");
      const savedEquipped = localStorage.getItem("rpg_habit_equipped");
      if (savedOwned) setOwnedItems(JSON.parse(savedOwned));
      if (savedEquipped) setEquipped(JSON.parse(savedEquipped));
    } catch (error) {
      console.error("Failed to load local inventory:", error);
    }
  }, []);

  // Load the logged-in player's data.
  const loadPlayer = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = session?.user;

      if (!user) {
        setPlayer(defaultPlayer);
        setQuests([]);
        setTheme("fantasy");
        return;
      }

      const [
        { data: profile, error: profileError },
        { data: stats, error: statsError },
        { data: tasks, error: tasksError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, theme")
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
      const currentHp = Math.max(0, Math.min(stats.hp ?? 100, maxHp));

      setPlayer({
        playerName:
          profile?.username || user.email?.split("@")[0] || "Adventurer",
        level,
        hp: currentHp,
        maxHp,
        xp: stats.xp ?? 0,
        gold: stats.gold ?? 0,
      });

      setTheme(profile?.theme === "fantasy" ? "fantasy" : "fantasy");

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

  // Reload data when authentication state changes.
  useEffect(() => {
    let active = true;

    const refreshPlayer = () => {
      if (active) {
        void loadPlayer();
      }
    };

    refreshPlayer();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      Promise.resolve().then(() => {
        if (active) {
          void loadPlayer();
        }
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadPlayer]);

  // Update and save the player's adventure theme.
  const updateTheme = async (newTheme: AdventureTheme) => {
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) throw authError;

    if (!session?.user) {
      throw new Error("Please log in first.");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ theme: newTheme })
      .eq("id", session.user.id);

    if (error) {
      console.error("Failed to update theme:", error);
      throw error;
    }

    setTheme(newTheme);
  };

  // Complete a quest and award its rewards.
  const toggleQuest = async (questId: number) => {
    const quest = quests.find((item) => item.id === questId);

    if (!quest || quest.completed) return;

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      console.error(authError ?? "Please log in first.");
      return;
    }

    const user = session.user;

    let newXp = player.xp + quest.xpReward;
    const newGold = player.gold + quest.goldReward;
    let newLevel = player.level;
    let levelsGained = 0;

    while (newXp >= XP_PER_LEVEL) {
      newXp -= XP_PER_LEVEL;
      newLevel += 1;
      levelsGained += 1;
    }

    const newMaxHp = 100 + (newLevel - 1) * HP_PER_LEVEL;
    const newHp =
      levelsGained > 0 ? newMaxHp : Math.min(player.hp, newMaxHp);

    const { data: updatedQuest, error: questError } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", questId)
      .eq("user_id", user.id)
      .eq("completed", false)
      .select("id")
      .maybeSingle();

    if (questError) {
      console.error("Failed to update quest:", questError);
      return;
    }

    if (!updatedQuest) {
      await loadPlayer();
      return;
    }

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
      await loadPlayer();
      return;
    }

    setQuests((previous) =>
      previous.map((item) =>
        item.id === questId ? { ...item, completed: true } : item
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

  // Add a new quest, provided an active slot is available.
  const addQuest = async (
    title: string,
    requestedXpReward?: number,
    requestedGoldReward?: number
  ) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    if (activeQuests.length >= MAX_ACTIVE_QUESTS) {
      console.warn("You can only have 5 active quests.");
      return;
    }

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      console.error(authError ?? "Please log in first.");
      return;
    }

    const user = session.user;

    const { count, error: countError } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", false);

    if (countError) {
      console.error("Failed to check active quests:", countError);
      return;
    }

    if ((count ?? 0) >= MAX_ACTIVE_QUESTS) {
      await loadPlayer();
      console.warn("You can only have 5 active quests.");
      return;
    }

    const xpReward =
      requestedXpReward ?? Math.floor(Math.random() * 41) + 10;
    const goldReward = requestedGoldReward ?? DEFAULT_GOLD_REWARD;

    if (
      !Number.isInteger(xpReward) ||
      xpReward < 10 ||
      xpReward > 50 ||
      !Number.isInteger(goldReward) ||
      goldReward < 5 ||
      goldReward > 20
    ) {
      console.error("Invalid quest rewards.");
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: trimmedTitle,
        xp_reward: xpReward,
        gold_reward: goldReward,
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

  // Equip an owned item into its corresponding slot.
  const equipItem = (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    setEquipped((prev) => {
      const updated = { ...prev, [item.slot]: item.name };
      localStorage.setItem("rpg_habit_equipped", JSON.stringify(updated));
      return updated;
    });
  };

  // Purchase an item using Gold and update Supabase player_stats.
  const buyItem = async (
    itemId: string
  ): Promise<{ ok: boolean; message: string }> => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) {
      return { ok: false, message: "Item not found." };
    }

    if (ownedItems.includes(item.id)) {
      equipItem(item.id);
      return { ok: true, message: `Equipped ${item.name}!` };
    }

    if (player.gold < item.price) {
      return {
        ok: false,
        message: `Not enough Gold! Requires ${item.price} G, you currently have ${player.gold} G.`,
      };
    }

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return { ok: false, message: "Please log in first." };
    }

    const newGold = player.gold - item.price;

    const { error: statsError } = await supabase
      .from("player_stats")
      .update({ gold: newGold })
      .eq("user_id", session.user.id);

    if (statsError) {
      console.error("Failed to purchase item:", statsError);
      return { ok: false, message: "Purchase failed. Please try again later." };
    }

    setPlayer((prev) => ({ ...prev, gold: newGold }));

    const nextOwned = [...ownedItems, item.id];
    setOwnedItems(nextOwned);
    localStorage.setItem("rpg_habit_owned_items", JSON.stringify(nextOwned));

    // Automatically equip the item upon purchase.
    equipItem(item.id);

    return {
      ok: true,
      message: `Purchased and equipped ${item.name} for ${item.price} G!`,
    };
  };

  return (
    <GameContext.Provider
      value={{
        quests,
        activeQuests,
        completedQuests,
        player,
        loading,
        theme,
        ownedItems,
        equipped,
        toggleQuest,
        addQuest,
        loadPlayer,
        updateTheme,
        buyItem,
        equipItem,
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