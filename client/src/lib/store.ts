import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Campaign, Character, Item, DicePool, RollResult, LogEntry, Combat, StrongholdProject } from '@shared/schema';
import { rollDice, pushDice } from './dice';
import { saveToStorage, loadFromStorage } from './storage';

interface GameStore extends AppState {
  // Actions
  createCampaign: (name: string) => void;
  setActiveCampaign: (campaignId: string) => void;
  createCharacter: (campaignId: string, character: Omit<Character, 'id'>) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  setActiveCharacter: (characterId: string) => void;
  
  // Dice rolling
  setDicePool: (pool: Partial<DicePool>) => void;
  rollDicePool: (rollType?: string, characterId?: string) => void;
  pushLastRoll: () => void;
  clearLastRoll: () => void;
  
  // Items
  createItem: (item: Omit<Item, 'id'>) => void;
  assignItemToCharacter: (itemId: string, characterId: string) => void;
  assignItemToParty: (itemId: string, campaignId: string) => void;
  
  // Exploration
  addHex: (campaignId: string, hex: Omit<import('@shared/schema').Hex, 'id'>) => void;
  updateHex: (campaignId: string, hexId: string, updates: Partial<import('@shared/schema').Hex>) => void;
  setCurrentHex: (campaignId: string, hexId: string) => void;
  updatePartyResources: (campaignId: string, resources: Partial<import('@shared/schema').Campaign['partyResources']>) => void;
  
  // Combat
  startCombat: (campaignId: string, combatants: import('@shared/schema').Combatant[]) => void;
  updateCombatant: (combatId: string, combatantId: string, updates: Partial<import('@shared/schema').Combatant>) => void;
  nextTurn: (combatId: string) => void;
  nextRound: (combatId: string) => void;
  endCombat: (combatId: string) => void;
  
  // Stronghold
  addProject: (campaignId: string, project: Omit<StrongholdProject, 'id'>) => void;
  updateProject: (campaignId: string, projectId: string, updates: Partial<StrongholdProject>) => void;
  
  // Logging
  addLogEntry: (campaignId: string, entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLog: (campaignId: string) => void;
  
  // Persistence
  exportData: () => string;
  importData: (jsonData: string) => void;
  
  // Utilities
  getActiveCampaign: () => Campaign | undefined;
  getActiveCharacter: () => Character | undefined;
  getActiveCombat: () => Combat | undefined;
}

const generateId = () => crypto.randomUUID();

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      campaigns: [],
      characters: [],
      items: [],
      activeCampaignId: undefined,
      activeCharacterId: undefined,
      activeCombatId: undefined,
      dicePool: { attribute: 0, skill: 0, gear: 0 },
      lastRollResult: undefined,
      settings: {
        theme: 'dark',
        autoSave: true,
        showDiceAnimations: true,
      },

      createCampaign: (name: string) => {
        const id = generateId();
        const campaign: Campaign = {
          id,
          name,
          party: [],
          hexes: [],
          partyInventory: [],
          partyResources: { food: 0, water: 0, torches: 0, arrows: 0 },
          stronghold: [],
          combats: [],
          log: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
        
        set((state) => ({
          campaigns: [...state.campaigns, campaign],
          activeCampaignId: id,
        }));
        
        get().addLogEntry(id, {
          message: `Campaign "${name}" created`,
          type: 'system',
        });
      },

      setActiveCampaign: (campaignId: string) => {
        set({ activeCampaignId: campaignId });
      },

      createCharacter: (campaignId: string, characterData: Omit<Character, 'id'>) => {
        const id = generateId();
        const character: Character = {
          id,
          ...characterData,
        };
        
        set((state) => ({
          characters: [...state.characters, character],
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, party: [...c.party, id], lastModified: new Date().toISOString() }
              : c
          ),
          activeCharacterId: id,
        }));
        
