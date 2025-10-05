import { Character } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";

interface CharacterCardProps {
  character: Character;
  isActive?: boolean;
  onClick?: () => void;
}

export function CharacterCard({ character, isActive, onClick }: CharacterCardProps) {
  const { setActiveCharacter } = useGameStore();

  const handleClick = () => {
    setActiveCharacter(character.id);
    onClick?.();
  };

  const healthPercentage = (character.currentHealth / character.maxHealth) * 100;

  return (
    <Card 
      className={`card-hover cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={handleClick}
      data-testid={`character-card-${character.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg" data-testid="character-name">
              {character.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {character.kin && (
                <>
                  <span data-testid="character-kin">{character.kin}</span>
                  {character.profession && " · "}
                </>
              )}
              {character.profession && (
                <span data-testid="character-profession">{character.profession}</span>
              )}
            </p>
          </div>
          <Badge variant={isActive ? "default" : "secondary"} data-testid="character-status">
            {isActive ? "Active" : "Ready"}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {Object.entries(character.attributes).map(([attr, value]) => (
            <div key={attr} className="text-center">
              <div 
                className="stat-badge bg-primary text-white mb-1"
                data-testid={`character-${attr.toLowerCase()}`}
              >
                {value}
              </div>
              <div className="text-xs text-muted-foreground">{attr}</div>
            </div>
          ))}
        </div>

        {/* Health and Conditions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Health</span>
            <span className="font-mono" data-testid="character-health">
              {character.currentHealth} / {character.maxHealth}
            </span>
          </div>
          <Progress value={healthPercentage} className="h-2" data-testid="character-health-bar" />
          
          <div className="flex flex-wrap gap-1">
            {character.conditions.length > 0 ? (
              character.conditions.map((condition, index) => (
                <Badge
                  key={index}
                  variant="destructive"
                  className="text-xs"
                  data-testid={`character-condition-${index}`}
                >
                  {condition}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No conditions</span>
            )}
          </div>
        </div>

        {/* XP */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Experience</span>
          <span className="font-mono text-secondary" data-testid="character-xp">
            {character.xp} XP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
