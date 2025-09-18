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

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock user data - replace with actual auth context
  const user = {
    name: "Preet",
    email: "preet@ugcai.com",
    avatar: "",
    credits: 1250,
    plan: "Pro",
    isAdmin: true // Set to true so you can access admin panel
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    // Implement logout logic
    navigate('/');
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
      credits: "100 credits"
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

  const adminNavigation = user.isAdmin ? [
    {
      name: "Admin Panel",
      href: "/dashboard/admin",
      icon: Shield,
      description: "System administration"
    }
  ] : [];

  const isActive = (href: string) => location.pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo & Brand */}
      <div className="flex items-center space-x-3 p-6 border-b border-slate-700">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AdMax
        </span>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                <Crown className="w-3 h-3 mr-1" />
                {user.plan}
              </Badge>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Credits</span>
            <Link to="/dashboard/billing">
              <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400 hover:text-blue-300">
                Buy More
              </Button>
            </Link>
          </div>
          <p className="text-lg font-semibold text-green-400">{user.credits.toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {/* Tools Section */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            AI Tools
          </h3>
          <nav className="space-y-1">
            {toolsNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-400 ml-2"
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
        <div className="px-4 py-4 border-t border-slate-700">
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
          <div className="px-4 py-4 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Administration
            </h3>
            <nav className="space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-red-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
      <div className="p-4 border-t border-slate-700">
        <Link
          to="/dashboard/settings"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full",
            isActive("/dashboard/settings")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden smooth-scroll">
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
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Notifications */}
              <NotificationCenter />

              {/* Learning Center */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/learning")}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <BookOpen className="h-5 w-5" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center space-x-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/billing" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing & Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent dark:scrollbar-thumb-slate-600 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;