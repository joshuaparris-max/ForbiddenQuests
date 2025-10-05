import { useState } from "react";
import { Campaign, Hex, TERRAIN_TYPES, WEATHER_CONDITIONS } from "@shared/schema";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Plus, 
  Tent, 
  Route,
  Skull,
  TreePine,
  Mountain,
  Waves,
  Zap,
  Apple,
  Droplets,
  Flame,
  Target
} from "lucide-react";

interface ExplorationTrackerProps {
  campaign: Campaign;
}

export function ExplorationTracker({ campaign }: ExplorationTrackerProps) {
  const {
    addHex,
    updateHex,
    setCurrentHex,
    updatePartyResources,
    addLogEntry,
  } = useGameStore();

  const [isAddingHex, setIsAddingHex] = useState(false);
  const [newHex, setNewHex] = useState({
    name: "",
    terrain: "Plains",
    threat: 1,
    notes: "",
  });

  const currentHex = campaign.hexes.find(h => h.id === campaign.currentHexId);
  const nearbyHexes = campaign.hexes.filter(h => h.id !== campaign.currentHexId);

  const handleAddHex = () => {
    if (newHex.name.trim()) {
      addHex(campaign.id, {
        name: newHex.name.trim(),
        terrain: newHex.terrain,
        threat: newHex.threat,
        notes: newHex.notes.trim() || undefined,
        explored: false,
      });
      
      setNewHex({
        name: "",
        terrain: "Plains",
        threat: 1,
        notes: "",
      });
      setIsAddingHex(false);
    }
  };

  const handleTravelTo = (hexId: string) => {
    setCurrentHex(campaign.id, hexId);
    const hex = campaign.hexes.find(h => h.id === hexId);
    if (hex && !hex.explored) {
      updateHex(campaign.id, hexId, { explored: true });
    }
  };

  const handleMakeCamp = () => {
    addLogEntry(campaign.id, {
      message: "Party made camp and rested",
      type: "exploration",
    });
  };

  const handleUpdateResources = (resource: keyof Campaign["partyResources"], delta: number) => {
    const currentValue = campaign.partyResources[resource];
    const newValue = Math.max(0, currentValue + delta);
    updatePartyResources(campaign.id, { [resource]: newValue });
  };

  const getThreatColor = (threat: number) => {
    if (threat <= 2) return "text-success";
    if (threat <= 4) return "text-secondary";
    return "text-destructive";
  };

  const getTerrainIcon = (terrain: string) => {
    switch (terrain.toLowerCase()) {
      case 'forest': return <TreePine className="h-4 w-4" />;
      case 'mountains': return <Mountain className="h-4 w-4" />;
      case 'water': return <Waves className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="exploration-tracker">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Exploration Tracker
            </CardTitle>
            <Dialog open={isAddingHex} onOpenChange={setIsAddingHex}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="button-add-location">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Location Name</Label>
                    <Input
                      value={newHex.name}
                      onChange={(e) => setNewHex(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Ancient Ruins, Dark Forest..."
                      data-testid="input-location-name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Terrain Type</Label>
                      <Select
                        value={newHex.terrain}
                        onValueChange={(value) => setNewHex(prev => ({ ...prev, terrain: value }))}
                      >
                        <SelectTrigger data-testid="select-terrain">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TERRAIN_TYPES.map(terrain => (
                            <SelectItem key={terrain} value={terrain}>{terrain}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Threat Level (1-6)</Label>
                      <Select
                        value={newHex.threat.toString()}
                        onValueChange={(value) => setNewHex(prev => ({ ...prev, threat: parseInt(value) }))}
                      >
                        <SelectTrigger data-testid="select-threat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={newHex.notes}
                      onChange={(e) => setNewHex(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Describe what the party finds here..."
                      data-testid="textarea-location-notes"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddHex}
                      disabled={!newHex.name.trim()}
                      className="flex-1"
                      data-testid="button-submit-location"
                    >
                      Add Location
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingHex(false)}
                      data-testid="button-cancel-location"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Current Location */}
      {currentHex && (
        <Card className="border-2 border-primary" data-testid="current-location">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-primary font-semibold mb-1">CURRENT LOCATION</div>
                <h3 className="text-lg font-bold" data-testid="current-location-name">
                  {currentHex.name}
                </h3>
              </div>
              <Badge className="badge-primary">
                {currentHex.explored ? "Explored" : "New"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Terrain</div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {getTerrainIcon(currentHex.terrain)}
                  <span data-testid="current-location-terrain">{currentHex.terrain}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Threat Level</div>
                <div className={`text-sm font-medium flex items-center gap-1 ${getThreatColor(currentHex.threat || 1)}`}>
                  <span data-testid="current-location-threat">{currentHex.threat || 1}</span>
                  <Skull className="h-3 w-3" />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Weather</div>
                <div className="text-sm font-medium" data-testid="current-weather">
                  {campaign.weather || "Clear"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Time</div>
                <div className="text-sm font-medium" data-testid="current-time">
                  {campaign.timeOfDay || "Day"}
                </div>
              </div>
            </div>

            {currentHex.notes && (
              <div className="pt-3 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Notes:</div>
                <p className="text-sm" data-testid="current-location-notes">
                  {currentHex.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nearby Locations */}
      {nearbyHexes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nearbyHexes.map((hex) => (
                <div
                  key={hex.id}
                  className="bg-muted border border-border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer card-hover"
                  onClick={() => handleTravelTo(hex.id)}
                  data-testid={`nearby-hex-${hex.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium" data-testid="hex-name">{hex.name}</h4>
                    <Badge variant={hex.explored ? "default" : "secondary"} className="text-xs">
                      {hex.explored ? "Explored" : "Unexplored"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {getTerrainIcon(hex.terrain)}
                      {hex.terrain}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      Threat: <span className={`font-medium ${getThreatColor(hex.threat || 1)}`}>
                        {hex.threat || 1}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Party Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-secondary" />
            Party Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Food</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple className="h-4 w-4 text-secondary" />
                  <span className="font-mono font-bold text-lg" data-testid="party-food">
                    {campaign.partyResources.food}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("food", -1)}
                    data-testid="button-decrease-food"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("food", 1)}
                    data-testid="button-increase-food"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Water</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  <span className="font-mono font-bold text-lg" data-testid="party-water">
                    {campaign.partyResources.water}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("water", -1)}
                    data-testid="button-decrease-water"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("water", 1)}
                    data-testid="button-increase-water"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Torches</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="font-mono font-bold text-lg" data-testid="party-torches">
                    {campaign.partyResources.torches}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("torches", -1)}
                    data-testid="button-decrease-torches"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("torches", 1)}
                    data-testid="button-increase-torches"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Arrows</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-success" />
                  <span className="font-mono font-bold text-lg" data-testid="party-arrows">
                    {campaign.partyResources.arrows}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("arrows", -1)}
                    data-testid="button-decrease-arrows"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResources("arrows", 1)}
                    data-testid="button-increase-arrows"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleMakeCamp}
              className="btn-primary flex-1"
              data-testid="button-make-camp"
            >
              <Tent className="mr-2 h-4 w-4" />
              Make Camp
            </Button>
            <Button
              className="btn-secondary flex-1"
              data-testid="button-travel"
            >
              <Route className="mr-2 h-4 w-4" />
              Travel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {campaign.hexes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Locations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring by adding your first location!
            </p>
            <Button
              onClick={() => setIsAddingHex(true)}
              className="btn-primary"
              data-testid="button-add-first-location"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
