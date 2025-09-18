import { useState } from "react";
import { Bell, Check, Filter, Search, Trash2, Eye, Download, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/components/notifications/NotificationCenter";

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      jobCompleted: true,
      jobReady: true,
      creditAdded: true,
      lowCredits: true,
      paymentSuccess: true,
      system: true
    },
    push: {
      jobCompleted: true,
      jobReady: true,
      creditAdded: false,
      lowCredits: true,
      paymentSuccess: false,
      system: true
    },
    frequency: "immediate" // immediate, daily, weekly
  });

  // Extended notification list for full page view
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif_001",
      type: "job_completed",
      title: "Video Generation Complete!",
      message: "Your UGC video 'Product Demo' is ready for download. The final version includes high-quality rendering and custom audio synchronization.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      actionUrl: "/dashboard/history",
      metadata: { jobId: "job_001", jobType: "ugc-video" }
    },
    {
      id: "notif_002",
      type: "credit_added",
      title: "Credits Added to Your Account",
      message: "1,000 credits have been successfully added to your account. Your new balance is 1,753 credits.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      actionUrl: "/dashboard/credits",
      metadata: { credits: 1000 }
    },
    {
      id: "notif_003",
      type: "job_ready",
      title: "Image Generation Preview Ready",
      message: "Your AI-generated image preview is now available for review. You can view the preview and generate the final version.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/dashboard/image",
      metadata: { jobId: "job_002", jobType: "image" }
    },
    {
      id: "notif_004",
      type: "payment_success",
      title: "Payment Processed Successfully",
      message: "Your payment of $19.99 for the Starter plan has been processed. Your subscription is now active and 2,000 monthly credits have been added.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/dashboard/billing",
      metadata: { amount: 19.99 }
    },
    {
      id: "notif_005",
      type: "low_credits",
      title: "Low Credits Warning",
      message: "You have only 50 credits remaining in your account. Consider purchasing additional credits or upgrading your plan to continue using our services.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/dashboard/credits",
      metadata: { credits: 50 }
    },
    {
      id: "notif_006",
      type: "system",
      title: "System Maintenance Scheduled",
      message: "We'll be performing scheduled maintenance on our servers this Sunday from 2:00 AM to 4:00 AM UTC. Some services may be temporarily unavailable.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/dashboard"
    },
    {
      id: "notif_007",
      type: "welcome",
      title: "Welcome to UGC AI Platform!",
      message: "Your account has been created successfully. You've received 500 free starter credits to explore our AI-powered content creation tools. Start by trying our image generation or text-to-speech features.",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/dashboard",
      metadata: { credits: 500 }
    },
    {
      id: "notif_008",
      type: "eviction",
      title: "History Item Removed",
      message: "Your oldest generation has been automatically removed to keep your history under the 30-item limit. The removed item was an image generation from last month.",
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/dashboard/history"
    }
  ]);

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'job_ready':
        return <Eye className={`${iconClass} text-blue-500`} />;
      case 'job_completed':
        return <Check className={`${iconClass} text-green-500`} />;
      case 'credit_added':
        return <Bell className={`${iconClass} text-purple-500`} />;
      case 'payment_success':
        return <Check className={`${iconClass} text-green-500`} />;
      case 'low_credits':
        return <Bell className={`${iconClass} text-orange-500`} />;
      case 'system':
        return <Settings className={`${iconClass} text-blue-500`} />;
      case 'welcome':
        return <Bell className={`${iconClass} text-purple-500`} />;
      case 'eviction':
        return <Trash2 className={`${iconClass} text-yellow-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || notification.type === filterType;

    const matchesStatus = filterStatus === "all" ||
                         (filterStatus === "unread" && !notification.isRead) ||
                         (filterStatus === "read" && notification.isRead);

    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "Your notification center has been updated.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
      description: "Your notification history has been cleared.",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const updateNotificationSetting = (category: 'email' | 'push', setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));

    toast({
      title: "Settings updated",
      description: `${category} notifications for ${setting} have been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your notifications and preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-sm">
              {unreadCount} unread
            </Badge>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} size="sm">
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="job_completed">Job Completed</SelectItem>
                      <SelectItem value="job_ready">Preview Ready</SelectItem>
                      <SelectItem value="credit_added">Credits Added</SelectItem>
                      <SelectItem value="payment_success">Payment Success</SelectItem>
                      <SelectItem value="low_credits">Low Credits</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={clearAllNotifications}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      No notifications found
                    </h3>
                    <p className="text-gray-500 text-center">
                      {searchQuery || filterType !== "all" || filterStatus !== "all"
                        ? "Try adjusting your filters to see more notifications."
                        : "You're all caught up! New notifications will appear here."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {notification.type === 'job_completed' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate("/dashboard/history");
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast({
                                        title: "Download Started",
                                        description: "Your file is being downloaded...",
                                      });
                                    }}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose how you want to receive notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h4 className="font-medium mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Job Completed</Label>
                        <p className="text-sm text-gray-500">When your AI generations are finished</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.jobCompleted}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'jobCompleted', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Preview Ready</Label>
                        <p className="text-sm text-gray-500">When preview versions are available</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.jobReady}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'jobReady', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Credits Added</Label>
                        <p className="text-sm text-gray-500">When credits are added to your account</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.creditAdded}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'creditAdded', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Low Credits Warning</Label>
                        <p className="text-sm text-gray-500">When your credit balance is running low</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.lowCredits}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'lowCredits', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Payment Success</Label>
                        <p className="text-sm text-gray-500">Payment confirmations and receipts</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.paymentSuccess}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'paymentSuccess', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">System Updates</Label>
                        <p className="text-sm text-gray-500">Important system announcements and maintenance</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.system}
                        onCheckedChange={(checked) => updateNotificationSetting('email', 'system', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push Notifications */}
                <div>
                  <h4 className="font-medium mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Job Completed</Label>
                        <p className="text-sm text-gray-500">Browser notifications for completed jobs</p>
                      </div>
                      <Switch
                        checked={notificationSettings.push.jobCompleted}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'jobCompleted', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Preview Ready</Label>
                        <p className="text-sm text-gray-500">Instant notifications for previews</p>
                      </div>
                      <Switch
                        checked={notificationSettings.push.jobReady}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'jobReady', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Low Credits Warning</Label>
                        <p className="text-sm text-gray-500">Alert when credits are running low</p>
                      </div>
                      <Switch
                        checked={notificationSettings.push.lowCredits}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'lowCredits', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">System Updates</Label>
                        <p className="text-sm text-gray-500">Critical system notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.push.system}
                        onCheckedChange={(checked) => updateNotificationSetting('push', 'system', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Frequency Settings */}
                <div>
                  <h4 className="font-medium mb-4">Notification Frequency</h4>
                  <Select value={notificationSettings.frequency} onValueChange={(value) => setNotificationSettings(prev => ({...prev, frequency: value}))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    Choose how often you want to receive notification emails
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;