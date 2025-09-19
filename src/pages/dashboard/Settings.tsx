import { useState } from "react";
import { User, Shield, Bell, Key, Trash2, Eye, EyeOff, Copy, Plus, Settings as SettingsIcon } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "@/components/dashboard/UserProfile";

const Settings = () => {
  const { toast } = useToast();


  // Security State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState({
    email: {
      marketing: true,
      security: true,
      billing: true,
      product: false
    },
    push: {
      generations: true,
      credits: true,
      system: true
    }
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key_001",
      name: "Production API",
      key: "ak_live_1234567890abcdef",
      created: "2024-01-15",
      lastUsed: "2024-01-20",
      permissions: ["read", "write"]
    },
    {
      id: "key_002",
      name: "Development API",
      key: "ak_test_abcdef1234567890",
      created: "2024-01-10",
      lastUsed: "2024-01-19",
      permissions: ["read"]
    }
  ]);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});


  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });

    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Account deletion request initiated. Check your email for confirmation.",
      variant: "destructive"
    });
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const handleCreateApiKey = () => {
    const newKey = {
      id: `key_${Date.now()}`,
      name: "New API Key",
      key: `ak_live_${Math.random().toString(36).substr(2, 16)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      permissions: ["read"]
    };

    setApiKeys([...apiKeys, newKey]);
    toast({
      title: "API Key Created",
      description: "New API key has been generated successfully.",
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast({
      title: "API Key Deleted",
      description: "API key has been permanently deleted.",
      variant: "destructive"
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + "•".repeat(16) + key.substring(24);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings, security, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                </div>

                <Button onClick={handlePasswordChange}>
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      Use your phone to verify your identity when signing in
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                {twoFactorEnabled && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Two-factor authentication is enabled. You'll be prompted for a verification code when signing in.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Once you delete your account, there is no going back. This will permanently delete your account and all associated data.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-500">
                      Product updates, tips, and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: { ...notifications.email, marketing: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-gray-500">
                      Login attempts and security-related notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.security}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: { ...notifications.email, security: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Billing Notifications</p>
                    <p className="text-sm text-gray-500">
                      Payment receipts and billing updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.billing}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: { ...notifications.email, billing: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-gray-500">
                      New features and platform improvements
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.product}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: { ...notifications.email, product: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Generation Complete</p>
                    <p className="text-sm text-gray-500">
                      Notify when AI generations are finished
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.generations}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push: { ...notifications.push, generations: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Credits</p>
                    <p className="text-sm text-gray-500">
                      Alert when credits are running low
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.credits}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push: { ...notifications.push, credits: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Maintenance</p>
                    <p className="text-sm text-gray-500">
                      Important system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.system}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push: { ...notifications.push, system: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      API Keys
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your API keys for programmatic access
                    </p>
                  </div>
                  <Button onClick={handleCreateApiKey}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(apiKey.created).toLocaleDateString()} •
                          Last used: {apiKey.lastUsed}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Input
                        value={showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyApiKey(apiKey.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No API keys yet</p>
                    <p className="text-sm text-gray-400">
                      Create your first API key to start using the platform programmatically
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    API Key Security
                  </h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Keep your API keys secure and never share them publicly</li>
                    <li>• Use different keys for development and production</li>
                    <li>• Regularly rotate your keys for better security</li>
                    <li>• Monitor usage patterns for unauthorized access</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;