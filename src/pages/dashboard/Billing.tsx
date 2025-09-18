import { useState } from "react";
import { CreditCard, Calendar, CheckCircle, AlertCircle, Download, Crown, Zap, Star } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("starter");
  const { toast } = useToast();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      credits: 100,
      icon: Star,
      features: [
        "100 credits/month",
        "Basic AI models",
        "720p video quality",
        "Community support",
        "5 history items"
      ],
      limitations: [
        "No premium models",
        "Watermarked outputs",
        "Limited file exports"
      ]
    },
    {
      id: "starter",
      name: "Starter",
      price: { monthly: 19, yearly: 190 },
      credits: 2000,
      icon: Zap,
      popular: true,
      features: [
        "2,000 credits/month",
        "Premium AI models",
        "1080p video quality",
        "Priority support",
        "30 history items",
        "No watermarks",
        "All export formats"
      ],
      limitations: []
    },
    {
      id: "pro",
      name: "Pro",
      price: { monthly: 49, yearly: 490 },
      credits: 6000,
      icon: Crown,
      features: [
        "6,000 credits/month",
        "All premium models",
        "4K video quality",
        "Priority support",
        "Unlimited history",
        "Custom model training",
        "API access",
        "Team collaboration"
      ],
      limitations: []
    }
  ];

  const billingHistory = [
    {
      id: "inv_001",
      date: "2024-01-15",
      amount: 19.00,
      status: "paid",
      plan: "Starter",
      period: "Jan 15 - Feb 15, 2024"
    },
    {
      id: "inv_002",
      date: "2023-12-15",
      amount: 19.00,
      status: "paid",
      plan: "Starter",
      period: "Dec 15 - Jan 15, 2024"
    },
    {
      id: "inv_003",
      date: "2023-11-15",
      amount: 19.00,
      status: "paid",
      plan: "Starter",
      period: "Nov 15 - Dec 15, 2023"
    }
  ];

  const usageStats = {
    currentPeriod: "Jan 15 - Feb 15, 2024",
    totalCredits: 2000,
    usedCredits: 1247,
    breakdown: [
      { tool: "Chat Generation", credits: 0, percentage: 0 },
      { tool: "Image Generation", credits: 0, percentage: 0 },
      { tool: "Image to Video", credits: 423, percentage: 34 },
      { tool: "Text to Speech", credits: 245, percentage: 20 },
      { tool: "UGC Video Gen", credits: 579, percentage: 46 }
    ]
  };

  const paymentMethods = [
    {
      id: "card_001",
      type: "visa",
      last4: "4242",
      expiry: "12/26",
      isDefault: true
    },
    {
      id: "card_002",
      type: "mastercard",
      last4: "8888",
      expiry: "08/25",
      isDefault: false
    }
  ];

  const handlePlanChange = (planId: string) => {
    toast({
      title: "Plan Update",
      description: `Switching to ${plans.find(p => p.id === planId)?.name} plan...`,
    });
    setCurrentPlan(planId);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading invoice ${invoiceId}...`,
    });
  };

  const remainingCredits = usageStats.totalCredits - usageStats.usedCredits;
  const usagePercentage = (usageStats.usedCredits / usageStats.totalCredits) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription, usage, and billing information
          </p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold">
                        {plans.find(p => p.id === currentPlan)?.name}
                      </h3>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {usageStats.totalCredits.toLocaleString()} credits/month
                    </p>
                    <p className="text-sm text-gray-500">
                      Next billing: February 15, 2024
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${plans.find(p => p.id === currentPlan)?.price.monthly}/mo
                    </div>
                    <p className="text-sm text-gray-500">
                      {remainingCredits.toLocaleString()} credits remaining
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-4">
                  <Label htmlFor="yearly-toggle">Monthly</Label>
                  <Switch
                    id="yearly-toggle"
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                  />
                  <Label htmlFor="yearly-toggle">
                    Yearly <Badge variant="secondary" className="ml-1">Save 17%</Badge>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const PlanIcon = plan.icon;
                const price = isYearly ? plan.price.yearly : plan.price.monthly;
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPlan ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4">
                        <PlanIcon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">
                          ${price}
                          <span className="text-lg font-normal text-gray-500">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                        </div>
                        {isYearly && plan.price.monthly > 0 && (
                          <p className="text-sm text-gray-500">
                            ${(plan.price.monthly * 12).toLocaleString()} billed annually
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-medium text-blue-600">
                        {plan.credits.toLocaleString()} credits/month
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {plan.limitations.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-500">
                              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                              {limitation}
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => handlePlanChange(plan.id)}
                        disabled={isCurrentPlan}
                        className="w-full"
                        variant={isCurrentPlan ? "outline" : "default"}
                      >
                        {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Usage</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {usageStats.currentPeriod}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Credits Used</span>
                      <span>{usageStats.usedCredits.toLocaleString()} / {usageStats.totalCredits.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {remainingCredits.toLocaleString()} credits remaining
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Usage by Tool</h4>
                    {usageStats.breakdown.map((tool, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{tool.tool}</span>
                          <span>{tool.credits} credits</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${tool.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200">Credit Costs</h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                        <li>• Chat Generation: Free</li>
                        <li>• Image Generation: Free</li>
                        <li>• Image to Video: 100-200 credits</li>
                        <li>• Text to Speech: 100 credits</li>
                        <li>• UGC Video Gen: 100-200 credits</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-200">Save Credits</h5>
                      <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                        <li>• Use lower quality settings when testing</li>
                        <li>• Generate shorter videos for previews</li>
                        <li>• Take advantage of free tools when possible</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {method.type.toUpperCase().slice(0, 4)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• {method.last4}</p>
                        <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{invoice.plan} Plan</p>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invoice.period}
                        </p>
                        <p className="text-sm text-gray-500">
                          Invoice {invoice.id} • {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Billing;