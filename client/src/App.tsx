import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SecurityStatus from "@/pages/security-status";
import ActivityLog from "@/pages/activity-log";
import PasswordManager from "@/pages/password-manager";
import Sessions from "@/pages/sessions";
import Settings from "@/pages/settings";
import DashboardLayout from "@/components/layout/dashboard-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/security-status" component={SecurityStatus} />
      <Route path="/activity-log" component={ActivityLog} />
      <Route path="/password-manager" component={PasswordManager} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <DashboardLayout>
          <Router />
        </DashboardLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
