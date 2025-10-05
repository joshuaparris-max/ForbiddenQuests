import { DicePool, RollResult } from '@shared/schema';

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(pool: DicePool): RollResult {
  const dice: number[] = [];
  let successes = 0;
  let banes = 0;

  // Roll attribute dice
  for (let i = 0; i < pool.attribute; i++) {
    const roll = rollD6();
    dice.push(roll);
    if (roll === 6) successes++;
  }

  // Roll skill dice  
  for (let i = 0; i < pool.skill; i++) {
    const roll = rollD6();
    dice.push(roll);
    if (roll === 6) successes++;
  }

  // Roll gear dice
  for (let i = 0; i < pool.gear; i++) {
    const roll = rollD6();
    dice.push(roll);
    if (roll === 6) successes++;
  }

  return {
    dice,
    successes,
    banes,
    pushed: false,
    timestamp: new Date().toISOString(),
  };
}

export function pushDice(originalResult: RollResult): RollResult {
  if (originalResult.pushed) {
    return originalResult; // Can't push twice
  }

  const newDice: number[] = [];
  let newSuccesses = originalResult.successes;
  let newBanes = originalResult.banes;

  // Re-roll all non-6s
  for (let i = 0; i < originalResult.dice.length; i++) {
    const originalRoll = originalResult.dice[i];
    
    if (originalRoll === 6) {
      // Keep successes as they are
      newDice.push(originalRoll);
    } else {
      // Re-roll non-successes
      const newRoll = rollD6();
      newDice.push(newRoll);
      
      if (newRoll === 6) {
        newSuccesses++;
      } else if (newRoll === 1) {
        // Only count banes on attribute dice (first portion of the array)
        // This is simplified - in a real implementation you'd need to track dice types
        if (i < Math.floor(originalResult.dice.length / 3)) {
          newBanes++;
        }
      }
    }
  }

  return {
    dice: newDice,
    successes: newSuccesses,
    banes: newBanes,
    pushed: true,
    timestamp: new Date().toISOString(),
    characterId: originalResult.characterId,
    rollType: originalResult.rollType,
  };
}

export function calculateDicePoolTotal(pool: DicePool): number {
  return pool.attribute + pool.skill + pool.gear;
}

export function getDiceResult(roll: number): 'success' | 'bane' | 'normal' {
  if (roll === 6) return 'success';
  if (roll === 1) return 'bane';
  return 'normal';
}
