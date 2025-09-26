import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

const featuresItems = [
  { title: "AI Chat", href: "/products/chat", description: "Intelligent conversation AI" },
  { title: "Image Generation", href: "/products/image-generation", description: "Create stunning visuals" },
  { title: "Image to Video", href: "/products/image-to-video", description: "Animate your images" },
  { title: "Text to Speech", href: "/products/text-to-speech", description: "Natural voice synthesis" },
  { title: "Image to Video + Audio", href: "/products/image-to-video-with-audio", description: "Video with custom audio" },
  { title: "Audio to Video", href: "/products/audio-to-video", description: "Visual audio content" },
];

const languageItems = [
  { title: "English", href: "#", description: "Default language" },
  { title: "Spanish", href: "#", description: "Español" },
  { title: "French", href: "#", description: "Français" },
  { title: "German", href: "#", description: "Deutsch" },
  { title: "Italian", href: "#", description: "Italiano" },
  { title: "Portuguese", href: "#", description: "Português" },
];

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#') && location.pathname === '/') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white backdrop-blur-lg border-b border-gray-200/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              makeugc
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50 text-gray-700">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] gap-3 p-4 grid-cols-2">
                      {featuresItems.map((item) => (
                        <Link
                          key={item.title}
                          to={item.href}
                          className={cn(
                            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              to="/affiliate"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Affiliate
            </Link>

            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Pricing
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50 text-gray-700">
                    Languages
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {languageItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/simple-login">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-50">
                Login
              </Button>
            </Link>
            <Link to="/simple-signup">
              <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-md px-4 py-2 flex items-center gap-2">
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-50">
                  <Menu className="h-5 w-5 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Features</h3>
                    {featuresItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="block py-2 text-sm hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Languages</h3>
                    {languageItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="block py-2 text-sm hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Link
                      to="/affiliate"
                      className="block py-2 text-sm hover:text-gray-900 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Affiliate
                    </Link>
                    <Link
                      to="/pricing"
                      className="block py-2 text-sm hover:text-gray-900 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Pricing
                    </Link>
                  </div>

                  <div className="flex flex-col space-y-2 pt-4">
                    <Link to="/simple-login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">Login</Button>
                    </Link>
                    <Link to="/simple-signup" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}