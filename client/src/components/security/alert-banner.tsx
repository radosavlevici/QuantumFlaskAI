import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AlertBanner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [visible, setVisible] = useState(true);
  
  const { data: alerts } = useQuery({
    queryKey: ['/api/security-alerts'],
  });

  const dismissAlert = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiRequest("POST", `/api/security-alerts/${alertId}/dismiss`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security-alerts'] });
      setVisible(false);
      toast({
        title: "Alert dismissed",
        description: "The security alert has been dismissed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss the alert. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDismiss = (alertId: number) => {
    dismissAlert.mutate(alertId);
  };

  // Only show the most recent unread alert
  const activeAlert = alerts?.find(alert => !alert.isRead);
  
  if (!activeAlert || !visible) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-5">
      <Alert className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <AlertTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-300 ml-2">
          Attention required
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm text-yellow-700 dark:text-yellow-200 ml-2">
          {activeAlert.message}
        </AlertDescription>
        <div className="mt-4 -mx-2 -my-1.5 flex">
          <Button
            variant="secondary"
            className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-700 border-0"
            onClick={() => {
              window.location.href = "/activity-log";
            }}
          >
            View details
          </Button>
          <Button
            variant="ghost"
            className="ml-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-800 border-0"
            onClick={() => handleDismiss(activeAlert.id)}
          >
            Dismiss
          </Button>
        </div>
      </Alert>
    </div>
  );
}
