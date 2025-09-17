import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, CreditCard, Shield, AlertTriangle, Scale } from "lucide-react";

const TermsConditions = () => {
  const sections = [
    {
      title: "Service Terms & Usage",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "You must be at least 18 years old or have parental consent to use our services",
        "Account registration requires accurate and current information",
        "You are responsible for maintaining the security of your account credentials",
        "Each account is for individual use - sharing accounts is prohibited",
        "You agree to use our AI tools in compliance with applicable laws and regulations",
        "We reserve the right to suspend accounts that violate these terms"
      ]
    },
    {
      title: "Acceptable Use Policy",
      icon: <Users className="h-6 w-6" />,
      content: [
        "Do not create content that is illegal, harmful, or violates others' rights",
        "Prohibited: hate speech, harassment, violence, or discriminatory content",
        "No attempts to reverse engineer, hack, or compromise our systems",
        "Respect intellectual property rights - don't infringe on copyrights or trademarks",
        "No spam, malware, or attempts to overwhelm our infrastructure",
        "Commercial use is allowed within your subscription tier limits"
      ]
    },
    {
      title: "Payment & Subscription Terms",
      icon: <CreditCard className="h-6 w-6" />,
      content: [
        "Subscription fees are billed in advance and are non-refundable unless required by law",
        "Credits are virtual items with no cash value and cannot be transferred",
        "Unused credits do not expire but are forfeited upon account cancellation",
        "Price changes will be communicated 30 days in advance",
        "You can cancel your subscription at any time through your account settings",
        "Refund requests are handled case-by-case for exceptional circumstances"
      ]
    },
    {
      title: "Intellectual Property Rights",
      icon: <Shield className="h-6 w-6" />,
      content: [
        "You retain ownership of content you create using our AI tools",
        "Our platform, algorithms, and technology remain our intellectual property",
        "You grant us limited rights to process and store your content for service delivery",
        "You are responsible for ensuring your content doesn't infringe on others' rights",
        "We may use anonymized, aggregated data to improve our services",
        "Any feedback or suggestions you provide may be used without compensation"
      ]
    },
    {
      title: "Limitation of Liability",
      icon: <AlertTriangle className="h-6 w-6" />,
      content: [
        "Our services are provided 'as is' without warranties of any kind",
        "We are not liable for any indirect, incidental, or consequential damages",
        "Maximum liability is limited to the amount paid for services in the past 12 months",
        "You acknowledge that AI-generated content may have limitations or inaccuracies",
        "We are not responsible for how you use or distribute AI-generated content",
        "Force majeure events excuse performance delays or failures"
      ]
    },
    {
      title: "Dispute Resolution & Legal",
      icon: <Scale className="h-6 w-6" />,
      content: [
        "These terms are governed by the laws of [Your Jurisdiction]",
        "Disputes will be resolved through binding arbitration when possible",
        "You waive the right to participate in class action lawsuits against us",
        "We may update these terms with 30 days notice via email",
        "Continued use after updates constitutes acceptance of new terms",
        "If any provision is unenforceable, the remainder of the terms remain valid"
      ]
    }
  ];

  const keyHighlights = [
    {
      title: "Fair Usage",
      description: "Use our AI tools responsibly and within your subscription limits",
      icon: <Users className="h-8 w-8" />
    },
    {
      title: "Your Content",
      description: "You own what you create - we just help you make it",
      icon: <Shield className="h-8 w-8" />
    },
    {
      title: "Clear Billing",
      description: "Transparent pricing with no hidden fees or surprise charges",
      icon: <CreditCard className="h-8 w-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-slate-900 dark:via-orange-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <FileText className="h-4 w-4 mr-1" />
              Terms of Service
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              By using our AI-powered content generation platform, you agree to these terms and conditions.
              Please read them carefully to understand your rights and responsibilities.
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg inline-block">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>Last Updated:</strong> September 17, 2025 | <strong>Effective Date:</strong> September 17, 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Points</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The most important things to know about using our platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {keyHighlights.map((highlight, index) => (
              <Card key={index} className="p-6 text-center border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-white">
                      {highlight.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{highlight.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <Card key={index} className="p-8 border-0 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  <div className="space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
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

      {/* Important Notice */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/30">
            <CardContent className="p-0">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-4 text-orange-800 dark:text-orange-200">Important Notice</h3>
                  <div className="space-y-3 text-orange-800 dark:text-orange-200">
                    <p>
                      <strong>AI Content Disclaimer:</strong> Content generated by our AI tools may not always be accurate, complete, or suitable for all purposes. You are responsible for reviewing and verifying any AI-generated content before use.
                    </p>
                    <p>
                      <strong>Account Termination:</strong> We reserve the right to terminate accounts that violate these terms, engage in harmful activities, or pose security risks to our platform or users.
                    </p>
                    <p>
                      <strong>Changes to Service:</strong> We may modify, suspend, or discontinue features with reasonable notice. Significant changes will be communicated at least 30 days in advance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Questions About These Terms?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            If you have any questions about these terms and conditions, please don't hesitate to contact our legal team.
          </p>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
              <div className="flex items-center justify-center space-x-4 text-white">
                <FileText className="h-6 w-6" />
                <span className="text-lg font-medium">legal@yourcompany.com</span>
              </div>
            </div>
            <p className="text-orange-100 text-sm">
              For urgent matters, contact support@yourcompany.com
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsConditions;