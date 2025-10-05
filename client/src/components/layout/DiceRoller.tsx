import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getDiceResult, calculateDicePoolTotal } from "@/lib/dice";
import { 
  Dice6, 
  RotateCcw, 
  History, 
  Save, 
  Eraser,
  Keyboard
} from "lucide-react";

export function DiceRoller() {
  const {
    dicePool,
    lastRollResult,
    setDicePool,
    rollDicePool,
    pushLastRoll,
    clearLastRoll,
    getActiveCharacter,
    getActiveCampaign,
  } = useGameStore();

  const [rollType, setRollType] = useState("Custom Roll");
  const [isRolling, setIsRolling] = useState(false);
  
  const activeCharacter = getActiveCharacter();
  const activeCampaign = getActiveCampaign();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          handleRollDice();
          break;
        case 'p':
          e.preventDefault();
          if (lastRollResult && !lastRollResult.pushed) {
            handlePushDice();
          }
          break;
        case 'c':
          e.preventDefault();
          clearLastRoll();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lastRollResult]);

  const handleRollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setTimeout(() => {
      rollDicePool(rollType, activeCharacter?.id);
      setIsRolling(false);
    }, 500); // Animation delay
  };

  const handlePushDice = () => {
    if (!lastRollResult || lastRollResult.pushed) return;
    pushLastRoll();
  };

  const totalDice = calculateDicePoolTotal(dicePool);

  const renderDiceVisual = () => {
    if (!lastRollResult) return null;

    return (
      <div className="grid grid-cols-5 gap-2 mb-4">
        {lastRollResult.dice.map((die, index) => {
          const result = getDiceResult(die);
          let className = "aspect-square rounded flex items-center justify-center font-mono font-bold text-lg ";
          
          switch (result) {
            case 'success':
              className += "bg-success text-success-foreground success-glow";
              break;
            case 'bane':
              className += "bg-destructive text-destructive-foreground bane-glow";
              break;
            default:
              className += "bg-muted text-foreground";
          }

          return (
            <div
              key={index}
              className={`${className} ${isRolling ? 'dice-rolling' : ''}`}
              data-testid={`dice-${index}-${result}`}
            >
              {die}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="lg:col-span-3 space-y-4" data-testid="dice-roller">
      <div className="bg-card border border-border rounded-lg overflow-hidden sticky-panel">
        {/* Dice Roller Header */}
        <div className="gradient-primary p-4 text-white">
          <h3 className="font-serif font-bold text-xl flex items-center gap-2">
            <Dice6 className="h-6 w-6" />
            Dice Roller
          </h3>
          <p className="text-sm opacity-90 mt-1">Year Zero Engine</p>
        </div>

        {/* Dice Pool Builder */}
        <div className="p-4 border-b border-border space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Roll Type
            </Label>
            <Select value={rollType} onValueChange={setRollType}>
              <SelectTrigger data-testid="select-roll-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Skill Check">Skill Check</SelectItem>
                <SelectItem value="Attack Roll">Attack Roll</SelectItem>
                <SelectItem value="Defense Roll">Defense Roll</SelectItem>
                <SelectItem value="Custom Roll">Custom Roll</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
              <span>Attribute Dice</span>
              <span className="font-mono text-primary text-lg" data-testid="attribute-dice-count">
                {dicePool.attribute} d6
              </span>
            </Label>
            <Slider
              value={[dicePool.attribute]}
              onValueChange={([value]) => setDicePool({ attribute: value })}
              max={6}
              step={1}
              className="w-full"
              data-testid="slider-attribute"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
              <span>Skill Dice</span>
              <span className="font-mono text-primary text-lg" data-testid="skill-dice-count">
                {dicePool.skill} d6
              </span>
            </Label>
            <Slider
              value={[dicePool.skill]}
              onValueChange={([value]) => setDicePool({ skill: value })}
              max={6}
              step={1}
              className="w-full"
              data-testid="slider-skill"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
              <span>Gear Dice</span>
              <span className="font-mono text-secondary text-lg" data-testid="gear-dice-count">
                {dicePool.gear} d6
              </span>
            </Label>
            <Slider
              value={[dicePool.gear]}
              onValueChange={([value]) => setDicePool({ gear: value })}
              max={6}
              step={1}
              className="w-full"
              data-testid="slider-gear"
            />
          </div>

          <div className="pt-3 border-t border-border">
            <div className="text-sm text-muted-foreground mb-2">Total Pool</div>
            <div className="font-mono text-3xl font-bold text-center text-primary" data-testid="total-dice-count">
              {totalDice} d6
            </div>
          </div>
        </div>

        {/* Roll Button */}
        <div className="p-4 border-b border-border">
          <Button
            onClick={handleRollDice}
            disabled={isRolling || totalDice === 0}
            className="w-full btn-primary px-6 py-4 text-lg font-bold"
            data-testid="button-roll-dice"
          >
            <Dice6 className="mr-2 h-5 w-5" />
            {isRolling ? 'ROLLING...' : 'ROLL DICE'}
          </Button>
        </div>

        {/* Results Display */}
        <div className="p-4 border-b border-border">
          <div className="text-sm font-medium text-muted-foreground mb-3">
            {lastRollResult ? 'Last Roll Result' : 'No rolls yet'}
          </div>
          
          {lastRollResult && (
            <>
              {/* Dice Visual Display */}
              {renderDiceVisual()}

              {/* Results Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-success/20 border border-success/40 rounded-lg p-3 text-center">
                  <div className="text-xs text-success font-medium mb-1">Successes</div>
                  <div className="font-mono text-3xl font-bold text-success" data-testid="successes-count">
                    {lastRollResult.successes}
                  </div>
                </div>
                <div className="bg-destructive/20 border border-destructive/40 rounded-lg p-3 text-center">
                  <div className="text-xs text-destructive font-medium mb-1">Banes</div>
                  <div className="font-mono text-3xl font-bold text-destructive" data-testid="banes-count">
                    {lastRollResult.banes}
                  </div>
                </div>
              </div>

              {lastRollResult.pushed && (
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="text-xs">
                    Roll was pushed
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>

        {/* Push Dice Option */}
        {lastRollResult && !lastRollResult.pushed && (
          <div className="p-4 border-b border-border">
            <Button
              onClick={handlePushDice}
              className="w-full btn-secondary px-4 py-3 font-bold"
              data-testid="button-push-dice"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              PUSH THE ROLL
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Re-roll non-successes. Risk more banes!
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            data-testid="button-roll-history"
          >
            <History className="mr-2 h-4 w-4" />
            View Roll History
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            data-testid="button-save-template"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Roll Template
          </Button>
          <Button
            variant="outline"
            onClick={clearLastRoll}
            className="w-full justify-start"
            data-testid="button-clear-result"
          >
            <Eraser className="mr-2 h-4 w-4" />
            Clear Result
          </Button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-4 bg-background/50 text-xs text-muted-foreground">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </div>
          <div className="space-y-1">
            <div>
              <Badge variant="outline" className="text-xs mr-2">R</Badge>
              Roll dice
            </div>
            <div>
              <Badge variant="outline" className="text-xs mr-2">P</Badge>
              Push roll
            </div>
            <div>
              <Badge variant="outline" className="text-xs mr-2">C</Badge>
              Clear result
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
