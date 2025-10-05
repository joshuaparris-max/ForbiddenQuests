import { useState } from "react";
import { Character, SKILL_COSTS } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGameStore } from "@/lib/store";
import { Plus, Minus, Dice6, Heart, ArrowUp, X } from "lucide-react";

interface CharacterSheetProps {
  character: Character;
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  const { updateCharacter, setDicePool, rollDicePool } = useGameStore();
  const [newCondition, setNewCondition] = useState("");

  const updateAttribute = (attr: keyof Character["attributes"], delta: number) => {
    const current = character.attributes[attr];
    const newValue = Math.max(1, Math.min(6, current + delta));
    
    updateCharacter(character.id, {
      attributes: {
        ...character.attributes,
        [attr]: newValue,
      },
    });
  };

  const updateSkill = (skillName: string, delta: number) => {
    const current = character.skills[skillName] || 0;
    const newValue = Math.max(0, Math.min(6, current + delta));
    
    updateCharacter(character.id, {
      skills: {
        ...character.skills,
        [skillName]: newValue,
      },
    });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      updateCharacter(character.id, {
        conditions: [...character.conditions, newCondition.trim()],
      });
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    updateCharacter(character.id, {
      conditions: character.conditions.filter((_, i) => i !== index),
    });
  };

  const adjustHealth = (delta: number) => {
    const newHealth = Math.max(0, Math.min(character.maxHealth, character.currentHealth + delta));
    updateCharacter(character.id, {
      currentHealth: newHealth,
    });
  };

  const quickRoll = (skillName: string) => {
    const skillValue = character.skills[skillName] || 0;
    // Determine base attribute for skill (simplified mapping)
    const attributeMap: Record<string, keyof Character["attributes"]> = {
      "Melee": "STR",
      "Endurance": "STR",
      "Ranged": "AGI", 
      "Move": "AGI",
      "Stealth": "AGI",
      "Survival": "WIT",
      "Medicine": "WIT",
      "Lore": "WIT",
      "Insight": "EMP",
      "Manipulation": "EMP",
      "Performance": "EMP",
    };
    
    const baseAttr = attributeMap[skillName] || "STR";
    const attributeValue = character.attributes[baseAttr];
    
    setDicePool({
      attribute: attributeValue,
      skill: skillValue,
      gear: 0,
    });
    
    rollDicePool(`${skillName} Check`, character.id);
  };

  const levelUpCost = (currentLevel: number) => {
    return SKILL_COSTS[Math.min(currentLevel + 1, 5) as keyof typeof SKILL_COSTS] || 30;
  };

  const canAffordLevelUp = (currentLevel: number) => {
    return character.xp >= levelUpCost(currentLevel) && currentLevel < 5;
  };

  const levelUpSkill = (skillName: string) => {
    const currentLevel = character.skills[skillName] || 0;
    const cost = levelUpCost(currentLevel);
    
    if (canAffordLevelUp(currentLevel)) {
      updateCharacter(character.id, {
        skills: {
          ...character.skills,
          [skillName]: currentLevel + 1,
        },
        xp: character.xp - cost,
      });
    }
  };

  const healthPercentage = (character.currentHealth / character.maxHealth) * 100;

