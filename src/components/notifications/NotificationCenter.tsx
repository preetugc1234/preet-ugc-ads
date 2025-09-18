import { useState, useEffect } from "react";
import { Bell, Check, X, Eye, Download, CreditCard, Zap, AlertCircle, CheckCircle, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: string;
  type: 'job_ready' | 'job_completed' | 'credit_added' | 'payment_success' | 'low_credits' | 'system' | 'welcome' | 'eviction';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    jobId?: string;
    credits?: number;
    amount?: number;
    jobType?: string;
  };
}

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif_001",
      type: "job_completed",
      title: "Video Generation Complete!",
      message: "Your UGC video 'Product Demo' is ready for download.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
      actionUrl: "/dashboard/history",
      metadata: { jobId: "job_001", jobType: "ugc-video" }
    },
    {
      id: "notif_002",
      type: "credit_added",
      title: "Credits Added",
      message: "1,000 credits have been added to your account.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      actionUrl: "/dashboard/credits",
      metadata: { credits: 1000 }
    },
    {
      id: "notif_003",
      type: "job_ready",
      title: "Preview Ready",
      message: "Your image generation preview is now available.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: true,
      actionUrl: "/dashboard/image",
      metadata: { jobId: "job_002", jobType: "image" }
    },
    {
      id: "notif_004",
      type: "payment_success",
      title: "Payment Successful",
      message: "Your payment of $19.99 for the Starter plan has been processed.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      actionUrl: "/dashboard/billing",
      metadata: { amount: 19.99 }
    },
    {
      id: "notif_005",
      type: "low_credits",
      title: "Low Credits Warning",
      message: "You have only 50 credits remaining. Consider purchasing more.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
      actionUrl: "/dashboard/credits",
      metadata: { credits: 50 }
    },
    {
      id: "notif_006",
      type: "welcome",
      title: "Welcome to UGC AI Platform!",
      message: "Your account has been created successfully. Get started with 500 free credits!",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isRead: true,
      actionUrl: "/dashboard",
      metadata: { credits: 500 }
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification every 30 seconds (for demo)
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          type: Math.random() > 0.5 ? 'job_ready' : 'job_completed',
          title: Math.random() > 0.5 ? 'Generation Complete!' : 'Preview Ready',
          message: Math.random() > 0.5 ? 'Your AI generation has finished processing.' : 'Your preview is now available to view.',
          timestamp: new Date(),
          isRead: false,
          actionUrl: "/dashboard/history"
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [toast]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'job_ready':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'job_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'credit_added':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'payment_success':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'low_credits':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'system':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'welcome':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'eviction':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'job_ready':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'job_completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'credit_added':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'payment_success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'low_credits':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'system':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'welcome':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'eviction':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };

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
      description: "Your notification center has been cleared.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
      description: "Your notification history has been cleared.",
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <DropdownMenuHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs h-7 text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </DropdownMenuHeader>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-center">No notifications yet</p>
              <p className="text-gray-400 text-sm text-center mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md border ${
                      !notification.isRead
                        ? getNotificationColor(notification.type)
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Action buttons for specific notification types */}
                          {notification.type === 'job_completed' && (
                            <div className="flex space-x-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/dashboard/history");
                                  setIsOpen(false);
                                }}
                                className="h-7 text-xs"
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
                                className="h-7 text-xs"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          )}

                          {notification.type === 'low_credits' && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/dashboard/credits");
                                  setIsOpen(false);
                                }}
                                className="h-7 text-xs"
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Buy Credits
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate("/dashboard/notifications");
                setIsOpen(false);
              }}
              className="w-full text-sm"
            >
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;