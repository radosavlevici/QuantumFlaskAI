import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, MessageSquare, Shield, Bell, Key, Lock, Smartphone } from "lucide-react";

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).refine(password => {
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  }, {
    message: "Password must include at least one uppercase letter, one lowercase letter, and one number.",
  }),
  confirmPassword: z.string().min(1, {
    message: "Please confirm your password.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const changePassword = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  });

  // Update default form values when user data is loaded
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePassword.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Update your account profile details
                    </p>
                  </div>
                  
                  {userLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
                    </div>
                  ) : (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={updateProfile.isPending}>
                          {updateProfile.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </TabsContent>
                
                <TabsContent value="security" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Security Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your password and security preferences
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-sm font-medium mb-2">Change Password</h4>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Must be at least 8 characters and include uppercase, lowercase, and numbers.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" disabled={changePassword.isPending}>
                            {changePassword.isPending ? "Changing..." : "Change Password"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Set Up</Button>
                      </div>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Recovery Options</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Set up recovery methods in case you lose access
                          </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                    </div>
                    
                    <div className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Session Management</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            View and manage your active sessions
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => window.location.href = '/sessions'}>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Notification Preferences</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose how you want to be notified about security events
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="text-sm font-medium">Security Alerts</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get notified about suspicious activities
                          </p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="text-sm font-medium">New Device Logins</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Notify when someone logs in from a new device
                          </p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="text-sm font-medium">Password Changes</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get alerted when your password is changed
                          </p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <Key className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="text-sm font-medium">Password Expiry</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Notify when passwords are about to expire
                          </p>
                        </div>
                      </div>
                      <Switch checked={false} />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium mb-3">Notification Channels</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Email Notifications</span>
                          </div>
                          <Switch checked={true} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">SMS Notifications</span>
                          </div>
                          <Switch checked={false} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Browser Notifications</span>
                          </div>
                          <Switch checked={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              {userLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="space-y-2 mt-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Overall Security</span>
                      <span className="text-sm font-medium">{user?.securityScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          user?.securityScore >= 80 
                            ? "bg-green-500" 
                            : user?.securityScore >= 60 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                        }`} 
                        style={{ width: `${user?.securityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      <span>Strong password active</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className={`h-4 w-4 mr-2 ${
                        false ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>Two-factor authentication: {false ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className={`h-4 w-4 mr-2 ${
                        false ? "text-green-500" : "text-yellow-500"
                      }`} />
                      <span>Recovery email: {false ? "Set up" : "Not configured"}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("security")}>
                Improve Security
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Recovery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recovery-email">Recovery Email</Label>
                  <div className="flex mt-1.5">
                    <Input 
                      id="recovery-email" 
                      placeholder="backup@example.com" 
                      className="rounded-r-none"
                    />
                    <Button className="rounded-l-none">Save</Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="recovery-phone">Phone Number</Label>
                  <div className="flex mt-1.5">
                    <Input 
                      id="recovery-phone" 
                      placeholder="+1 (555) 123-4567" 
                      className="rounded-r-none"
                    />
                    <Button className="rounded-l-none">Save</Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Generate Recovery Codes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
