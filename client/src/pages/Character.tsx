import { useParams } from "wouter";
import { useGameStore } from "@/lib/store";
import { SessionLog } from "@/components/layout/SessionLog";
import { DiceRoller } from "@/components/layout/DiceRoller";
import { CharacterSheet } from "@/components/character/CharacterSheet";

export default function Character() {
  const { id } = useParams<{ id?: string }>();
  const { characters, getActiveCharacter } = useGameStore();

  const character = id 
    ? characters.find(c => c.id === id)
    : getActiveCharacter();

  if (!character) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
          <p className="text-muted-foreground">The requested character could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SessionLog />
        
        <main className="lg:col-span-6">
          <CharacterSheet character={character} />
        </main>
        
        <DiceRoller />
      </div>
    </div>
  );
}