        get().addLogEntry(campaignId, {
          message: `Character "${character.name}" joined the party`,
          type: 'system',
          characterId: id,
        });
      },

      updateCharacter: (characterId: string, updates: Partial<Character>) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === characterId ? { ...c, ...updates } : c
          ),
        }));
      },

      setActiveCharacter: (characterId: string) => {
        set({ activeCharacterId: characterId });
      },

      setDicePool: (pool: Partial<DicePool>) => {
        set((state) => ({
          dicePool: { ...state.dicePool, ...pool },
        }));
      },

      rollDicePool: (rollType = 'Custom Roll', characterId?: string) => {
        const { dicePool, activeCampaignId } = get();
        const result = rollDice(dicePool);
        
        set({
          lastRollResult: {
            ...result,
            timestamp: new Date().toISOString(),
            characterId,
            rollType,
          },
        });

        if (activeCampaignId) {
          const character = characterId ? get().characters.find(c => c.id === characterId) : null;
          const characterName = character ? character.name : 'Unknown';
          
          get().addLogEntry(activeCampaignId, {
            message: `${characterName} rolled ${result.successes} successes${result.banes > 0 ? ` and ${result.banes} banes` : ''} on ${rollType}`,
            type: 'roll',
            characterId,
          });
        }
      },

      pushLastRoll: () => {
        const { lastRollResult, activeCampaignId } = get();
        if (!lastRollResult || lastRollResult.pushed) return;

        const pushedResult = pushDice(lastRollResult);
        
        set({
          lastRollResult: {
            ...pushedResult,
            pushed: true,
          },
        });

        if (activeCampaignId && lastRollResult.characterId) {
          const character = get().characters.find(c => c.id === lastRollResult.characterId);
          const characterName = character ? character.name : 'Unknown';
          
          get().addLogEntry(activeCampaignId, {
            message: `${characterName} pushed the roll - ${pushedResult.banes - lastRollResult.banes} new banes taken`,
            type: 'roll',
            characterId: lastRollResult.characterId,
          });
        }
      },

      clearLastRoll: () => {
        set({ lastRollResult: undefined });
      },

      createItem: (itemData: Omit<Item, 'id'>) => {
        const item: Item = {
          id: generateId(),
          ...itemData,
        };
        
        set((state) => ({
          items: [...state.items, item],
        }));
      },

      assignItemToCharacter: (itemId: string, characterId: string) => {
        const item = get().items.find(i => i.id === itemId);
        if (!item) return;

        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === characterId
              ? { ...c, items: [...c.items, { ...item, id: generateId() }] }
              : c
          ),
        }));
      },

      assignItemToParty: (itemId: string, campaignId: string) => {
        const item = get().items.find(i => i.id === itemId);
        if (!item) return;

        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { 
                  ...c, 
                  partyInventory: [...c.partyInventory, { ...item, id: generateId() }],
                  lastModified: new Date().toISOString()
                }
              : c
          ),
        }));
      },

      addHex: (campaignId: string, hexData: Omit<import('@shared/schema').Hex, 'id'>) => {
        const hex: import('@shared/schema').Hex = {
          id: generateId(),
          ...hexData,
        };
        
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, hexes: [...c.hexes, hex], lastModified: new Date().toISOString() }
              : c
          ),
        }));
      },

      updateHex: (campaignId: string, hexId: string, updates: Partial<import('@shared/schema').Hex>) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { 
                  ...c, 
                  hexes: c.hexes.map((h) => h.id === hexId ? { ...h, ...updates } : h),
                  lastModified: new Date().toISOString()
                }
              : c
          ),
        }));
      },

      setCurrentHex: (campaignId: string, hexId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, currentHexId: hexId, lastModified: new Date().toISOString() }
              : c
          ),
        }));

        const hex = get().campaigns.find(c => c.id === campaignId)?.hexes.find(h => h.id === hexId);
        if (hex) {
          get().addLogEntry(campaignId, {
            message: `Party moved to ${hex.name}`,
            type: 'exploration',
          });
        }
      },

      updatePartyResources: (campaignId: string, resources: Partial<import('@shared/schema').Campaign['partyResources']>) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { 
                  ...c, 
                  partyResources: { ...c.partyResources, ...resources },
                  lastModified: new Date().toISOString()
                }
              : c
          ),
        }));
      },

      startCombat: (campaignId: string, combatants: import('@shared/schema').Combatant[]) => {
        const combatId = generateId();
        const combat: Combat = {
          id: combatId,
          campaignId,
          round: 1,
          currentTurn: 0,
          combatants: combatants.sort((a, b) => b.initiative - a.initiative),
          isActive: true,
        };
        
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, combats: [...c.combats, combat], lastModified: new Date().toISOString() }
              : c
          ),
          activeCombatId: combatId,
        }));
        
        get().addLogEntry(campaignId, {
          message: `Combat started with ${combatants.length} participants`,
          type: 'combat',
        });
      },

      updateCombatant: (combatId: string, combatantId: string, updates: Partial<import('@shared/schema').Combatant>) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => ({
            ...c,
            combats: c.combats.map((combat) =>
              combat.id === combatId
                ? {
                    ...combat,
                    combatants: combat.combatants.map((combatant) =>
                      combatant.id === combatantId ? { ...combatant, ...updates } : combatant
                    ),
                  }
                : combat
            ),
            lastModified: new Date().toISOString(),
          })),
        }));
      },

      nextTurn: (combatId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => ({
            ...c,
            combats: c.combats.map((combat) =>
              combat.id === combatId
                ? {
                    ...combat,
                    currentTurn: (combat.currentTurn + 1) % combat.combatants.length,
                  }
                : combat
            ),
            lastModified: new Date().toISOString(),
          })),
        }));
      },

      nextRound: (combatId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => ({
            ...c,
            combats: c.combats.map((combat) =>
              combat.id === combatId
                ? {
                    ...combat,
                    round: combat.round + 1,
                    currentTurn: 0,
                    combatants: combat.combatants.map(combatant => ({
                      ...combatant,
                      actionsUsed: { fast: false, slow: false }
                    }))
                  }
                : combat
            ),
            lastModified: new Date().toISOString(),
          })),
        }));

        const campaign = get().campaigns.find(c => c.combats.some(combat => combat.id === combatId));
        if (campaign) {
          const combat = campaign.combats.find(c => c.id === combatId);
          if (combat) {
            get().addLogEntry(campaign.id, {
              message: `Round ${combat.round} begins`,
              type: 'combat',
            });
          }
        }
      },

      endCombat: (combatId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => ({
            ...c,
            combats: c.combats.map((combat) =>
              combat.id === combatId ? { ...combat, isActive: false } : combat
            ),
            lastModified: new Date().toISOString(),
          })),
          activeCombatId: state.activeCombatId === combatId ? undefined : state.activeCombatId,
        }));

        const campaign = get().campaigns.find(c => c.combats.some(combat => combat.id === combatId));
        if (campaign) {
          get().addLogEntry(campaign.id, {
            message: 'Combat ended',
            type: 'combat',
          });
        }
      },

      addProject: (campaignId: string, projectData: Omit<StrongholdProject, 'id'>) => {
        const project: StrongholdProject = {
          id: generateId(),
          ...projectData,
        };
        
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, stronghold: [...c.stronghold, project], lastModified: new Date().toISOString() }
              : c
          ),
        }));
        
        get().addLogEntry(campaignId, {
          message: `Started stronghold project: ${project.name}`,
          type: 'system',
        });
      },

      updateProject: (campaignId: string, projectId: string, updates: Partial<StrongholdProject>) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { 
                  ...c, 
                  stronghold: c.stronghold.map((p) => p.id === projectId ? { ...p, ...updates } : p),
                  lastModified: new Date().toISOString()
                }
              : c
          ),
        }));
      },

      addLogEntry: (campaignId: string, entryData: Omit<LogEntry, 'id' | 'timestamp'>) => {
        const entry: LogEntry = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          ...entryData,
        };
        
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, log: [...c.log, entry].slice(-100), lastModified: new Date().toISOString() } // Keep last 100 entries
              : c
          ),
        }));
      },

      clearLog: (campaignId: string) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, log: [], lastModified: new Date().toISOString() }
              : c
          ),
        }));
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          campaigns: state.campaigns,
          characters: state.characters,
          items: state.items,
          settings: state.settings,
        }, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          set({
            campaigns: data.campaigns || [],
            characters: data.characters || [],
            items: data.items || [],
            settings: { ...get().settings, ...data.settings },
          });
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },

      getActiveCampaign: () => {
        const { campaigns, activeCampaignId } = get();
        return campaigns.find((c) => c.id === activeCampaignId);
      },

      getActiveCharacter: () => {
        const { characters, activeCharacterId } = get();
        return characters.find((c) => c.id === activeCharacterId);
      },

      getActiveCombat: () => {
        const { campaigns, activeCombatId } = get();
        for (const campaign of campaigns) {
          const combat = campaign.combats.find((c) => c.id === activeCombatId);
          if (combat) return combat;
        }
        return undefined;
      },
    }),
    {
      name: 'forbidden-lands-game-store',
    }
  )
);
