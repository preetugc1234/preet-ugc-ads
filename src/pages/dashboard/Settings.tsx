import { useState } from "react";
import { User, Shield, Bell, Eye, EyeOff, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "@/components/dashboard/UserProfile";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

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

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-lg text-gray-600">
            Manage your account settings, security, and preferences
          </p>
        </div>

        {/* Modern Tab Switcher */}
        <div className="flex items-center space-x-2 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "security"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "notifications"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Notifications
          </button>
        </div>

        {/* Content with smooth transition */}
        <div className="transition-all duration-300">
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <UserProfile />
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Change Password */}
              <Card className="border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 text-2xl font-bold">
                    <Shield className="w-6 h-6 mr-3 text-blue-600" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-900 font-medium">Current Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-gray-900 font-medium">New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="border-gray-200 focus:border-blue-600 focus:ring-blue-600 mt-2"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-2xl font-bold">Two-Factor Authentication</CardTitle>
                  <p className="text-gray-600 mt-2">
                    Add an extra layer of security to your account
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Use your phone to verify your identity when signing in
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>

                  {twoFactorEnabled && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium">
                        Two-factor authentication is enabled. You'll be prompted for a verification code when signing in.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-red-600 text-2xl font-bold">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
                    <h4 className="font-bold text-red-900 mb-2 text-lg">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. This will permanently delete your account and all associated data.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Email Notifications */}
              <Card className="border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 text-2xl font-bold">
                    <Bell className="w-6 h-6 mr-3 text-blue-600" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600 mt-1">
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

                  <Separator className="bg-gray-200" />

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Security Alerts</p>
                      <p className="text-sm text-gray-600 mt-1">
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

                  <Separator className="bg-gray-200" />

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Billing Notifications</p>
                      <p className="text-sm text-gray-600 mt-1">
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

                  <Separator className="bg-gray-200" />

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Product Updates</p>
                      <p className="text-sm text-gray-600 mt-1">
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

              {/* Push Notifications */}
              <Card className="border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-2xl font-bold">Push Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Generation Complete</p>
                      <p className="text-sm text-gray-600 mt-1">
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

                  <Separator className="bg-gray-200" />

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Low Credits</p>
                      <p className="text-sm text-gray-600 mt-1">
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

                  <Separator className="bg-gray-200" />

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">System Maintenance</p>
                      <p className="text-sm text-gray-600 mt-1">
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
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
