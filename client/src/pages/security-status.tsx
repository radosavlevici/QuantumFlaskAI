import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SecurityRecommendations from "@/components/security/security-recommendations";
import SecurityCard from "@/components/security/security-card";
import { Shield, AlertTriangle, Check } from "lucide-react";

export default function SecurityStatus() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
  });
  
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/recommendations'],
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };
  
  const completedRecommendations = recommendations?.filter(r => r.isCompleted).length || 0;
  const totalRecommendations = recommendations?.length || 0;
  const completionPercentage = totalRecommendations > 0 
    ? Math.round((completedRecommendations / totalRecommendations) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Security Score Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-6">
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(summary?.securityScore || 0)}`}>
                      {summaryLoading ? "..." : summary?.securityScore}
                    </span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="2"
                      className="dark:stroke-gray-700"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${summary?.securityScore || 0}, 100`}
                      className={getScoreColor(summary?.securityScore || 0)}
                    />
                  </svg>
                </div>
                <Badge className={`${
                  summary?.securityScore >= 80 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                    : summary?.securityScore >= 60
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                }`}>
                  {getScoreText(summary?.securityScore || 0)}
                </Badge>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Recommendations</h3>
                  <div className="flex items-center">
                    <Progress 
                      value={completionPercentage} 
                      className="h-2 flex-1" 
                    />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {completedRecommendations}/{totalRecommendations}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="text-sm font-medium">Strong Password</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Your primary password is strong</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {summary?.weakPasswords > 0 ? (
                      <AlertTriangle className="mt-0.5 mr-2 h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium">Password Health</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {summary?.weakPasswords > 0 
                          ? `${summary.weakPasswords} weak passwords found` 
                          : "All passwords are strong"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {!recommendations?.some(r => r.type === '2fa' && r.isCompleted) ? (
                      <AlertTriangle className="mt-0.5 mr-2 h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {!recommendations?.some(r => r.type === '2fa' && r.isCompleted)
                          ? "Not enabled"
                          : "Enabled"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {!recommendations?.some(r => r.type === 'recovery' && r.isCompleted) ? (
                      <AlertTriangle className="mt-0.5 mr-2 h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium">Recovery Methods</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {!recommendations?.some(r => r.type === 'recovery' && r.isCompleted)
                          ? "Not configured"
                          : "Configured"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Recommendations */}
        <SecurityRecommendations />
        
        {/* Additional Security Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SecurityCard
            title="Security Alerts"
            value={summaryLoading ? "Loading..." : `${summary?.alerts} active alert${summary?.alerts !== 1 ? 's' : ''}`}
            icon={AlertTriangle}
            iconColor="red"
            actionText="View alerts"
            actionHref="/activity-log"
          />
          
          <SecurityCard
            title="Account Recovery"
            value={recommendations?.some(r => r.type === 'recovery' && r.isCompleted) ? "Configured" : "Not Set Up"}
            icon={Shield}
            iconColor="purple"
            actionText="Configure recovery"
            actionHref="/settings"
          />
          
          <SecurityCard
            title="Security Notifications"
            value="Enabled"
            icon={Shield}
            iconColor="blue"
            actionText="Manage notifications"
            actionHref="/settings"
          />
        </div>
      </div>
    </div>
  );
}
