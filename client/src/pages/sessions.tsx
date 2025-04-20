import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Computer, Smartphone, Tablet, Map, MapPin, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import SessionsTable from "@/components/security/sessions-table";

export default function Sessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/sessions'],
  });

  const terminateSession = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/terminate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setSelectedSession(null);
      toast({
        title: "Session terminated",
        description: "The session has been successfully terminated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const terminateAllSessions = useMutation({
    mutationFn: async () => {
      // Find current session
      const currentSession = sessions?.find(s => s.isCurrentSession);
      const currentSessionId = currentSession?.id;
      
      const res = await apiRequest("POST", "/api/sessions/terminate-all", { 
        currentSessionId 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "All sessions terminated",
        description: "All other sessions have been successfully terminated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to terminate all sessions. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleTerminate = (sessionId: number) => {
    terminateSession.mutate(sessionId);
  };

  const handleTerminateAll = () => {
    terminateAllSessions.mutate();
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Computer className="h-5 w-5" />;
    }
  };

  const getSessionById = (id: number) => {
    return sessions?.find(session => session.id === id);
  };

  const selectedSessionData = selectedSession ? getSessionById(selectedSession) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <SessionsTable />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>View detailed information about your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                  </div>
                </div>
              ) : !selectedSessionData ? (
                <div className="text-center py-10 border rounded-md border-dashed border-gray-300 dark:border-gray-700">
                  <Computer className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No session selected</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    Select a session from the table above to view detailed information about the device and location.
                  </p>
                </div>
              ) : (
                <div>
                  <div className={`p-4 mb-4 flex items-center rounded-md ${
                    selectedSessionData.isCurrentSession
                      ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"
                      : selectedSessionData.isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}>
                    <div className="mr-4">
                      {getDeviceIcon(selectedSessionData.deviceType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {selectedSessionData.deviceName}
                        {selectedSessionData.isCurrentSession && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 py-0.5 px-2 rounded-full">
                            Current Session
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedSessionData.browser} on {selectedSessionData.operatingSystem}
                      </p>
                    </div>
                    <div>
                      {selectedSessionData.isActive ? (
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactive
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location Information
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedSessionData.location}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">IP Address: {selectedSessionData.ipAddress}</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <Clock className="mr-2 h-4 w-4" />
                        Activity Timeline
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Last active: {formatDistanceToNow(new Date(selectedSessionData.lastActiveAt), { addSuffix: true })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Session started: {formatDistanceToNow(new Date(selectedSessionData.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md md:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          <Shield className="mr-2 h-4 w-4" />
                          Session Actions
                        </div>
                        {!selectedSessionData.isCurrentSession && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTerminate(selectedSessionData.id)}
                            disabled={terminateSession.isPending}
                          >
                            {terminateSession.isPending ? "Terminating..." : "Terminate Session"}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedSessionData.isCurrentSession
                          ? "This is your current session. You cannot terminate it from here."
                          : "Terminating this session will log out the device and require re-authentication."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Security</CardTitle>
            <CardDescription>Manage and secure your account access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Session Management Tips</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1 ml-5 list-disc">
                <li>Regularly review your active sessions</li>
                <li>Terminate sessions from unknown locations</li>
                <li>Sign out from devices you no longer use</li>
                <li>Enable two-factor authentication for additional security</li>
              </ul>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium mb-3">Current Sessions Summary</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    ))}
                  </div>
                ) : sessions ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Active sessions:</span>
                      <span className="font-medium">{sessions.filter(s => s.isActive).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Desktop devices:</span>
                      <span className="font-medium">{sessions.filter(s => s.deviceType === 'desktop' && s.isActive).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Mobile devices:</span>
                      <span className="font-medium">{sessions.filter(s => s.deviceType === 'mobile' && s.isActive).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tablet devices:</span>
                      <span className="font-medium">{sessions.filter(s => s.deviceType === 'tablet' && s.isActive).length}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No session data available</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium mb-3">Actions</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => handleTerminateAll()}
                  disabled={!sessions || sessions.length <= 1 || terminateAllSessions.isPending}
                >
                  {terminateAllSessions.isPending 
                    ? "Terminating..."
                    : "Terminate All Other Sessions"
                  }
                </Button>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => window.location.href = '/settings'}
                >
                  Configure Security Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}
