import { z } from "zod";

// Core types for dice mechanics
export const dicePoolSchema = z.object({
  attribute: z.number().min(0).max(6),
  skill: z.number().min(0).max(6),
  gear: z.number().min(0).max(6),
});

export const rollResultSchema = z.object({
  dice: z.array(z.number().min(1).max(6)),
  successes: z.number().min(0),
  banes: z.number().min(0),
  pushed: z.boolean().optional(),
  timestamp: z.string(),
  characterId: z.string().optional(),
  rollType: z.string().optional(),
});

// Item system
export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["weapon", "armor", "tool", "consumable"]),
  bonus: z.number().optional(),
  weight: z.number().optional(),
  notes: z.string().optional(),
  quantity: z.number().default(1),
});

// Character system
export const characterAttributesSchema = z.object({
  STR: z.number().min(1).max(6),
  AGI: z.number().min(1).max(6),
  WIT: z.number().min(1).max(6),
  EMP: z.number().min(1).max(6),
});

export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  kin: z.string().optional(),
  profession: z.string().optional(),
  attributes: characterAttributesSchema,
  attributeDamage: z.object({
    STR: z.number().min(0).default(0),
    AGI: z.number().min(0).default(0),
    WIT: z.number().min(0).default(0),
    EMP: z.number().min(0).default(0),
  }).optional(),
  skills: z.record(z.string(), z.number().min(0).max(6)),
  talents: z.array(z.string()),
  conditions: z.array(z.string()),
  items: z.array(itemSchema),
  currentHealth: z.number().min(0),
  maxHealth: z.number().min(1),
  xp: z.number().min(0),
  pride: z.string().optional(),
  darkSecret: z.string().optional(),
  notes: z.string().optional(),
});

// Exploration system
export const hexSchema = z.object({
  id: z.string(),
  name: z.string(),
  terrain: z.string(),
  notes: z.string().optional(),
  threat: z.number().min(0).max(6).optional(),
  explored: z.boolean().default(false),
});

// Combat system
export const combatantSchema = z.object({
  id: z.string(),
  characterId: z.string().optional(),
  name: z.string(),
  initiative: z.number(),
  currentHealth: z.number(),
  maxHealth: z.number(),
  armor: z.number().default(0),
  conditions: z.array(z.string()),
  actionsUsed: z.object({
    fast: z.boolean().default(false),
    slow: z.boolean().default(false),
  }),
  isPlayer: z.boolean().default(false),
});

export const combatSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  round: z.number().default(1),
  currentTurn: z.number().default(0),
  combatants: z.array(combatantSchema),
  isActive: z.boolean().default(false),
});

// Stronghold system
export const strongholdProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  daysTotal: z.number().min(1),
  daysLeft: z.number().min(0),
  upkeepPerWeek: z.number().optional(),
  effect: z.string().optional(),
  status: z.enum(["planned", "in-progress", "completed", "paused"]).default("planned"),
});

// Campaign system
export const logEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  message: z.string(),
  type: z.enum(["roll", "combat", "exploration", "general", "system"]).default("general"),
  characterId: z.string().optional(),
});

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  party: z.array(z.string()), // character ids
  hexes: z.array(hexSchema),
  currentHexId: z.string().optional(),
  weather: z.string().optional(),
  timeOfDay: z.enum(["dawn", "day", "dusk", "night"]).optional(),
  partyInventory: z.array(itemSchema),
  partyResources: z.object({
    food: z.number().default(0),
    water: z.number().default(0),
    torches: z.number().default(0),
    arrows: z.number().default(0),
  }),
  stronghold: z.array(strongholdProjectSchema),
  combats: z.array(combatSchema),
  log: z.array(logEntrySchema),
  createdAt: z.string(),
  lastModified: z.string(),
});

// App state
export const appStateSchema = z.object({
  campaigns: z.array(campaignSchema),
  characters: z.array(characterSchema),
  items: z.array(itemSchema), // item library
  activeCampaignId: z.string().optional(),
  activeCharacterId: z.string().optional(),
  activeCombatId: z.string().optional(),
  dicePool: dicePoolSchema,
  lastRollResult: rollResultSchema.optional(),
  settings: z.object({
    theme: z.enum(["light", "dark"]).default("dark"),
    autoSave: z.boolean().default(true),
    showDiceAnimations: z.boolean().default(true),
  }),
});

// Type exports
export type DicePool = z.infer<typeof dicePoolSchema>;
export type RollResult = z.infer<typeof rollResultSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Character = z.infer<typeof characterSchema>;
export type CharacterAttributes = z.infer<typeof characterAttributesSchema>;
export type Hex = z.infer<typeof hexSchema>;
export type Combatant = z.infer<typeof combatantSchema>;
export type Combat = z.infer<typeof combatSchema>;
export type StrongholdProject = z.infer<typeof strongholdProjectSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type AppState = z.infer<typeof appStateSchema>;

// Skill level costs (XP required to advance)
export const SKILL_COSTS = {
  1: 5,   // 0 -> 1
  2: 10,  // 1 -> 2
  3: 15,  // 2 -> 3
  4: 20,  // 3 -> 4
  5: 25,  // 4 -> 5
} as const;

// Default skill list
export const DEFAULT_SKILLS = [
  "Melee",
  "Ranged",
  "Endurance", 
  "Craft",
  "Move",
  "Stealth",
  "Insight",
  "Manipulation",
  "Performance",
  "Survival",
  "Medicine",
  "Animal Handling",
  "Lore",
  "Magic",
] as const;

// Terrain types
export const TERRAIN_TYPES = [
  "Plains",
  "Forest",
  "Mountains",
  "Swamp",
  "Desert",
  "Ruins",
  "Water",
  "Tundra",
] as const;

// Weather conditions
export const WEATHER_CONDITIONS = [
  "Clear",
  "Overcast",
  "Rain",
  "Storm",
  "Fog",
  "Snow",
  "Blizzard",
] as const;
