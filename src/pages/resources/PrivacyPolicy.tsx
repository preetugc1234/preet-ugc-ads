import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, UserCheck, Globe, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: <Eye className="h-6 w-6" />,
      content: [
        "Account information: Name, email address, and authentication data",
        "Usage data: How you interact with our AI tools and platform features",
        "Content data: Images, text, and other content you create using our services",
        "Technical data: IP address, browser type, device information, and cookies",
        "Payment information: Billing details and transaction history (processed securely)"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <UserCheck className="h-6 w-6" />,
      content: [
        "Provide and improve our AI-powered content generation services",
        "Process your payments and manage your subscription",
        "Send important updates about your account and our services",
        "Analyze usage patterns to enhance user experience",
        "Ensure platform security and prevent fraudulent activities",
        "Comply with legal obligations and protect our rights"
      ]
    },
    {
      title: "Data Security & Protection",
      icon: <Lock className="h-6 w-6" />,
      content: [
        "Industry-standard encryption for data transmission and storage",
        "Regular security audits and vulnerability assessments",
        "Limited access controls - only authorized personnel can access your data",
        "Secure payment processing through trusted third-party providers",
        "Regular backups with encrypted storage solutions",
        "Incident response procedures for any potential security breaches"
      ]
    },
    {
      title: "Your Rights & Controls",
      icon: <Shield className="h-6 w-6" />,
      content: [
        "Access and download your personal data at any time",
        "Request correction of inaccurate or incomplete information",
        "Delete your account and associated data (subject to legal requirements)",
        "Opt-out of marketing communications while maintaining service updates",
        "Request data portability to transfer your information",
        "Lodge complaints with data protection authorities if needed"
      ]
    },
    {
      title: "Data Sharing & Third Parties",
      icon: <Globe className="h-6 w-6" />,
      content: [
        "We do not sell or rent your personal information to third parties",
        "AI model providers: For content generation (with privacy safeguards)",
        "Payment processors: Secure handling of billing and transactions",
        "Analytics services: Anonymized usage data for platform improvements",
        "Legal compliance: When required by law or to protect our rights",
        "Business transfers: In case of merger or acquisition (with notice)"
      ]
    },
    {
      title: "Contact & Updates",
      icon: <Mail className="h-6 w-6" />,
      content: [
        "Contact our privacy team: privacy@yourcompany.com",
        "Policy updates will be communicated via email and platform notifications",
        "Continued use after updates constitutes acceptance of new terms",
        "For urgent privacy concerns, contact support@yourcompany.com",
        "We respond to privacy requests within 30 days",
        "Regular review and updates to ensure compliance with evolving regulations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Shield className="h-4 w-4 mr-1" />
              Privacy & Security
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Your privacy matters to us. Learn how we collect, use, and protect your information
              while providing our AI-powered content generation services.
            </p>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg inline-block">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Last Updated:</strong> September 17, 2025 | <strong>Effective Date:</strong> September 17, 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <Card key={index} className="p-8 border-0 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Privacy Principles</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The core values that guide our approach to your privacy and data protection.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Transparency First</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We clearly explain what data we collect, how we use it, and your rights regarding your information.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Security by Design</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Data protection is built into every aspect of our platform, from encryption to access controls.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">User Control</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You have full control over your data with easy-to-use tools for accessing, updating, or deleting information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help. Contact us with any questions or concerns about your data.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
            <div className="flex items-center justify-center space-x-4 text-white">
              <Mail className="h-6 w-6" />
              <span className="text-lg font-medium">privacy@yourcompany.com</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;