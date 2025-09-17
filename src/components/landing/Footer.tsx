import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  ArrowRight
} from "lucide-react";

const footerSections = [
  {
    title: "Features",
    links: [
      "All Features",
      "All Tools", 
      "URL to Video",
      "AI Avatar",
      "Product Video",
      "BYOA Avatar",
      "DYOA Avatar",
      "Batch Mode"
    ]
  },
  {
    title: "Use Cases",
    links: [
      "eCommerce",
      "Apps",
      "Games", 
      "DTC Brands",
      "Agencies",
      "UGC",
      "TikTok",
      "Real Estate"
    ]
  },
  {
    title: "Company",
    links: [
      "Blog",
      "Pricing",
      "About Us",
      "Case Studies",
      "Learning Center",
      "Become an Affiliate",
      "Contact Us",
      "Careers"
    ]
  },
  {
    title: "Social Media",
    links: [
      "Instagram",
      "Facebook", 
      "YouTube",
      "Snapchat",
      "Shopify",
      "Create AI Avatar",
      "OTT & CTV",
      "Lead Generation"
    ]
  }
];

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" }
];

export default function Footer() {
  return (
    <footer className="bg-gradient-hero text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold">AdMax</span>
              </div>
              
              <p className="text-white/80 leading-relaxed max-w-md">
                Generate engaging video ads for your products from any URL
              </p>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <Badge 
                  variant="secondary" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                >
                  🏆 AI GRANT
                </Badge>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-6 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-black text-xs font-bold">SC</span>
                  </div>
                  <span className="text-sm text-white/80">Snapchat Marketing Partner</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-6 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">TT</span>
                  </div>
                  <span className="text-sm text-white/80">TikTok - App Center</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  <div className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href="#"
                        className="block text-white/80 hover:text-white transition-colors text-sm"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2">Stay updated</h3>
                <p className="text-white/80">Get the latest AI video marketing insights and updates</p>
              </div>
              
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                />
                <Button 
                  className="bg-white text-primary hover:bg-white/90 shrink-0"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-white/80">
                <span>© 2024 AdMax. All rights reserved.</span>
                <div className="flex items-center space-x-4">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-white/80">Powered by</span>
                <Badge 
                  variant="secondary" 
                  className="bg-white/10 text-white border-white/20 backdrop-blur-sm"
                >
                  Razorpay Secure
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}