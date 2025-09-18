import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  CreditCard,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Gift,
  Settings,
  Database,
  Server,
  Monitor,
  LogOut,
  Trash2,
  RefreshCw,
  Bell
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [giftCredits, setGiftCredits] = useState({ userId: "", amount: "", reason: "" });

  // Check admin authentication
  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) {
      navigate("/secure-access-portal");
      return;
    }

    const session = JSON.parse(adminSession);
    if (!session.authenticated || Date.now() > session.expires) {
      localStorage.removeItem("admin_session");
      navigate("/secure-access-portal");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    toast({
      title: "Logged Out",
      description: "Admin session terminated",
    });
    navigate("/");
  };

  // Mock admin data - replace with real API calls
  const [adminStats] = useState({
    totalUsers: 12547,
    activeUsers: 8934,
    totalRevenue: 45678.90,
    monthlyRevenue: 12345.67,
    creditsIssued: 2500000,
    jobsCompleted: 156789,
    systemHealth: 98.5,
    errorRate: 0.02
  });

  const [recentUsers] = useState([
    { id: "1", name: "John Doe", email: "john@example.com", plan: "Pro", credits: 1250, joinedAt: "2024-01-15" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", plan: "Free", credits: 500, joinedAt: "2024-01-14" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", plan: "Pro", credits: 890, joinedAt: "2024-01-13" },
  ]);

  const [systemLogs] = useState([
    { timestamp: "2024-01-15 14:30", level: "INFO", message: "User registration: john@example.com" },
    { timestamp: "2024-01-15 14:25", level: "WARN", message: "High API usage detected from IP: 192.168.1.100" },
    { timestamp: "2024-01-15 14:20", level: "ERROR", message: "Payment webhook failed: order_xyz123" },
    { timestamp: "2024-01-15 14:15", level: "INFO", message: "Credits gifted: 1000 to user_456" },
  ]);

  const handleGiftCredits = () => {
    if (!giftCredits.userId || !giftCredits.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    toast({
      title: "Credits Gifted",
      description: `Successfully gifted ${giftCredits.amount} credits to user ${giftCredits.userId}`,
    });

    setGiftCredits({ userId: "", amount: "", reason: "" });
  };

  const menuItems = [
    { id: "overview", name: "Overview", icon: Monitor },
    { id: "users", name: "Users", icon: Users },
    { id: "billing", name: "Billing", icon: CreditCard },
    { id: "system", name: "System", icon: Server },
    { id: "logs", name: "Logs", icon: Activity },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                System Control Panel
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrator Dashboard - Classified Access
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Admin Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 ${
                  activeTab === item.id
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {adminStats.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {adminStats.activeUsers.toLocaleString()} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${adminStats.monthlyRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +23% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    System Health
                  </CardTitle>
                  <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {adminStats.systemHealth}%
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Jobs Completed
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {adminStats.jobsCompleted.toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    +1,234 today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gift Credits Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-purple-500" />
                  <span>Gift Credits to User</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="userId">User ID or Email</Label>
                    <Input
                      id="userId"
                      value={giftCredits.userId}
                      onChange={(e) => setGiftCredits(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID or email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Credits Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={giftCredits.amount}
                      onChange={(e) => setGiftCredits(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      value={giftCredits.reason}
                      onChange={(e) => setGiftCredits(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for gift"
                    />
                  </div>
                </div>
                <Button onClick={handleGiftCredits} className="mt-4">
                  <Gift className="w-4 h-4 mr-2" />
                  Gift Credits
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Plan</th>
                      <th className="text-left p-2">Credits</th>
                      <th className="text-left p-2">Joined</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          <Badge variant={user.plan === "Pro" ? "default" : "secondary"}>
                            {user.plan}
                          </Badge>
                        </td>
                        <td className="p-2">{user.credits.toLocaleString()}</td>
                        <td className="p-2">{user.joinedAt}</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Gift className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "logs" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                System Logs
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemLogs.map((log, index) => (
                  <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-xs text-gray-500 w-32">{log.timestamp}</span>
                    <Badge
                      variant={
                        log.level === "ERROR" ? "destructive" :
                        log.level === "WARN" ? "secondary" : "default"
                      }
                      className="w-16 justify-center"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-sm flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;