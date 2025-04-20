import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Computer, Smartphone, Tablet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SessionsTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
        return <Smartphone className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />;
      case 'tablet':
        return <Tablet className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />;
      default:
        return <Computer className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (isActive: boolean, lastActiveAt: string) => {
    if (!isActive) return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
        Inactive
      </Badge>
    );

    const lastActiveDate = new Date(lastActiveAt);
    const hoursSinceLastActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastActive < 1) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
          Active
        </Badge>
      );
    } else if (hoursSinceLastActive < 24) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          Idle
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
          Dormant
        </Badge>
      );
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg leading-6 font-medium">Active Sessions</CardTitle>
        <CardDescription className="mt-1 max-w-2xl">
          Devices currently logged into your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 w-full mb-4 rounded"></div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 w-full mb-2 rounded"></div>
                    ))}
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Device
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sessions.map((session) => (
                        <tr key={session.id} className="bg-white dark:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              {getDeviceIcon(session.deviceType)}
                              {session.deviceName}
                              {session.isCurrentSession && (
                                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {session.location} ({session.ipAddress})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(session.isActive, session.lastActiveAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              disabled={session.isCurrentSession || terminateSession.isPending}
                              onClick={() => handleTerminate(session.id)}
                            >
                              Log out
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No active sessions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Button
            variant="ghost"
            className="font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
            disabled={!sessions || sessions.length <= 1 || terminateAllSessions.isPending}
            onClick={handleTerminateAll}
          >
            Log out of all sessions
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
