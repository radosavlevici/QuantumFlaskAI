import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, LogIn, KeyRound, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function ActivityTimeline() {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['/api/security-events', { limit: 4 }],
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'failed_login':
        return {
          icon: AlertCircle,
          bgClass: 'bg-red-100 dark:bg-red-900/30',
          iconClass: 'text-red-600 dark:text-red-400'
        };
      case 'login':
        return {
          icon: LogIn,
          bgClass: 'bg-green-100 dark:bg-green-900/30',
          iconClass: 'text-green-600 dark:text-green-400'
        };
      case 'password_change':
        return {
          icon: KeyRound,
          bgClass: 'bg-blue-100 dark:bg-blue-900/30',
          iconClass: 'text-blue-600 dark:text-blue-400'
        };
      case 'new_device':
        return {
          icon: Smartphone,
          bgClass: 'bg-gray-100 dark:bg-gray-700',
          iconClass: 'text-gray-600 dark:text-gray-400'
        };
      default:
        return {
          icon: AlertCircle,
          bgClass: 'bg-gray-100 dark:bg-gray-700',
          iconClass: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const getEventTitle = (eventType: string, status: string) => {
    switch (eventType) {
      case 'failed_login':
        return 'Failed login attempt';
      case 'login':
        return 'Successful login';
      case 'password_change':
        return 'Password changed';
      case 'new_device':
        return 'New device added';
      default:
        return eventType.replace('_', ' ');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg leading-6 font-medium">Recent Activity</CardTitle>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {events.map((event, index) => {
                const { icon: Icon, bgClass, iconClass } = getEventIcon(event.eventType);
                const isLast = index === events.length - 1;
                
                return (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></span>
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}>
                            <Icon className={`h-5 w-5 ${iconClass}`} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getEventTitle(event.eventType, event.status)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                              IP address: {event.ipAddress} ({event.location})
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {formatTimestamp(event.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No recent activity found</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="/activity-log" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
            View all activity
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
