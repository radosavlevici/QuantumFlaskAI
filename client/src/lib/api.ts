import { apiRequest } from "@/lib/queryClient";

interface ApiOptions {
  method?: string;
  data?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * A simple wrapper around apiRequest to handle common API call patterns
 * @param url The URL to call
 * @param options Options for the API call
 * @returns A promise that resolves to the response data
 */
export async function callApi(url: string, options: ApiOptions = {}) {
  const { method = "GET", data, onSuccess, onError } = options;
  
  try {
    const response = await apiRequest(method, url, data);
    const responseData = await response.json();
    
    if (onSuccess) {
      onSuccess(responseData);
    }
    
    return responseData;
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
}

/**
 * Utility function to handle image uploads
 * @param file The file to upload
 * @returns A promise that resolves to the upload response
 */
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  
  return response.json();
}

/**
 * API methods for security dashboard functionality
 */
export const securityApi = {
  // Dashboard data
  getDashboardSummary: () => callApi("/api/dashboard/summary"),
  
  // Security events
  getSecurityEvents: (limit?: number) => 
    callApi(limit ? `/api/security-events?limit=${limit}` : "/api/security-events"),
  createSecurityEvent: (data: any) => 
    callApi("/api/security-events", { method: "POST", data }),
  
  // Security alerts
  getSecurityAlerts: () => callApi("/api/security-alerts"),
  dismissAlert: (id: number) => 
    callApi(`/api/security-alerts/${id}/dismiss`, { method: "POST" }),
  
  // Sessions
  getSessions: () => callApi("/api/sessions"),
  terminateSession: (id: number) => 
    callApi(`/api/sessions/${id}/terminate`, { method: "POST" }),
  terminateAllSessions: (currentSessionId?: number) => 
    callApi("/api/sessions/terminate-all", { 
      method: "POST", 
      data: { currentSessionId } 
    }),
  
  // Passwords
  getPasswords: () => callApi("/api/passwords"),
  createPassword: (data: any) => 
    callApi("/api/passwords", { method: "POST", data }),
  updatePassword: (id: number, data: any) => 
    callApi(`/api/passwords/${id}`, { method: "PUT", data }),
  deletePassword: (id: number) => 
    callApi(`/api/passwords/${id}`, { method: "DELETE" }),
  
  // Recommendations
  getRecommendations: () => callApi("/api/recommendations"),
  updateRecommendation: (id: number, data: any) => 
    callApi(`/api/recommendations/${id}`, { method: "PUT", data }),
};

export default {
  callApi,
  uploadFile,
  securityApi
};
