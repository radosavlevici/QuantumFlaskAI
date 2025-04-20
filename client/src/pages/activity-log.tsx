import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, LogIn, KeyRound, Smartphone, Search, Filter } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";

export default function ActivityLog() {
  const [eventType, setEventType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['/api/security-events'],
  });
  
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/security-alerts'],
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

  const getEventTitle = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{severity}</Badge>;
    }
  };

  const filteredEvents = events?.filter(event => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      event.eventType.includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery);
    
    // Filter by event type
    const matchesType = eventType === null || event.eventType === eventType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <TabsList>
                <TabsTrigger value="all">All Activity</TabsTrigger>
                <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search activity..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Select value={eventType || ""} onValueChange={(value) => setEventType(value || null)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="failed_login">Failed login</SelectItem>
                      <SelectItem value="password_change">Password change</SelectItem>
                      <SelectItem value="new_device">New device</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="p-0 border-0">
              {isLoading ? (
                <div className="animate-pulse space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents && filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map(event => {
                    const { icon: Icon, bgClass, iconClass } = getEventIcon(event.eventType);
                    
                    return (
                      <div key={event.id} className="flex p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${iconClass}`} />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {getEventTitle(event.eventType)}
                            {event.status === 'failed' && (
                              <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                Failed
                              </Badge>
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            IP: {event.ipAddress} | Location: {event.location} | Device: {event.deviceInfo}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(event.timestamp)} ({formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })})
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">No activities found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try changing your filters or search query
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="alerts" className="p-0 border-0">
              {alertsLoading ? (
                <div className="animate-pulse space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`flex p-4 border rounded-md transition-colors ${alert.isRead ? 'border-gray-200 dark:border-gray-700' : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'}`}>
                      <div className={`h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center`}>
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.alertType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </h3>
                          <div className="ml-2">
                            {getSeverityBadge(alert.severity)}
                          </div>
                          {!alert.isRead && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {alert.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(alert.timestamp)} ({formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">No security alerts</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You don't have any security alerts at this time
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
