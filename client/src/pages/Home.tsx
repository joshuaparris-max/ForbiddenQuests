import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { SessionLog } from "@/components/layout/SessionLog";
import { DiceRoller } from "@/components/layout/DiceRoller";
import { CharacterCard } from "@/components/character/CharacterCard";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_SKILLS, Character } from "@shared/schema";
import { Plus, Users } from "lucide-react";

export default function Home() {
  const {
    campaigns,
    characters,
    activeCampaignId,
    activeCharacterId,
    getActiveCampaign,
    getActiveCharacter,
    createCampaign,
    setActiveCampaign,
    createCharacter,
  } = useGameStore();

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    kin: "",
    profession: "",
    attributes: { STR: 3, AGI: 3, WIT: 3, EMP: 3 },
    skills: {} as Record<string, number>,
    currentHealth: 10,
    maxHealth: 10,
  });

  const activeCampaign = getActiveCampaign();
  const activeCharacter = getActiveCharacter();
  const campaignCharacters = characters.filter(c => 
    activeCampaign?.party.includes(c.id)
  );

  const handleCreateCampaign = () => {
    if (newCampaignName.trim()) {
      createCampaign(newCampaignName.trim());
      setNewCampaignName("");
      setIsCreatingCampaign(false);
    }
  };

  const handleCreateCharacter = () => {
    if (!activeCampaign || !newCharacter.name.trim()) return;

    // Initialize skills with default values
    const skills = DEFAULT_SKILLS.reduce((acc, skill) => {
      acc[skill] = newCharacter.skills[skill] || 0;
      return acc;
    }, {} as Record<string, number>);

    const characterData: Omit<Character, 'id'> = {
      name: newCharacter.name.trim(),
      kin: newCharacter.kin.trim() || undefined,
      profession: newCharacter.profession.trim() || undefined,
      attributes: newCharacter.attributes,
      skills,
      talents: [],
      conditions: [],
      items: [],
      currentHealth: newCharacter.currentHealth,
      maxHealth: newCharacter.maxHealth,
      xp: 0,
    };

    createCharacter(activeCampaign.id, characterData);
    
    // Reset form
    setNewCharacter({
      name: "",
      kin: "",
      profession: "",
      attributes: { STR: 3, AGI: 3, WIT: 3, EMP: 3 },
      skills: {},
      currentHealth: 10,
      maxHealth: 10,
    });
    setIsCreatingCharacter(false);
  };

  // Show campaign selection if no active campaign
  if (!activeCampaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">Welcome to Forbidden Lands Lite</h1>
          <p className="text-muted-foreground text-lg">Create a new campaign or select an existing one to begin your adventure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Campaign */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
            <div className="space-y-4">
              <Input
                placeholder="Campaign name..."
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCampaign()}
                data-testid="input-campaign-name"
              />
              <Button 
                onClick={handleCreateCampaign}
                className="w-full"
                disabled={!newCampaignName.trim()}
                data-testid="button-create-campaign"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>

          {/* Existing Campaigns */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Campaigns</h2>
            {campaigns.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No campaigns yet</p>
            ) : (
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <Button
                    key={campaign.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveCampaign(campaign.id)}
                    data-testid={`button-select-campaign-${campaign.id}`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {campaign.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Session Log */}
        <SessionLog />

        {/* Main Content */}
        <main className="lg:col-span-6 space-y-6">
          {/* Party Roster */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold">Party Roster</h2>
              <Dialog open={isCreatingCharacter} onOpenChange={setIsCreatingCharacter}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" data-testid="button-create-character">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Character
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Character</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Character Name</Label>
                      <Input
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter character name..."
                        data-testid="input-character-name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Kin (Optional)</Label>
                        <Input
                          value={newCharacter.kin}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, kin: e.target.value }))}
                          placeholder="e.g., Human, Elf, Dwarf..."
                          data-testid="input-character-kin"
                        />
                      </div>
                      <div>
                        <Label>Profession (Optional)</Label>
                        <Input
                          value={newCharacter.profession}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, profession: e.target.value }))}
                          placeholder="e.g., Warrior, Scout, Mage..."
                          data-testid="input-character-profession"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Attributes</Label>
                      <div className="grid grid-cols-4 gap-4 mt-2">
                        {Object.entries(newCharacter.attributes).map(([attr, value]) => (
                          <div key={attr} className="text-center">
                            <Label className="text-xs">{attr}</Label>
                            <Select
                              value={value.toString()}
                              onValueChange={(val) => setNewCharacter(prev => ({
                                ...prev,
                                attributes: { ...prev.attributes, [attr]: parseInt(val) }
                              }))}
                            >
                              <SelectTrigger data-testid={`select-attribute-${attr.toLowerCase()}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Current Health</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={newCharacter.currentHealth}
                          onChange={(e) => setNewCharacter(prev => ({
                            ...prev,
                            currentHealth: parseInt(e.target.value) || 1
                          }))}
                          data-testid="input-current-health"
                        />
                      </div>
                      <div>
                        <Label>Max Health</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={newCharacter.maxHealth}
                          onChange={(e) => setNewCharacter(prev => ({
                            ...prev,
                            maxHealth: parseInt(e.target.value) || 1
                          }))}
                          data-testid="input-max-health"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateCharacter}
                        disabled={!newCharacter.name.trim()}
                        className="flex-1"
                        data-testid="button-submit-character"
                      >
                        Create Character
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingCharacter(false)}
                        data-testid="button-cancel-character"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Character Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaignCharacters.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No characters in this campaign yet</p>
                  <p className="text-muted-foreground text-sm">Create your first character to get started!</p>
                </div>
              ) : (
                campaignCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isActive={character.id === activeCharacterId}
                  />
                ))
              )}
            </div>
          </div>

          {/* Selected Character Sheet */}
          {activeCharacter && (
            <CharacterSheet character={activeCharacter} />
          )}
        </main>

        {/* Right Sidebar: Dice Roller */}
        <DiceRoller />
      </div>
    </div>
  );
}
