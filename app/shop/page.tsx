"use client";

import { useState } from "react";
import {
  Sword,
  Shield,
  Gem,
  Footprints,
  Coins,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import { useGame } from "../context/GameContext";
import { SHOP_ITEMS, type EquipmentSlot } from "@/lib/shopItems";

export default function ShopPage() {
  const { player, ownedItems, equipped, buyItem, equipItem } = useGame();
  const [selectedTab, setSelectedTab] = useState<"all" | EquipmentSlot>("all");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const filteredItems =
    selectedTab === "all"
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.slot === selectedTab);

  // Render category icon based on equipment slot.
  const renderIcon = (slot: EquipmentSlot) => {
    switch (slot) {
      case "weapon":
        return <Sword className="h-7 w-7 text-red-500" />;
      case "shield":
        return <Shield className="h-7 w-7 text-blue-500" />;
      case "accessory":
        return <Gem className="h-7 w-7 text-purple-500" />;
      case "boots":
        return <Footprints className="h-7 w-7 text-emerald-500" />;
    }
  };

  // Handle buying a new item or equipping an already owned one.
  const handleAction = async (itemId: string, isOwned: boolean) => {
    if (isOwned) {
      equipItem(itemId);
      const target = SHOP_ITEMS.find((i) => i.id === itemId);
      setFeedback({
        ok: true,
        message: `Equipped ${target?.name ?? "item"}!`,
      });
      return;
    }

    setBuyingId(itemId);
    const result = await buyItem(itemId);
    setFeedback(result);
    setBuyingId(null);
  };

  return (
    <AuthGuard>
      <div>
        {/* Shop Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl bg-slate-900 p-6 text-white shadow-lg md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold">🏪 Adventurer&apos;s Armory</h1>
            <p className="mt-2 text-gray-300">
              Spend the Gold earned from quests on spears, shields, and gear!
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-yellow-500/40 bg-slate-800 px-5 py-3">
            <Coins className="h-7 w-7 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Available Gold</p>
              <p className="text-2xl font-bold text-yellow-400">
                {player.gold} G
              </p>
            </div>
          </div>
        </div>

        {/* Purchase / Equip Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 rounded-xl border p-4 font-medium ${
              feedback.ok
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Gear" },
            { key: "weapon", label: "⚔️ Weapons & Spears" },
            { key: "shield", label: "🛡️ Shields" },
            { key: "accessory", label: "💍 Accessories" },
            { key: "boots", label: "👢 Boots" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setSelectedTab(tab.key as "all" | EquipmentSlot)
              }
              className={`rounded-lg px-4 py-2 font-semibold transition ${
                selectedTab === tab.key
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            const isEquipped = equipped[item.slot] === item.name;
            const canAfford = player.gold >= item.price;

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-xl border-2 bg-white p-6 shadow transition ${
                  isEquipped
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-slate-100 p-3">
                      {renderIcon(item.slot)}
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      {item.price} G
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {item.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-indigo-600">
                    <Sparkles className="h-4 w-4" />
                    {item.bonusText}
                  </p>

                  <p className="mt-3 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6">
                  {isEquipped ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-100 py-2.5 font-bold text-blue-700"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Equipped
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleAction(item.id, true)}
                      className="w-full rounded-lg bg-slate-800 py-2.5 font-bold text-white hover:bg-slate-700"
                    >
                      Equip Item
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford || buyingId === item.id}
                      onClick={() => handleAction(item.id, false)}
                      className={`w-full rounded-lg py-2.5 font-bold text-white transition ${
                        canAfford
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "cursor-not-allowed bg-gray-300 text-gray-500"
                      }`}
                    >
                      {buyingId === item.id
                        ? "Purchasing..."
                        : canAfford
                        ? `Buy (${item.price} G)`
                        : "Not Enough Gold"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthGuard>
  );
}