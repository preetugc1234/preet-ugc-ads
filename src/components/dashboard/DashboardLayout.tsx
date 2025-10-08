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
      {/* Logo & Brand - Compact */}
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-200">
        <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-base font-semibold text-gray-900">
          makeugc
        </span>
      </div>

      {/* Profile Section - Compact */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <Badge className="text-[10px] bg-blue-100 text-blue-600 border-0 rounded-full px-1.5 py-0">
              <Crown className="w-2.5 h-2.5 mr-0.5" />
              {user.plan}
            </Badge>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Credits</span>
            <Link to="/dashboard/billing">
              <Button size="sm" variant="ghost" className="h-5 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                Buy
              </Button>
            </Link>
          </div>
          <p className="text-base font-bold text-gray-900">{user.credits.toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation - Compact */}
      <div className="flex-1 overflow-hidden">
        {/* Tools Section */}
        <div className="px-3 py-2">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            AI Tools
          </h3>
          <nav className="space-y-0.5">
            {toolsNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-colors group",
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-2 h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] ml-1 border-0 rounded-full px-1.5 py-0 flex-shrink-0",
                        isActive(item.href)
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {item.credits}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2 border-t border-gray-200">
          <nav className="space-y-0.5">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation */}
        {adminNavigation.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-200">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Admin
            </h3>
            <nav className="space-y-0.5">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Settings at Bottom - Compact */}
      <div className="px-3 py-2 border-t border-gray-200">
        <Link
          to="/dashboard/settings"
          className={cn(
            "flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-colors w-full",
            isActive("/dashboard/settings")
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={() => setSidebarOpen(false)}
        >
          <Settings className="mr-2 h-4 w-4" strokeWidth={1.5} />
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