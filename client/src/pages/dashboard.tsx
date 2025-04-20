import { useQuery } from "@tanstack/react-query";
import SecurityCard from "@/components/security/security-card";
import ActivityTimeline from "@/components/security/activity-timeline";
import SecurityRecommendations from "@/components/security/security-recommendations";
import SessionsTable from "@/components/security/sessions-table";
import AlertBanner from "@/components/security/alert-banner";
import { Lock, Smartphone, KeyRound } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <AlertBanner />
      
      {/* Lock Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <SecurityCard
          title="Lock Score"
          value={isLoading ? "Loading..." : `${summary?.securityScore}/100`}
          icon={Lock}
          iconColor="green"
          actionText="View recommendations"
          actionHref="/security-status"
        />
        
        <SecurityCard
          title="Active Sessions"
          value={isLoading ? "Loading..." : `${summary?.activeSessions} device${summary?.activeSessions !== 1 ? 's' : ''}`}
          icon={Smartphone}
          iconColor="blue"
          actionText="Manage sessions"
          actionHref="/sessions"
        />
        
        <SecurityCard
          title="Password Health"
          value={isLoading ? "Loading..." : `${summary?.weakPasswords} password${summary?.weakPasswords !== 1 ? 's' : ''} need attention`}
          icon={KeyRound}
          iconColor="yellow"
          actionText="View password manager"
          actionHref="/password-manager"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity Timeline */}
        <ActivityTimeline />
        
        {/* Lock Recommendations */}
        <SecurityRecommendations />
      </div>
      
      {/* Active Sessions */}
      <div className="mb-6">
        <SessionsTable />
      </div>
    </div>
  );
}
