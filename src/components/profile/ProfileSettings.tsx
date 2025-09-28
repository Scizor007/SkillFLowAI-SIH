import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Check, Loader2, Save, Trash, User, X, Shield, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const { updateUserProfile, loading } = useUser();
  const { isAdminMode, activateAdminMode, deactivateAdminMode } = useAdmin();
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const navigate = useNavigate();

  const profileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateUserProfile({
        ...user,
        name: values.name,
        skills: skills,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleDeleteAccount = async () => {
    toast('This is a demo feature. Account deletion would happen here.');
    await logout();
  };

  const handleAdminLogin = () => {
    const success = activateAdminMode(adminPassword);
    if (success) {
      setShowAdminDialog(false);
      navigate('/admin');
    }
  };

  const handleAdminLogout = () => {
    deactivateAdminMode();
    toast.info('Exited admin mode');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="account">Account Management</TabsTrigger>
          <TabsTrigger value="admin">Admin Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Email cannot be changed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 rounded-full hover:bg-destructive/20 h-4 w-4 inline-flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {skills.length === 0 && (
                        <p className="text-sm text-muted-foreground">No skills added yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <Button type="button" onClick={handleAddSkill} variant="outline" size="icon">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Sign Out</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out from your account on this device
                </p>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                Admin options for system management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAdminMode ? (
                <div>
                  <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium text-amber-700 dark:text-amber-400">Admin Mode Active</h3>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      You currently have administrator privileges. Use them responsibly.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => navigate('/admin')}
                      className="w-full"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Go to Admin Dashboard
                    </Button>
                    
                    <Button 
                      onClick={handleAdminLogout}
                      variant="outline"
                      className="w-full"
                    >
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Exit Admin Mode
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Admin access is restricted to authorized personnel only. If you are an administrator,
                    enter your admin password below to access administrative features.
                  </p>
                  
                  <Button 
                    onClick={() => setShowAdminDialog(true)}
                    variant="outline" 
                    className="w-full"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Request Admin Access
                  </Button>
                  
                  <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Admin Authentication</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter the admin password to gain administrative access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="admin-password">Admin Password</Label>
                        <Input 
                          id="admin-password"
                          type="password" 
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="mt-2"
                          placeholder="Enter admin password"
                          autoComplete="off"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setAdminPassword('');
                          setShowAdminDialog(false);
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleAdminLogin}>
                          Authenticate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
