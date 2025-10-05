import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Copy, Trash2, Scroll } from "lucide-react";
import { format } from "date-fns";

export function SessionLog() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { getActiveCampaign, clearLog } = useGameStore();
  const activeCampaign = getActiveCampaign();

  const handleCopyLog = () => {
    if (!activeCampaign?.log) return;
    
    const logText = activeCampaign.log
      .map(entry => {
        const time = format(new Date(entry.timestamp), 'HH:mm:ss');
        return `[${time}] ${entry.message}`;
      })
      .join('\n');
    
    navigator.clipboard.writeText(logText);
  };

  const handleClearLog = () => {
    if (activeCampaign && window.confirm('Are you sure you want to clear the session log?')) {
      clearLog(activeCampaign.id);
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'roll': return 'border-primary';
      case 'combat': return 'border-destructive';
      case 'exploration': return 'border-secondary';
      case 'system': return 'border-success';
      default: return 'border-border';
    }
  };

  const getCharacterColor = (characterId?: string) => {
    if (!characterId) return 'text-muted-foreground';
    // Simple hash to consistent color
    const hash = characterId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = ['text-primary', 'text-secondary', 'text-success', 'text-blue-400', 'text-purple-400'];
    return colors[Math.abs(hash) % colors.length];
  };

  if (!activeCampaign) {
    return (
      <aside className="lg:col-span-3 space-y-4" data-testid="session-log">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <Scroll className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active campaign</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="lg:col-span-3 space-y-4" data-testid="session-log">
      <div className="bg-card border border-border rounded-lg overflow-hidden sticky-panel">
        {/* Log Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Scroll className="h-5 w-5 text-primary" />
            Session Log
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-toggle-log"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {!isCollapsed && (
          <>
            {/* Log Entries */}
            <ScrollArea className="h-[calc(100vh-12rem)]" data-testid="log-entries">
              <div className="p-4 space-y-3">
                {activeCampaign.log.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No log entries yet</p>
                    <p className="text-muted-foreground text-xs">Start playing to see events here!</p>
                  </div>
                ) : (
                  [...activeCampaign.log].reverse().map((entry) => (
                    <div 
                      key={entry.id} 
                      className={`text-sm border-l-2 ${getEntryColor(entry.type)} pl-3 py-1`}
                      data-testid={`log-entry-${entry.type}`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {format(new Date(entry.timestamp), 'HH:mm:ss')}
                      </div>
                      <div className={`text-foreground ${entry.characterId ? getCharacterColor(entry.characterId) : ''}`}>
                        {entry.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Log Actions */}
            <div className="p-3 border-t border-border flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLog}
                className="flex-1"
                data-testid="button-copy-log"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLog}
                className="flex-1"
                data-testid="button-clear-log"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
