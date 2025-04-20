import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

export default function SecurityRecommendations() {
  const queryClient = useQueryClient();
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations'],
  });

  const updateRecommendation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number, isCompleted: boolean }) => {
      const res = await apiRequest("PUT", `/api/recommendations/${id}`, { isCompleted });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    }
  });

  const handleCheckboxChange = (id: number, isCompleted: boolean) => {
    updateRecommendation.mutate({ id, isCompleted });
  };

  const getActionText = (type: string) => {
    switch (type) {
      case '2fa':
        return 'Set up now';
      case 'password_update':
        return 'Review passwords';
      case 'recovery':
        return 'Configure now';
      case 'inactive_sessions':
        return 'Review sessions';
      default:
        return 'Configure';
    }
  };

  const getActionLink = (type: string) => {
    switch (type) {
      case '2fa':
        return '/settings';
      case 'password_update':
        return '/password-manager';
      case 'recovery':
        return '/settings';
      case 'inactive_sessions':
        return '/sessions';
      default:
        return '/';
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg leading-6 font-medium">Security Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-4 w-4 mt-1 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-5">
            {recommendations.map((recommendation, index) => (
              <div
                key={recommendation.id}
                className={`relative flex items-start ${
                  index < recommendations.length - 1 ? 'pb-4 border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center h-6">
                  <Checkbox
                    id={`rec-${recommendation.id}`}
                    checked={recommendation.isCompleted}
                    onCheckedChange={(checked) => {
                      handleCheckboxChange(recommendation.id, Boolean(checked));
                    }}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <Label 
                    htmlFor={`rec-${recommendation.id}`}
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    {recommendation.title}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {recommendation.description}
                  </p>
                  <Button 
                    size="sm"
                    className="mt-1"
                    onClick={() => window.location.href = getActionLink(recommendation.type)}
                  >
                    {getActionText(recommendation.type)}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No recommendations available</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="/security-status" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
            View all recommendations
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
