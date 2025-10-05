import { useState } from "react";
import { Campaign, Combat, Combatant } from "@shared/schema";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Swords, 
  Plus, 
  FastForward, 
  Shield, 
  Zap, 
  Heart,
  MoreVertical,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface CombatTrackerProps {
  campaign: Campaign;
}

export function CombatTracker({ campaign }: CombatTrackerProps) {
  const {
    characters,
    startCombat,
    updateCombatant,
    nextTurn,
    nextRound,
    endCombat,
    getActiveCombat,
    rollDicePool,
    setDicePool,
    addLogEntry,
  } = useGameStore();

  const [isStartingCombat, setIsStartingCombat] = useState(false);
  const [newCombatant, setNewCombatant] = useState({
    name: "",
    initiative: 10,
    currentHealth: 10,
    maxHealth: 10,
    armor: 0,
    isPlayer: false,
  });

  const activeCombat = getActiveCombat();
  const campaignCharacters = characters.filter(c => campaign.party.includes(c.id));

  const handleStartCombat = () => {
    const combatants: Combatant[] = [];
    
    // Add player characters
    campaignCharacters.forEach(character => {
      combatants.push({
        id: crypto.randomUUID(),
        characterId: character.id,
        name: character.name,
        initiative: 10, // Will be rolled
        currentHealth: character.currentHealth,
        maxHealth: character.maxHealth,
        armor: 0, // Would come from equipped gear
        conditions: [...character.conditions],
        actionsUsed: { fast: false, slow: false },
        isPlayer: true,
      });
    });

    startCombat(campaign.id, combatants);
    setIsStartingCombat(false);
  };

  const handleAddCombatant = () => {
    if (!activeCombat || !newCombatant.name.trim()) return;

    const combatant: Combatant = {
      id: crypto.randomUUID(),
      name: newCombatant.name.trim(),
      initiative: newCombatant.initiative,
      currentHealth: newCombatant.currentHealth,
      maxHealth: newCombatant.maxHealth,
      armor: newCombatant.armor,
      conditions: [],
      actionsUsed: { fast: false, slow: false },
      isPlayer: newCombatant.isPlayer,
    };

    // Add to combat (would need to update the store method to handle this)
    // For now, we'll log it
    addLogEntry(campaign.id, {
      message: `${combatant.name} joined the combat`,
      type: "combat",
    });

    setNewCombatant({
      name: "",
      initiative: 10,
      currentHealth: 10,
      maxHealth: 10,
      armor: 0,
      isPlayer: false,
    });
  };

  const handleDamageCombatant = (combatantId: string, amount: number = 1) => {
    if (!activeCombat) return;
    
    const combatant = activeCombat.combatants.find(c => c.id === combatantId);
    if (!combatant) return;

    const newHealth = Math.max(0, combatant.currentHealth - amount);
    updateCombatant(activeCombat.id, combatantId, { currentHealth: newHealth });

    addLogEntry(campaign.id, {
      message: `${combatant.name} took ${amount} damage (${newHealth}/${combatant.maxHealth} HP)`,
      type: "combat",
    });
  };

  const handleQuickRoll = (combatant: Combatant, rollType: string) => {
    // Set up a basic dice pool for the roll
    setDicePool({ attribute: 3, skill: 2, gear: 1 });
    rollDicePool(`${rollType} - ${combatant.name}`, combatant.characterId);
  };

  const getCurrentTurnCombatant = () => {
    if (!activeCombat) return null;
    return activeCombat.combatants[activeCombat.currentTurn];
  };

  const getHealthPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getInitiativeBorderColor = (combatant: Combatant, currentTurn: number, index: number) => {
    if (index === currentTurn) return "border-l-success";
    return combatant.isPlayer ? "border-l-primary" : "border-l-destructive";
  };

  if (!activeCombat) {
    return (
      <div className="space-y-6" data-testid="combat-tracker">
        <Card>
          <CardContent className="p-8 text-center">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Combat</h3>
            <p className="text-muted-foreground mb-4">
              Start a combat encounter to track initiative and actions.
            </p>
            
            {campaignCharacters.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Add characters to your party first.
              </p>
            ) : (
              <Dialog open={isStartingCombat} onOpenChange={setIsStartingCombat}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" data-testid="button-start-combat">
                    <Swords className="mr-2 h-4 w-4" />
                    Start Combat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Combat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Combat will include all party members. Roll initiative for each combatant after starting.
                    </p>
                    
                    <div>
                      <Label className="text-sm font-medium">Party Members</Label>
                      <div className="mt-2 space-y-2">
                        {campaignCharacters.map(character => (
                          <div key={character.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>{character.name}</span>
                            <Badge variant="outline">
                              {character.currentHealth}/{character.maxHealth} HP
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleStartCombat}
                        className="flex-1"
                        data-testid="button-confirm-start-combat"
                      >
                        Start Combat
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsStartingCombat(false)}
                        data-testid="button-cancel-start-combat"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="combat-tracker-active">
      {/* Combat Header */}
      <Card className="gradient-secondary text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5" />
              Combat Tracker
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                Round: <span className="font-mono font-bold text-lg" data-testid="combat-round">
                  {activeCombat.round}
                </span>
              </span>
              <Button
                onClick={() => nextRound(activeCombat.id)}
                variant="secondary"
                size="sm"
                data-testid="button-next-round"
              >
                <FastForward className="mr-2 h-4 w-4" />
                Next Round
              </Button>
              <Button
                onClick={() => endCombat(activeCombat.id)}
                variant="destructive"
                size="sm"
                data-testid="button-end-combat"
              >
                End Combat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initiative Order */}
      <div className="space-y-4">
        {activeCombat.combatants.map((combatant, index) => {
          const isCurrentTurn = index === activeCombat.currentTurn;
          const healthPercentage = getHealthPercentage(combatant.currentHealth, combatant.maxHealth);
          
          return (
            <Card
              key={combatant.id}
              className={`initiative-card ${getInitiativeBorderColor(combatant, activeCombat.currentTurn, index)} border-l-4 ${
                isCurrentTurn ? 'ring-2 ring-success' : ''
              }`}
              data-testid={`combatant-${combatant.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-mono font-bold text-xl">
                      {combatant.initiative}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg" data-testid="combatant-name">
                        {combatant.name}
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        {combatant.isPlayer ? "Player Character" : "NPC"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentTurn && (
                      <Badge className="badge-success">Active Turn</Badge>
                    )}
                    <Button variant="ghost" size="sm" data-testid="button-combatant-menu">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Health</div>
                    <div className="font-mono text-sm">
                      <span data-testid="combatant-current-health">{combatant.currentHealth}</span>
                      {" / "}
                      <span data-testid="combatant-max-health">{combatant.maxHealth}</span>
                    </div>
                    <Progress value={healthPercentage} className="h-2 mt-1" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Armor</div>
                    <div className="font-mono text-sm" data-testid="combatant-armor">
                      {combatant.armor}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Actions</div>
                    <div className="flex gap-1">
                      <span 
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                          combatant.actionsUsed.fast ? 'bg-muted' : 'bg-success'
                        }`}
                        title="Fast Action"
                      >
                        <Zap className="h-3 w-3" />
                      </span>
                      <span 
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                          combatant.actionsUsed.slow ? 'bg-muted' : 'bg-success'
                        }`}
                        title="Slow Action"
                      >
                        <Shield className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <div className="flex flex-wrap gap-1">
                      {combatant.conditions.length > 0 ? (
                        combatant.conditions.map((condition, condIndex) => (
                          <Badge key={condIndex} variant="destructive" className="text-xs">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRoll(combatant, "Attack")}
                    className="flex-1"
                    data-testid="button-attack"
                  >
                    <Swords className="mr-2 h-3 w-3" />
                    Attack
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRoll(combatant, "Defense")}
                    className="flex-1"
                    data-testid="button-defend"
                  >
                    <Shield className="mr-2 h-3 w-3" />
                    Defend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRoll(combatant, "Move")}
                    className="flex-1"
                    data-testid="button-move"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" />
                    Move
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDamageCombatant(combatant.id)}
                    data-testid="button-damage-combatant"
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>

                {isCurrentTurn && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button
                      onClick={() => nextTurn(activeCombat.id)}
                      className="w-full btn-primary"
                      data-testid="button-next-turn"
                    >
                      <FastForward className="mr-2 h-4 w-4" />
                      End Turn
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add Combatant */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full"
                  data-testid="button-add-combatant"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Combatant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Combatant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newCombatant.name}
                      onChange={(e) => setNewCombatant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Combatant name..."
                      data-testid="input-combatant-name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Initiative</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={newCombatant.initiative}
                        onChange={(e) => setNewCombatant(prev => ({ 
                          ...prev, 
                          initiative: parseInt(e.target.value) || 1 
                        }))}
                        data-testid="input-combatant-initiative"
                      />
                    </div>
                    <div>
                      <Label>Health</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newCombatant.currentHealth}
                        onChange={(e) => setNewCombatant(prev => ({ 
                          ...prev, 
                          currentHealth: parseInt(e.target.value) || 1,
                          maxHealth: parseInt(e.target.value) || 1
                        }))}
                        data-testid="input-combatant-health"
                      />
                    </div>
                    <div>
                      <Label>Armor</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newCombatant.armor}
                        onChange={(e) => setNewCombatant(prev => ({ 
                          ...prev, 
                          armor: parseInt(e.target.value) || 0 
                        }))}
                        data-testid="input-combatant-armor"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddCombatant}
                      disabled={!newCombatant.name.trim()}
                      className="flex-1"
                      data-testid="button-submit-combatant"
                    >
                      Add to Combat
                    </Button>
                    <Button variant="outline" data-testid="button-cancel-combatant">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
