import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellRing, Camera, Edit2, Key, Save, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";

const Profile = () => {
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate avatar URL if provided
      if (formData.avatar && !/^https?:\/\//i.test(formData.avatar)) {
        toast({
          title: "Invalid avatar URL",
          description: "Avatar URL must start with http:// or https://",
          variant: "destructive"
        });
        return;
      }

      const updates = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        avatar: formData.avatar || null
      };

      await updateProfile(updates);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically upload the file to your storage service
      // and get back a URL. For now, we'll just show a success message.
      toast({
        title: "Avatar upload",
        description: "This feature is not implemented yet. Please provide an image URL instead.",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and update your profile information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={formData.avatar || undefined} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* <label 
                  htmlFor="avatar-upload" 
                  className="absolute -right-2 -bottom-2 bg-primary rounded-full p-1.5 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label> */}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
              
              <div className="w-full border-t pt-4 mt-2">
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">
                <User className="mr-2 h-4 w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="password">
                <Key className="mr-2 h-4 w-4" />
                Password
              </TabsTrigger>
              {/* <TabsTrigger value="notifications">
                <BellRing className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  {/* <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input 
                      id="avatar" 
                      type="url" 
                      value={formData.avatar}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div> */}
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button onClick={() => {
                      toast({
                        title: "Not implemented",
                        description: "Password change functionality is not implemented yet.",
                      });
                    }}>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* <TabsContent value="notifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Notification settings coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
