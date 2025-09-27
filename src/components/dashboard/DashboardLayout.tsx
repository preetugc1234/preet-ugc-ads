import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Image,
  Video,
  AudioLines,
  Music,
  Film,
  History,
  CreditCard,
  Settings,
  Bell,
  BookOpen,
  Menu,
  X,
  Crown,
  User,
  LogOut,
  Moon,
  Sun,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Use real auth context
  const { user, signOut, loading } = useAuth();

  // Handle case where user is not loaded yet
  if (loading || !user) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Force navigation even if logout fails
      navigate('/');
    }
  };

  const toolsNavigation = [
    {
      name: "Chat",
      href: "/dashboard/chat",
      icon: MessageSquare,
      description: "AI Chat & Text Generation",
      credits: "Free"
    },
    {
      name: "Image",
      href: "/dashboard/image",
      icon: Image,
      description: "Text to Image Generation",
      credits: "Free"
    },
    {
      name: "Image→Video",
      href: "/dashboard/image-to-video",
      icon: Video,
      description: "Image to Video (No Audio)",
      credits: "100/5s"
    },
    {
      name: "Text→Speech",
      href: "/dashboard/text-to-speech",
      icon: AudioLines,
      description: "Text to Speech Generation",
      credits: "Free (Testing)"
    },
    {
      name: "UGC Video Gen",
      href: "/dashboard/ugc-video",
      icon: Film,
      description: "Audio→Video & Image→Video+Audio",
      credits: "Varies"
    }
  ];

  const mainNavigation = [
    {
      name: "History",
      href: "/dashboard/history",
      icon: History,
      description: "Your generated content"
    },
    {
      name: "Billing & Credits",
      href: "/dashboard/billing",
      icon: CreditCard,
      description: "Manage credits and subscriptions"
    }
  ];

  const adminNavigation = user.is_admin ? [
    {
      name: "Admin Panel",
      href: "/dashboard/admin",
      icon: Shield,
      description: "System administration"
    }
  ] : [];

  const isActive = (href: string) => location.pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo & Brand */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-semibold text-gray-900">
          makeugc
        </span>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-blue-600 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            <div className="flex items-center space-x-2">
              <Badge className="text-xs bg-blue-100 text-blue-600 border-0 rounded-full">
                <Crown className="w-3 h-3 mr-1" />
                {user.plan}
              </Badge>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Credits</span>
            <Link to="/dashboard/billing">
              <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                Buy More
              </Button>
            </Link>
          </div>
          <p className="text-xl font-bold text-gray-900">{user.credits.toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Tools Section */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            AI Tools
          </h3>
          <nav className="space-y-2">
            {toolsNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors group",
                    isActive(item.href)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs ml-2 border-0 rounded-full",
                          isActive(item.href)
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {item.credits}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Navigation */}
        <div className="px-4 py-4 border-t border-gray-100">
          <nav className="space-y-2">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                    isActive(item.href)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation */}
        {adminNavigation.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Administration
            </h3>
            <nav className="space-y-2">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                      isActive(item.href)
                        ? "bg-red-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Settings at Bottom */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/dashboard/settings"
          className={cn(
            "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors w-full",
            isActive("/dashboard/settings")
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={() => setSidebarOpen(false)}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-50 rounded-lg"
              >
                {isDark ? <Sun className="h-5 w-5 text-gray-600" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </Button>

              {/* Notifications */}
              <NotificationCenter />

              {/* Learning Center */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/learning")}
                className="p-2 hover:bg-gray-50 rounded-lg"
              >
                <BookOpen className="h-5 w-5 text-gray-600" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1 hover:bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/billing" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing & Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem onClick={handleLogout} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;