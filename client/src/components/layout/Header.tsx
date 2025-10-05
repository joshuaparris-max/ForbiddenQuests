import { Link, useLocation } from "wouter";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Upload, 
  Settings, 
  Keyboard,
  CheckCircle,
  Dice6
} from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { getActiveCampaign, exportData, importData } = useGameStore();
  const activeCampaign = getActiveCampaign();

  const tabs = [
    { path: "/", label: "Characters", icon: "👤" },
    { path: "/exploration", label: "Exploration", icon: "🗺️" },
    { path: "/combat", label: "Combat", icon: "⚔️" },
    { path: "/items", label: "Items", icon: "📦" },
    { path: "/stronghold", label: "Stronghold", icon: "🏰" },
  ];

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forbidden-lands-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
          const data = e.target?.result as string;
          importData(data);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Campaign Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Dice6 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  Forbidden Lands Lite
                </h1>
                <p className="text-sm text-muted-foreground">
                  Campaign: {activeCampaign?.name || "No Campaign"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <Link key={tab.path} href={tab.path}>
                <Button
                  variant={location === tab.path ? "default" : "ghost"}
                  size="sm"
                  className={location === tab.path ? "tab-active" : ""}
                  data-testid={`nav-${tab.label.toLowerCase()}`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              title="Keyboard shortcuts (?)"
              data-testid="button-shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-muted-foreground"
              title="Export campaign"
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImport}
              className="text-muted-foreground"
              title="Import campaign"
              data-testid="button-import"
            >
              <Upload className="h-4 w-4" />
            </Button>
            
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                title="Settings"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            
            <div className="text-xs text-success flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Auto-saved</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
