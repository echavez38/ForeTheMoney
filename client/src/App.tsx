import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import CreateRound from "@/pages/create-round";
import Scorecard from "@/pages/scorecard";
import Results from "@/pages/results";
import RoundDebrief from "@/pages/round-debrief";
import Analytics from "@/pages/analytics";
import GolfScorecardPage from "@/pages/golf-scorecard";
import MultiplayerLobby from "@/pages/multiplayer-lobby";
import Subscription from "@/pages/subscription";
import Settings from "@/pages/settings";
import GolfHub from "@/pages/golf-hub";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-round" component={CreateRound} />
      <Route path="/scorecard" component={Scorecard} />
      <Route path="/golf-scorecard" component={GolfScorecardPage} />
      <Route path="/multiplayer" component={MultiplayerLobby} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/settings" component={Settings} />
      <Route path="/golf-hub" component={GolfHub} />
      <Route path="/results" component={Results} />
      <Route path="/round-debrief" component={RoundDebrief} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-dark-bg text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
