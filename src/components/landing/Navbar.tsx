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

const productItems = [
  { title: "AI Chat", href: "/products/chat", description: "Intelligent conversation AI" },
  { title: "Image Generation", href: "/products/image-generation", description: "Create stunning visuals" },
  { title: "Image to Video", href: "/products/image-to-video", description: "Animate your images" },
  { title: "Text to Speech", href: "/products/text-to-speech", description: "Natural voice synthesis" },
  { title: "Image to Video + Audio", href: "/products/image-to-video-with-audio", description: "Video with custom audio" },
  { title: "Audio to Video", href: "/products/audio-to-video", description: "Visual audio content" },
];

const resourceItems = [
  { title: "Documentation", href: "/resources/documentation", description: "Complete guides and tutorials" },
  { title: "API Reference", href: "/resources/api-reference", description: "Developer documentation" },
  { title: "Video Tutorials", href: "/resources/tutorials", description: "Step-by-step video guides" },
  { title: "Community", href: "/resources/community", description: "Connect with other creators" },
  { title: "Support", href: "/resources/support", description: "Get help when you need it" },
  { title: "Privacy Policy", href: "/resources/privacy-policy", description: "Your privacy and data protection" },
  { title: "Terms & Conditions", href: "/resources/terms-conditions", description: "Terms of service and usage" },
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
    <nav className="fixed top-0 w-full z-50 bg-[var(--glass-bg)] backdrop-blur-glass border-b border-[var(--glass-border)] shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AdMax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-white/10 data-[state=open]:bg-white/10">
                    Products
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] gap-3 p-4 grid-cols-2">
                      {productItems.map((item) => (
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

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-white/10 data-[state=open]:bg-white/10">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[500px] p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-3">
                          {resourceItems.slice(0, 4).map((item) => (
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
                        <div className="space-y-3">
                          {resourceItems.slice(4, 7).map((item) => (
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
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              to="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 hover:bg-white/10"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Products</h3>
                    {productItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="block py-2 text-sm hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Resources</h3>
                    {resourceItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="block py-2 text-sm hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Link
                      to="/pricing"
                      className="block py-2 text-sm hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/contact"
                      className="block py-2 text-sm hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>

                  <div className="flex flex-col space-y-2 pt-4">
                    <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">Login</Button>
                    </Link>
                    <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="bg-gradient-primary hover:opacity-90 w-full">
                        Sign Up
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