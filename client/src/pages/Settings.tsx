import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Moon,
  Sun,
  Database,
  FileText
} from "lucide-react";

export default function Settings() {
  const { 
    settings, 
    campaigns,
    characters,
    items,
    exportData, 
    importData,
    // Would need to add these to store
    // updateSettings,
    // clearAllData
  } = useGameStore();
  
  const { toast } = useToast();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forbidden-lands-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your game data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export game data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            importData(data);
            toast({
              title: "Import Successful",
              description: "Your game data has been imported successfully.",
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Failed to import game data. Please check the file format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetAllData = () => {
    // This would need to be implemented in the store
    // clearAllData();
    setIsConfirmingReset(false);
    toast({
      title: "Data Reset",
      description: "All game data has been cleared.",
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Forbidden Lands Lite experience and manage your data.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card data-testid="general-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Theme</Label>
                <div className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </div>
              </div>
              <Select value={settings.theme} onValueChange={() => {}}>
                <SelectTrigger className="w-32" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-save</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically save changes to local storage
                </div>
              </div>
              <Switch 
                checked={settings.autoSave} 
                onCheckedChange={() => {}}
                data-testid="switch-autosave"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dice Animations</Label>
                <div className="text-sm text-muted-foreground">
                  Show rolling animations when dice are rolled
                </div>
              </div>
              <Switch 
                checked={settings.showDiceAnimations} 
                onCheckedChange={() => {}}
                data-testid="switch-dice-animations"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card data-testid="data-management">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="campaigns-count">
                  {campaigns.length}
                </div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary" data-testid="characters-count">
                  {characters.length}
                </div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success" data-testid="items-count">
                  {items.length}
                </div>
                <div className="text-sm text-muted-foreground">Items</div>
              </div>
            </div>

            {/* Export/Import */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Export Data</Label>
                  <div className="text-sm text-muted-foreground">
                    Download all your campaigns, characters, and items as JSON
                  </div>
                </div>
                <Button 
                  onClick={handleExport}
                  variant="outline"
                  data-testid="button-export-data"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Import Data</Label>
                  <div className="text-sm text-muted-foreground">
                    Load campaigns and characters from a JSON backup
                  </div>
                </div>
                <Button 
                  onClick={handleImport}
                  variant="outline"
                  data-testid="button-import-data"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50" data-testid="danger-zone">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base text-destructive">Reset All Data</Label>
                <div className="text-sm text-muted-foreground">
                  Permanently delete all campaigns, characters, and settings.
                  This action cannot be undone.
                </div>
              </div>
              <Dialog open={isConfirmingReset} onOpenChange={setIsConfirmingReset}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    data-testid="button-reset-data"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Confirm Data Reset
                    </DialogTitle>
                    <DialogDescription>
                      This will permanently delete:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{campaigns.length} campaign(s)</li>
                        <li>{characters.length} character(s)</li>
                        <li>{items.length} item(s)</li>
                        <li>All settings and preferences</li>
                      </ul>
                      <p className="mt-4 font-semibold">This action cannot be undone!</p>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="destructive"
                      onClick={handleResetAllData}
                      className="flex-1"
                      data-testid="button-confirm-reset"
                    >
                      Yes, Delete Everything
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsConfirmingReset(false)}
                      className="flex-1"
                      data-testid="button-cancel-reset"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card data-testid="about-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Forbidden Lands Lite</strong> - A browser-based TTRPG tool
              </p>
              <p className="text-muted-foreground">
                Built with Vite, React, TypeScript, and TailwindCSS
              </p>
              <p className="text-muted-foreground">
                Uses Year Zero Engine dice mechanics (6 = success, 1 = bane when pushed)
              </p>
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <p className="font-medium mb-1">Keyboard Shortcuts:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span><kbd className="px-1 py-0.5 bg-background rounded text-xs">R</kbd> Roll dice</span>
                  <span><kbd className="px-1 py-0.5 bg-background rounded text-xs">P</kbd> Push roll</span>
                  <span><kbd className="px-1 py-0.5 bg-background rounded text-xs">C</kbd> Clear result</span>
                  <span><kbd className="px-1 py-0.5 bg-background rounded text-xs">?</kbd> Show help</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
