import { Twitter, TikTokIcon as Tiktok, Linkedin, Instagram } from "lucide-react";

const footerSections = [
  {
    title: "MAIN",
    links: [
      "Home",
      "Features",
      "Affiliate",
      "Pricing",
      "Languages",
      "Ad Toolkit",
      "Blog",
      "API access"
    ]
  },
  {
    title: "LEGAL",
    links: [
      "Terms of Services",
      "Privacy Policy",
      "Refund Policy",
      "Fair Use Policy",
      "Custom Avatar Policy"
    ]
  },
  {
    title: "ADDRESS",
    links: [
      "45 Fitzroy Street,",
      "",
      "Fitzrovia, London",
      "",
      "W1T 6EB"
    ]
  },
  {
    title: "NEED HELP?",
    links: [
      "Contact us"
    ]
  }
];

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-black">makeugc</span>
            </div>

            <p className="text-gray-700 leading-relaxed max-w-sm">
              Write your script → Pick an avatar →<br />
              Generate video
            </p>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">{section.title}</h3>
                <div className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex}>
                      {link ? (
                        <a
                          href="#"
                          className="block text-gray-900 hover:text-blue-600 transition-colors text-base"
                        >
                          {link}
                        </a>
                      ) : (
                        <div className="h-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-gray-900 transition-colors">Terms & conditions</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Contact us</a>
              </div>
            </div>

            <div className="flex items-center space-y-2 md:space-y-0">
              <span className="text-sm text-gray-600 mr-6">© 2025 MakeUGC. All rights Reserved.</span>

              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600 mr-3">Social Link:</span>
                <a href="#" className="text-gray-600 hover:text-black transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-black transition-colors ml-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-black transition-colors ml-2">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-black transition-colors ml-2">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}