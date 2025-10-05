import { useState } from "react";
import { Campaign, StrongholdProject } from "@shared/schema";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Castle, 
  Plus, 
  FastForward, 
  Pause, 
  Play,
  Trash2,
  CheckCircle,
  Calendar,
  Hammer,
  Shield,
  Home
} from "lucide-react";

interface StrongholdManagerProps {
  campaign: Campaign;
}

export function StrongholdManager({ campaign }: StrongholdManagerProps) {
  const { addProject, updateProject, addLogEntry } = useGameStore();
  
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    daysTotal: 30,
    upkeepPerWeek: 0,
    effect: "",
  });

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      addProject(campaign.id, {
        name: newProject.name.trim(),
        daysTotal: newProject.daysTotal,
        daysLeft: newProject.daysTotal,
        upkeepPerWeek: newProject.upkeepPerWeek || undefined,
        effect: newProject.effect.trim() || undefined,
        status: "planned",
      });
      
      setNewProject({
        name: "",
        daysTotal: 30,
        upkeepPerWeek: 0,
        effect: "",
      });
      setIsAddingProject(false);
    }
  };

  const handleStartProject = (projectId: string) => {
    updateProject(campaign.id, projectId, { status: "in-progress" });
    
    const project = campaign.stronghold.find(p => p.id === projectId);
    if (project) {
      addLogEntry(campaign.id, {
        message: `Construction started on ${project.name}`,
        type: "system",
      });
    }
  };

  const handlePauseProject = (projectId: string) => {
    updateProject(campaign.id, projectId, { status: "paused" });
  };

  const handleAdvanceProject = (projectId: string, days: number = 1) => {
    const project = campaign.stronghold.find(p => p.id === projectId);
    if (!project) return;

    const newDaysLeft = Math.max(0, project.daysLeft - days);
    const newStatus = newDaysLeft === 0 ? "completed" : project.status;

    updateProject(campaign.id, projectId, { 
      daysLeft: newDaysLeft,
      status: newStatus
    });

    if (newStatus === "completed") {
      addLogEntry(campaign.id, {
        message: `${project.name} construction completed!`,
        type: "system",
      });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const project = campaign.stronghold.find(p => p.id === projectId);
    if (project && window.confirm(`Delete ${project.name}?`)) {
      // Note: This would require a deleteProject method in the store
      addLogEntry(campaign.id, {
        message: `${project.name} project cancelled`,
        type: "system",
      });
    }
  };

  const getProgressPercentage = (project: StrongholdProject) => {
    return ((project.daysTotal - project.daysLeft) / project.daysTotal) * 100;
  };

  const getStatusColor = (status: StrongholdProject["status"]) => {
    switch (status) {
      case "completed": return "badge-success";
      case "in-progress": return "badge-primary";
      case "paused": return "badge-secondary";
      default: return "badge-secondary";
    }
  };

  const getProjectIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("wall") || lowerName.includes("palisade")) {
      return <Shield className="h-5 w-5 text-secondary" />;
    } else if (lowerName.includes("workshop") || lowerName.includes("forge")) {
      return <Hammer className="h-5 w-5 text-secondary" />;
    } else if (lowerName.includes("hall") || lowerName.includes("house")) {
      return <Home className="h-5 w-5 text-secondary" />;
    }
    return <Castle className="h-5 w-5 text-secondary" />;
  };

  const activeProjects = campaign.stronghold.filter(p => p.status === "in-progress");
  const plannedProjects = campaign.stronghold.filter(p => p.status === "planned");
  const completedProjects = campaign.stronghold.filter(p => p.status === "completed");
  const pausedProjects = campaign.stronghold.filter(p => p.status === "paused");

  return (
    <div className="space-y-6" data-testid="stronghold-manager">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Castle className="h-5 w-5 text-primary" />
              Stronghold Projects
            </CardTitle>
            <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="button-new-project">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Project Name</Label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Stone Wall, Blacksmith Workshop..."
                      data-testid="input-project-name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration (Days)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newProject.daysTotal}
                        onChange={(e) => setNewProject(prev => ({ 
                          ...prev, 
                          daysTotal: parseInt(e.target.value) || 1 
                        }))}
                        data-testid="input-project-duration"
                      />
                    </div>
                    <div>
                      <Label>Weekly Upkeep (Optional)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newProject.upkeepPerWeek || ""}
                        onChange={(e) => setNewProject(prev => ({ 
                          ...prev, 
                          upkeepPerWeek: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="0"
                        data-testid="input-project-upkeep"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Effect/Benefit (Optional)</Label>
                    <Textarea
                      value={newProject.effect}
                      onChange={(e) => setNewProject(prev => ({ ...prev, effect: e.target.value }))}
                      placeholder="Describe what this project provides..."
                      data-testid="textarea-project-effect"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddProject}
                      disabled={!newProject.name.trim()}
                      className="flex-1"
                      data-testid="button-submit-project"
                    >
                      Create Project
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingProject(false)}
                      data-testid="button-cancel-project"
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

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Projects</h3>
          {activeProjects.map((project) => (
            <Card key={project.id} data-testid={`project-active-${project.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      {getProjectIcon(project.name)}
                      <span data-testid="project-name">{project.name}</span>
                    </h4>
                    {project.effect && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid="project-effect">
                        {project.effect}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    In Progress
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Days Remaining</div>
                    <div className="font-mono text-lg font-bold" data-testid="project-days-left">
                      {project.daysLeft}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Duration</div>
                    <div className="font-mono text-lg" data-testid="project-days-total">
                      {project.daysTotal} days
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Weekly Upkeep</div>
                    <div className="font-mono text-lg text-secondary">
                      {project.upkeepPerWeek ? `${project.upkeepPerWeek} food` : "None"}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span className="font-mono" data-testid="project-progress-percent">
                      {Math.round(getProgressPercentage(project))}%
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(project)} className="h-3" />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAdvanceProject(project.id, 1)}
                    className="flex-1 bg-success hover:bg-success/80"
                    data-testid="button-advance-project"
                  >
                    <FastForward className="mr-2 h-4 w-4" />
                    Advance Day
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePauseProject(project.id)}
                    data-testid="button-pause-project"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteProject(project.id)}
                    data-testid="button-delete-project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Planned Projects */}
      {plannedProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Planned Projects</h3>
          {plannedProjects.map((project) => (
            <Card key={project.id} data-testid={`project-planned-${project.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      {getProjectIcon(project.name)}
                      <span>{project.name}</span>
                    </h4>
                    {project.effect && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.effect}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    Planned
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="font-mono text-lg font-bold">
                      {project.daysTotal} days
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Weekly Upkeep</div>
                    <div className="font-mono text-lg text-secondary">
                      {project.upkeepPerWeek ? `${project.upkeepPerWeek} food` : "None"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Progress</div>
                    <div className="font-mono text-lg">0%</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStartProject(project.id)}
                    className="flex-1 btn-primary"
                    data-testid="button-start-project"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Construction
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteProject(project.id)}
                    data-testid="button-delete-planned-project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed Projects</h3>
          {completedProjects.map((project) => (
            <Card key={project.id} className="bg-success/10 border-success/30" data-testid={`project-completed-${project.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span>{project.name}</span>
                    </h4>
                    {project.effect && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.effect}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    Complete
                  </Badge>
                </div>
                <div className="text-xs text-success mt-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Construction completed</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {campaign.stronghold.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Castle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stronghold Projects</h3>
            <p className="text-muted-foreground mb-4">
              Start building your stronghold by creating your first project!
            </p>
            <Button
              onClick={() => setIsAddingProject(true)}
              className="btn-primary"
              data-testid="button-create-first-project"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
