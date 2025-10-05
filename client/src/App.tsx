import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/Home";
import Character from "@/pages/Character";
import Exploration from "@/pages/Exploration";
import Combat from "@/pages/Combat";
import Items from "@/pages/Items";
import Stronghold from "@/pages/Stronghold";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Layout components
import { Header } from "@/components/layout/Header";

function Router() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/character/:id?" component={Character} />
        <Route path="/exploration" component={Exploration} />
        <Route path="/combat" component={Combat} />
        <Route path="/items" component={Items} />
        <Route path="/stronghold" component={Stronghold} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
