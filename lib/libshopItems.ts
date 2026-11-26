export type EquipmentSlot = "weapon" | "shield" | "accessory" | "boots";

export interface ShopItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  price: number;
  bonusText: string;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Weapons (Spears & Lances)
  {
    id: "iron-spear",
    name: "Iron Spear",
    slot: "weapon",
    price: 30,
    bonusText: "ATK +12 | Focus Boost",
    description: "A well-balanced iron spear forged to pierce through tough daily quests.",
  },
  {
    id: "dragon-lance",
    name: "Dragon Lance",
    slot: "weapon",
    price: 80,
    bonusText: "ATK +35 | Elite Hero's Mark",
    description: "A masterwork steel lance engraved with dragon scales, wielded only by wealthy adventurers.",
  },
  // Shields & Armor
  {
    id: "iron-buckler",
    name: "Iron Buckler",
    slot: "shield",
    price: 25,
    bonusText: "DEF +10 | Temptation Guard",
    description: "A sturdy round shield that helps deflect distractions and laziness.",
  },
  {
    id: "tower-shield",
    name: "Guardian Tower Shield",
    slot: "shield",
    price: 75,
    bonusText: "DEF +30 | Iron Will Defense",
    description: "A massive heavy shield forming an unbreakable wall of self-discipline.",
  },
  // Accessories & Boots
  {
    id: "silver-ring",
    name: "Scholar's Ring",
    slot: "accessory",
    price: 40,
    bonusText: "INT +15 | Study Efficiency",
    description: "A sapphire-set ring that sharpens your mind during coding and study sessions.",
  },
  {
    id: "wind-boots",
    name: "Windrunner Boots",
    slot: "boots",
    price: 35,
    bonusText: "SPD +15 | Rapid Action",
    description: "Lightweight leather boots built to help you start your daily habits without hesitation.",
  },
];