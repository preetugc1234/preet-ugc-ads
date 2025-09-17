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

const productItems = [
  { title: "AI Chat", href: "#chat", description: "Intelligent conversation AI" },
  { title: "Image Generation", href: "#image", description: "Create stunning visuals" },
  { title: "Image to Video", href: "#image-video", description: "Animate your images" },
  { title: "Text to Speech", href: "#tts", description: "Natural voice synthesis" },
  { title: "UGC Video Creator", href: "#ugc-video", description: "User-generated content" },
  { title: "Audio to Video", href: "#audio-video", description: "Visual audio content" },
];

const resourceItems = [
  { title: "Case Studies", href: "#case-studies" },
  { title: "Blog", href: "#blog" },
  { title: "Learning Center", href: "#learning" },
  { title: "Terms & Conditions", href: "#terms" },
  { title: "Privacy Policy", href: "#privacy" },
];

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--glass-bg)] backdrop-blur-glass border-b border-[var(--glass-border)] shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AdMax
            </span>
          </div>

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
                        <NavigationMenuLink
                          key={item.title}
                          href={item.href}
                          className={cn(
                            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(item.href);
                          }}
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-white/10 data-[state=open]:bg-white/10">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      {resourceItems.map((item) => (
                        <NavigationMenuLink
                          key={item.title}
                          href={item.href}
                          className={cn(
                            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(item.href);
                          }}
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <a 
              href="#pricing" 
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#pricing');
              }}
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
            >
              Contact
            </a>
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
            <Button variant="ghost" size="sm" className="hover:bg-white/10">
              Login
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow">
              Start Free
            </Button>
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
                      <a
                        key={item.title}
                        href={item.href}
                        className="block py-2 text-sm hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.href);
                        }}
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Resources</h3>
                    {resourceItems.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className="block py-2 text-sm hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.href);
                        }}
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <a href="#pricing" className="block py-2 text-sm hover:text-primary transition-colors">
                      Pricing
                    </a>
                    <a href="#contact" className="block py-2 text-sm hover:text-primary transition-colors">
                      Contact
                    </a>
                  </div>

                  <div className="flex flex-col space-y-2 pt-4">
                    <Button variant="ghost" size="sm">Login</Button>
                    <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                      Start Free
                    </Button>
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