  return (
    <Card className="overflow-hidden" data-testid="character-sheet">
      {/* Character Header */}
      <CardHeader className="gradient-primary text-white">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-3xl font-serif font-bold mb-2">
              {character.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              {character.kin && <span>{character.kin}</span>}
              {character.kin && character.profession && <span>·</span>}
              {character.profession && <span>{character.profession}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Experience Points</div>
            <div className="text-3xl font-bold font-mono" data-testid="character-xp-display">
              {character.xp}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Character Details Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <div className="border-b border-border">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Stats & Skills</TabsTrigger>
            <TabsTrigger value="talents">Talents & Abilities</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stats" className="p-6 space-y-6">
          {/* Attributes Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Attributes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(character.attributes).map(([attr, value]) => (
                <div key={attr} className="bg-muted border border-border rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2 capitalize">
                    {attr === 'STR' ? 'Strength' : 
                     attr === 'AGI' ? 'Agility' : 
                     attr === 'WIT' ? 'Wits' : 'Empathy'}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAttribute(attr as keyof Character["attributes"], -1)}
                      data-testid={`button-decrease-${attr.toLowerCase()}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div 
                      className="stat-badge bg-primary text-white text-xl w-12 h-12"
                      data-testid={`attribute-${attr.toLowerCase()}`}
                    >
                      {value}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAttribute(attr as keyof Character["attributes"], 1)}
                      data-testid={`button-increase-${attr.toLowerCase()}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {character.attributeDamage && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-mono">{character.attributeDamage[attr as keyof Character["attributeDamage"]] || 0}</span> damage
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Dice6 className="h-5 w-5 text-primary" />
                Skills
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(character.skills).map(([skillName, value]) => (
                <div key={skillName} className="bg-muted border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{skillName}</div>
                      <div className="text-xs text-muted-foreground">
                        {canAffordLevelUp(value) && `Next: ${levelUpCost(value)} XP`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSkill(skillName, -1)}
                        data-testid={`button-decrease-skill-${skillName.toLowerCase().replace(' ', '-')}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div 
                        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-mono font-bold"
                        data-testid={`skill-${skillName.toLowerCase().replace(' ', '-')}`}
                      >
                        {value}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSkill(skillName, 1)}
                        data-testid={`button-increase-skill-${skillName.toLowerCase().replace(' ', '-')}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => quickRoll(skillName)}
                        title="Quick roll"
                        data-testid={`button-roll-${skillName.toLowerCase().replace(' ', '-')}`}
                      >
                        <Dice6 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {canAffordLevelUp(value) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => levelUpSkill(skillName)}
                      className="w-full mt-2"
                      data-testid={`button-levelup-${skillName.toLowerCase().replace(' ', '-')}`}
                    >
                      <ArrowUp className="h-3 w-3 mr-2" />
                      Level Up ({levelUpCost(value)} XP)
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Health & Conditions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Health & Status
            </h3>
            
            <div className="space-y-3">
              <div className="bg-muted border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium">Health</div>
                    <div className="text-sm text-muted-foreground">Physical condition</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => adjustHealth(-1)}
                      data-testid="button-damage"
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      Damage
                    </Button>
                    <div className="font-mono text-lg" data-testid="health-display">
                      <span>{character.currentHealth}</span> / <span>{character.maxHealth}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustHealth(1)}
                      className="border-success text-success"
                      data-testid="button-heal"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Heal
                    </Button>
                  </div>
                </div>
                <Progress value={healthPercentage} className="h-3" />
              </div>

              <div className="bg-muted border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Active Conditions</div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {character.conditions.map((condition, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="flex items-center gap-2"
                      data-testid={`condition-${index}`}
                    >
                      {condition}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCondition(index)}
                        className="h-4 w-4 p-0 hover:text-white"
                        data-testid={`button-remove-condition-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add condition..."
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                    data-testid="input-new-condition"
                  />
                  <Button onClick={addCondition} data-testid="button-add-condition">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="talents" className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Talents & Abilities coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Character inventory coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="background" className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Pride</label>
            <Textarea
              value={character.pride || ""}
              onChange={(e) => updateCharacter(character.id, { pride: e.target.value })}
              placeholder="What is your character most proud of?"
              data-testid="textarea-pride"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Dark Secret</label>
            <Textarea
              value={character.darkSecret || ""}
              onChange={(e) => updateCharacter(character.id, { darkSecret: e.target.value })}
              placeholder="What dark secret does your character hide?"
              data-testid="textarea-dark-secret"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={character.notes || ""}
              onChange={(e) => updateCharacter(character.id, { notes: e.target.value })}
              placeholder="Additional character notes..."
              data-testid="textarea-notes"
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
