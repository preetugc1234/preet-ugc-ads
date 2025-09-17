import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Zap, Shield, ArrowRight, Copy, CheckCircle, ExternalLink, Book } from "lucide-react";

const APIReference = () => {
  const endpoints = [
    {
      method: "POST",
      endpoint: "/api/v1/jobs/create",
      description: "Create a new AI generation job",
      auth: "Required",
      category: "Jobs"
    },
    {
      method: "GET",
      endpoint: "/api/v1/jobs/{id}/status",
      description: "Get job status and results",
      auth: "Required",
      category: "Jobs"
    },
    {
      method: "GET",
      endpoint: "/api/v1/user/credits",
      description: "Get user credit balance",
      auth: "Required",
      category: "User"
    },
    {
      method: "POST",
      endpoint: "/api/v1/webhooks/razorpay",
      description: "Razorpay payment webhook handler",
      auth: "HMAC",
      category: "Webhooks"
    }
  ];

  const sdks = [
    {
      name: "Python SDK",
      description: "Official Python library for easy integration",
      install: "pip install admax-ai",
      language: "python",
      status: "stable"
    },
    {
      name: "Node.js SDK",
      description: "JavaScript/TypeScript SDK for web applications",
      install: "npm install @admax/ai-sdk",
      language: "javascript",
      status: "stable"
    },
    {
      name: "PHP SDK",
      description: "PHP library for server-side integration",
      install: "composer require admax/ai-php",
      language: "php",
      status: "beta"
    },
    {
      name: "Go SDK",
      description: "Go library for high-performance applications",
      install: "go get github.com/admax-ai/go-sdk",
      language: "go",
      status: "beta"
    }
  ];

  const codeExamples = {
    curl: `curl -X POST https://api.admax.ai/v1/jobs/create \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "module": "text_to_image",
    "params": {
      "prompt": "A beautiful sunset over mountains",
      "style": "photorealistic",
      "aspect_ratio": "16:9"
    }
  }'`,
    python: `import admax_ai

# Initialize client
client = admax_ai.Client(api_key="YOUR_API_KEY")

# Create image generation job
job = client.jobs.create(
    module="text_to_image",
    params={
        "prompt": "A beautiful sunset over mountains",
        "style": "photorealistic",
        "aspect_ratio": "16:9"
    }
)

# Wait for completion
result = client.jobs.wait_for_completion(job.id)
print(f"Generated image: {result.final_urls[0]}")`,
    javascript: `const AdmaxAI = require('@admax/ai-sdk');

const client = new AdmaxAI({
  apiKey: 'YOUR_API_KEY'
});

async function generateImage() {
  const job = await client.jobs.create({
    module: 'text_to_image',
    params: {
      prompt: 'A beautiful sunset over mountains',
      style: 'photorealistic',
      aspect_ratio: '16:9'
    }
  });

  const result = await client.jobs.waitForCompletion(job.id);
  console.log('Generated image:', result.finalUrls[0]);
}

generateImage();`
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "RESTful API",
      description: "Clean, intuitive REST endpoints with JSON responses"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Authentication",
      description: "API key authentication with HMAC webhook verification"
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Multiple SDKs",
      description: "Official libraries for Python, Node.js, PHP, and Go"
    },
    {
      icon: <Key className="h-8 w-8 text-primary" />,
      title: "Comprehensive Docs",
      description: "Detailed documentation with examples and best practices"
    }
  ];

  const rateLimits = [
    { tier: "Free", requests: "10 req/min", burst: "50 req/hour" },
    { tier: "Pro", requests: "100 req/min", burst: "1000 req/hour" },
    { tier: "Enterprise", requests: "1000 req/min", burst: "Unlimited" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              <Code className="h-4 w-4 mr-1" />
              Developer Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              API Reference
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Integrate our AI tools into your applications with our powerful, developer-friendly API.
              Complete documentation, code examples, and SDKs for seamless integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                Get API Key
                <Key className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                View Examples
                <Code className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started with our API in minutes. Choose your preferred language and follow along.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-50 dark:bg-slate-700 rounded-t-lg">
                  <TabsTrigger value="curl" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">cURL</TabsTrigger>
                  <TabsTrigger value="python" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">Python</TabsTrigger>
                  <TabsTrigger value="javascript" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">JavaScript</TabsTrigger>
                </TabsList>
                <div className="p-6">
                  {Object.entries(codeExamples).map(([key, code]) => (
                    <TabsContent key={key} value={key} className="mt-0">
                      <div className="relative">
                        <pre className="bg-gray-900 dark:bg-slate-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{code}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">API Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for developers, designed for scale. Everything you need to integrate AI into your applications.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0 text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints & SDKs */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* API Endpoints */}
            <div>
              <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                RESTful endpoints for all AI operations. Comprehensive and easy to understand.
              </p>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                            className={
                              endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {endpoint.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{endpoint.description}</p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Shield className="h-3 w-3 mr-1" />
                        Auth: {endpoint.auth}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* SDKs */}
            <div>
              <h3 className="text-3xl font-bold mb-6">Official SDKs</h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Use our official libraries for faster development and better error handling.
              </p>
              <div className="space-y-4">
                {sdks.map((sdk, index) => (
                  <Card key={index} className="p-6 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold">{sdk.name}</h4>
                        <Badge
                          variant={sdk.status === 'stable' ? 'default' : 'secondary'}
                          className={
                            sdk.status === 'stable' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }
                        >
                          {sdk.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{sdk.description}</p>
                      <div className="bg-gray-900 dark:bg-slate-900 text-gray-100 p-3 rounded-lg text-sm font-mono mb-3">
                        {sdk.install}
                      </div>
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          <Book className="h-4 w-4 mr-1" />
                          Docs
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          GitHub
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits & Authentication */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Rate Limits */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Rate Limits</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Fair usage policies designed to ensure optimal performance for all users.
              </p>
              <div className="space-y-4">
                {rateLimits.map((limit, index) => (
                  <Card key={index} className="p-6 border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold">{limit.tier} Tier</h4>
                        <Badge variant={limit.tier === 'Free' ? 'secondary' : limit.tier === 'Pro' ? 'default' : 'outline'}>
                          {limit.tier}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Rate Limit:</span>
                          <div className="font-mono text-blue-600 dark:text-blue-400">{limit.requests}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Burst Limit:</span>
                          <div className="font-mono text-blue-600 dark:text-blue-400">{limit.burst}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Authentication */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Authentication</h3>
              <Card className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-0">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        API Key Authentication
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Include your API key in the Authorization header for all requests:
                      </p>
                      <code className="block bg-gray-900 dark:bg-slate-900 text-gray-100 p-3 rounded text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Webhook Security
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        All webhooks are signed with HMAC-SHA256 for security:
                      </p>
                      <code className="block bg-gray-900 dark:bg-slate-900 text-gray-100 p-3 rounded text-sm">
                        X-Signature: sha256=signature_hash
                      </code>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>API keys never expire</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Regenerate anytime from dashboard</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Environment-specific keys available</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-slate-800 dark:from-gray-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Building with Our API
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers already using our API to build amazing AI-powered applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              Get Free API Key
              <Key className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Browse Examples
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default APIReference;