import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import CreateRound from "@/pages/create-round";
import Scorecard from "@/pages/scorecard";
import Results from "@/pages/results";
import Analytics from "@/pages/analytics";
import GolfScorecardPage from "@/pages/golf-scorecard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-round" component={CreateRound} />
      <Route path="/scorecard" component={Scorecard} />
      <Route path="/golf-scorecard" component={GolfScorecardPage} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/results" component={Results} />
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
