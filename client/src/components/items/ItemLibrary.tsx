import { useState } from "react";
import { Campaign, Item } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Sword, 
  Shield, 
  Wrench, 
  Apple,
  User,
  Users,
  Weight
} from "lucide-react";

interface ItemLibraryProps {
  campaign: Campaign;
}

export function ItemLibrary({ campaign }: ItemLibraryProps) {
  const {
    items,
    characters,
    createItem,
    assignItemToCharacter,
    assignItemToParty,
  } = useGameStore();

  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [newItem, setNewItem] = useState({
    name: "",
    type: "weapon" as Item["type"],
    bonus: 0,
    weight: 1,
    notes: "",
    quantity: 1,
  });

  const campaignCharacters = characters.filter(c => campaign.party.includes(c.id));

  const handleCreateItem = () => {
    if (newItem.name.trim()) {
      createItem({
        name: newItem.name.trim(),
        type: newItem.type,
        bonus: newItem.bonus || undefined,
        weight: newItem.weight || undefined,
        notes: newItem.notes.trim() || undefined,
        quantity: newItem.quantity,
      });
      
      setNewItem({
        name: "",
        type: "weapon",
        bonus: 0,
        weight: 1,
        notes: "",
        quantity: 1,
      });
      setIsCreatingItem(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  const getItemIcon = (type: Item["type"]) => {
    switch (type) {
      case "weapon": return <Sword className="h-4 w-4" />;
      case "armor": return <Shield className="h-4 w-4" />;
      case "tool": return <Wrench className="h-4 w-4" />;
      case "consumable": return <Apple className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getItemBonusLabel = (item: Item) => {
    switch (item.type) {
      case "weapon": return `+${item.bonus} dice`;
      case "armor": return `${item.bonus} AR`;
      case "consumable": return item.bonus ? `${item.bonus} effect` : "";
      default: return item.bonus ? `+${item.bonus}` : "";
    }
  };

  const calculateTotalWeight = () => {
    const characterWeights = campaignCharacters.reduce((total, character) => {
      return total + character.items.reduce((charTotal, item) => {
        return charTotal + (item.weight || 0) * item.quantity;
      }, 0);
    }, 0);

    const partyWeight = campaign.partyInventory.reduce((total, item) => {
      return total + (item.weight || 0) * item.quantity;
    }, 0);

    return characterWeights + partyWeight;
  };

  const totalWeight = calculateTotalWeight();
  const maxWeight = 60; // Example max carrying capacity
  const encumbrancePercentage = (totalWeight / maxWeight) * 100;

  return (
    <div className="space-y-6" data-testid="item-library">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-secondary" />
              Item Library
            </CardTitle>
            <Dialog open={isCreatingItem} onOpenChange={setIsCreatingItem}>
              <DialogTrigger asChild>
                <Button className="btn-secondary" data-testid="button-add-item">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Iron Sword, Healing Potion..."
                      data-testid="input-item-name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newItem.type}
                        onValueChange={(value: Item["type"]) => setNewItem(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger data-testid="select-item-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weapon">Weapon</SelectItem>
                          <SelectItem value="armor">Armor</SelectItem>
                          <SelectItem value="tool">Tool</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ 
                          ...prev, 
                          quantity: parseInt(e.target.value) || 1 
                        }))}
                        data-testid="input-item-quantity"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bonus (Optional)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newItem.bonus || ""}
                        onChange={(e) => setNewItem(prev => ({ 
                          ...prev, 
                          bonus: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="0"
                        data-testid="input-item-bonus"
                      />
                    </div>
                    <div>
                      <Label>Weight</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newItem.weight || ""}
                        onChange={(e) => setNewItem(prev => ({ 
                          ...prev, 
                          weight: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="1.0"
                        data-testid="input-item-weight"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={newItem.notes}
                      onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Description, special properties, etc..."
                      data-testid="textarea-item-notes"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateItem}
                      disabled={!newItem.name.trim()}
                      className="flex-1"
                      data-testid="button-submit-item"
                    >
                      Create Item
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingItem(false)}
                      data-testid="button-cancel-item"
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

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="filter-all">All Items</TabsTrigger>
          <TabsTrigger value="weapon" data-testid="filter-weapons">
            <Sword className="mr-2 h-4 w-4" />
            Weapons
          </TabsTrigger>
          <TabsTrigger value="armor" data-testid="filter-armor">
            <Shield className="mr-2 h-4 w-4" />
            Armor
          </TabsTrigger>
          <TabsTrigger value="tool" data-testid="filter-tools">
            <Wrench className="mr-2 h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="consumable" data-testid="filter-consumables">
            <Apple className="mr-2 h-4 w-4" />
            Consumables
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6">
          {/* Item Cards */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeFilter === "all" 
                    ? "Create your first item to get started!" 
                    : `No ${activeFilter}s in your library yet.`}
                </p>
                <Button
                  onClick={() => setIsCreatingItem(true)}
                  className="btn-secondary"
                  data-testid="button-create-first-item"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="card-hover" data-testid={`item-card-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {getItemIcon(item.type)}
                          <span data-testid="item-name">{item.name}</span>
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          {item.type}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </div>
                      </div>
                      {item.bonus && (
                        <Badge className="badge-primary" data-testid="item-bonus">
                          {getItemBonusLabel(item)}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Effect</div>
                        <div className="font-mono text-sm">
                          {item.bonus ? getItemBonusLabel(item) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Weight</div>
                        <div className="font-mono text-sm" data-testid="item-weight">
                          {item.weight || 0}
                        </div>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="text-xs text-muted-foreground mb-3" data-testid="item-notes">
                        {item.notes}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Select onValueChange={(characterId) => assignItemToCharacter(item.id, characterId)}>
                        <SelectTrigger className="flex-1 h-8" data-testid="select-assign-character">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            <SelectValue placeholder="Assign to Character" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {campaignCharacters.map(character => (
                            <SelectItem key={character.id} value={character.id}>
                              {character.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignItemToParty(item.id, campaign.id)}
                        className="px-2"
                        title="Add to Party"
                        data-testid="button-assign-party"
                      >
                        <Users className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Encumbrance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Party Encumbrance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Weight</span>
            <span className="font-mono font-bold" data-testid="total-weight">
              {totalWeight.toFixed(1)} / {maxWeight}
            </span>
          </div>
          <Progress 
            value={encumbrancePercentage} 
            className="h-3 mb-2"
            data-testid="encumbrance-bar" 
          />
          <div className="text-xs text-muted-foreground">
            {encumbrancePercentage < 80 ? (
              <span className="text-success">
                Party can carry {(maxWeight - totalWeight).toFixed(1)} more weight
              </span>
            ) : encumbrancePercentage < 100 ? (
              <span className="text-secondary">
                Near encumbrance limit
              </span>
            ) : (
              <span className="text-destructive">
                Party is overencumbered!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
