import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Eye, EyeOff, Edit, Trash, Plus, Search, Shield, Key, AlertTriangle } from "lucide-react";

const passwordFormSchema = z.object({
  website: z.string().min(1, "Website is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  strength: z.enum(["strong", "medium", "weak"]),
  notes: z.string().optional(),
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function PasswordManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState<{[key: number]: boolean}>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: passwords, isLoading } = useQuery({
    queryKey: ['/api/passwords'],
  });

  const createPassword = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("POST", "/api/passwords", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: "Password saved",
        description: "Your password has been securely stored",
      });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updatePassword = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: PasswordFormValues }) => {
      const res = await apiRequest("PUT", `/api/passwords/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      setEditingPassword(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deletePassword = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/passwords/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passwords'] });
      toast({
        title: "Password deleted",
        description: "Your password has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      website: "",
      username: "",
      password: "",
      strength: "strong",
      notes: "",
    },
  });

  const editForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      website: "",
      username: "",
      password: "",
      strength: "strong",
      notes: "",
    },
  });

  const handleAddSubmit = (data: PasswordFormValues) => {
    createPassword.mutate(data);
  };

  const handleEditSubmit = (data: PasswordFormValues) => {
    if (editingPassword) {
      updatePassword.mutate({ id: editingPassword, data });
    }
  };

  const handleEdit = (password: any) => {
    setEditingPassword(password.id);
    editForm.reset({
      website: password.website,
      username: password.username,
      password: password.password,
      strength: password.strength,
      notes: password.notes || "",
    });
  };

  const handleDelete = (id: number) => {
    deletePassword.mutate(id);
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredPasswords = passwords?.filter(password => 
    password.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
    password.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case 'strong':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Strong</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Medium</Badge>;
      case 'weak':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">Weak</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div>
            <CardTitle className="text-xl">Password Manager</CardTitle>
            <CardDescription>Securely store and manage your passwords</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Password</DialogTitle>
                <DialogDescription>
                  Securely store your credentials for easy access.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username / Email</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword[-1] ? "text" : "password"} 
                              placeholder="Enter your password" 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => togglePasswordVisibility(-1)}
                            >
                              {showPassword[-1] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">
                                {showPassword[-1] ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Strength</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select password strength" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="strong">Strong</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="weak">Weak</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPassword.isPending}>
                      {createPassword.isPending ? "Saving..." : "Save Password"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md w-full"></div>
              ))}
            </div>
          ) : passwords && passwords.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Website</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPasswords?.map((password) => (
                    <TableRow key={password.id}>
                      <TableCell className="font-medium">{password.website}</TableCell>
                      <TableCell>{password.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">
                            {showPassword[password.id] ? password.password : "••••••••"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePasswordVisibility(password.id)}
                          >
                            {showPassword[password.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStrengthBadge(password.strength)}</TableCell>
                      <TableCell>{formatDate(password.lastUpdated)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Dialog open={editingPassword === password.id} onOpenChange={(open) => !open && setEditingPassword(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(password)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Password</DialogTitle>
                                <DialogDescription>
                                  Update your stored credentials.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                                  <FormField
                                    control={editForm.control}
                                    name="website"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="username"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Username / Email</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="password"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <Input 
                                              type={showPassword[-2] ? "text" : "password"} 
                                              {...field} 
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="absolute right-0 top-0 h-full px-3"
                                              onClick={() => togglePasswordVisibility(-2)}
                                            >
                                              {showPassword[-2] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                              <span className="sr-only">
                                                {showPassword[-2] ? "Hide password" : "Show password"}
                                              </span>
                                            </Button>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="strength"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Password Strength</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="strong">Strong</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="weak">Weak</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="notes"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            className="resize-none"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setEditingPassword(null)}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" disabled={updatePassword.isPending}>
                                      {updatePassword.isPending ? "Updating..." : "Update Password"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this password? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDelete(password.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md border-dashed border-gray-300 dark:border-gray-700">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No passwords saved</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                Add your first password to get started with secure password management.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Password Health</CardTitle>
            <CardDescription>Review and improve your password security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-md w-full"></div>
                  ))}
                </div>
              ) : passwords && passwords.length > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-300">
                        {passwords.filter(p => p.strength === 'weak').length} weak passwords detected
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300">
                      Fix Now
                    </Button>
                  </div>
                  
                  {passwords.filter(p => p.strength === 'weak').map(password => (
                    <div key={password.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{password.website}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{password.username}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">Weak</Badge>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <Shield className="inline-block h-4 w-4 mr-1" />
                      Tips for strong passwords:
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 ml-6 list-disc mt-1">
                      <li>Use at least 12 characters</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Add numbers and special characters</li>
                      <li>Don't reuse passwords across sites</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Shield className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Add passwords to see your password health analysis
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recently Updated</CardTitle>
            <CardDescription>Your most recently modified passwords</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-md w-full"></div>
                ))}
              </div>
            ) : passwords && passwords.length > 0 ? (
              <div className="space-y-2">
                {[...passwords]
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .slice(0, 5)
                  .map(password => (
                    <div key={password.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <Key className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{password.website}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Updated {formatDate(password.lastUpdated)}
                          </p>
                        </div>
                      </div>
                      {getStrengthBadge(password.strength)}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">
                  No password update history available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
