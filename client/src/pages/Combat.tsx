import { useGameStore } from "@/lib/store";
import { SessionLog } from "@/components/layout/SessionLog";
import { DiceRoller } from "@/components/layout/DiceRoller";
import { CombatTracker } from "@/components/combat/CombatTracker";

export default function Combat() {
  const { getActiveCampaign } = useGameStore();
  const activeCampaign = getActiveCampaign();

  if (!activeCampaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Active Campaign</h1>
          <p className="text-muted-foreground">Please select or create a campaign first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SessionLog />
        
        <main className="lg:col-span-6">
          <CombatTracker campaign={activeCampaign} />
        </main>
        
        <DiceRoller />
      </div>
    </div>
  );
}
