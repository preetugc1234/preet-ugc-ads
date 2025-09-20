import { useState } from "react";
import { CreditCard, Calendar, CheckCircle, AlertCircle, Download, Crown, Zap, Star, Calculator, Gift } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [selectedCredits, setSelectedCredits] = useState("1000");
  const [customCredits, setCustomCredits] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const { toast } = useToast();

  // Credit options for Pro plan (matching the pricing page)
  const creditOptions = [
    { credits: "1000", monthlyPrice: 19, label: "1,000 credits" },
    { credits: "2000", monthlyPrice: 39, label: "2,000 credits" },
    { credits: "4000", monthlyPrice: 79, label: "4,000 credits" },
    { credits: "8000", monthlyPrice: 159, label: "8,000 credits" },
    { credits: "16000", monthlyPrice: 319, label: "16,000 credits" },
    { credits: "32000", monthlyPrice: 639, label: "32,000 credits" },
    { credits: "64000", monthlyPrice: 1279, label: "64,000 credits" }
  ];

  // Individual credits calculation (from prompt.md)
  const calculatePriceFromCredits = (credits: number) => {
    return Number((credits * 0.0275).toFixed(2));
  };

  const calculateCreditsFromPrice = (price: number) => {
    const rawCredits = price / 0.0275;
    const fractionalPart = rawCredits % 1;
    return fractionalPart < 0.5 ? Math.floor(rawCredits) : Math.ceil(rawCredits);
  };

  const getProPricing = () => {
    const selectedOption = creditOptions.find(option => option.credits === selectedCredits);
    if (!selectedOption) return { monthlyPrice: 19, annualPrice: 228, credits: "1,000" };

    const monthlyPrice = isYearly ? selectedOption.monthlyPrice : Math.round(selectedOption.monthlyPrice * 1.24);
    const annualPrice = selectedOption.monthlyPrice * 12;
    const credits = isYearly ? `${parseInt(selectedCredits) * 12}` : selectedCredits;

    return { monthlyPrice, annualPrice, credits };
  };

  const proPricing = getProPricing();

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for exploring our AI tools",
      price: { monthly: 0, yearly: 0 },
      credits: "500 credits/month",
      dailyLimits: "5 text + 2 images daily",
      icon: Zap,
      color: "border-gray-200 dark:border-gray-700",
      features: [
        "Access to all 5 AI tools",
        "500 free credits monthly",
        "Daily free allowances",
        "30-item history storage",
        "Community support",
        "Basic tutorials access",
        "Standard processing speed"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      description: "Ideal for creators and small businesses",
      price: { monthly: proPricing.monthlyPrice, yearly: proPricing.annualPrice },
      credits: isYearly ? `${proPricing.credits} credits/year` : `${proPricing.credits} credits/month`,
      dailyLimits: "Unlimited generations",
      icon: Star,
      color: "border-blue-200 dark:border-blue-700 ring-2 ring-blue-500",
      popular: true,
      features: [
        "Everything in Free",
        "Flexible credit packages",
        "No daily generation limits",
        "Priority processing speed",
        "Advanced tutorials access",
        "Email support",
        "Custom export options",
        "API access included",
        "Commercial usage rights"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: { monthly: null, yearly: null },
      credits: "Custom credit allocation",
      dailyLimits: "Unlimited everything",
      icon: Crown,
      color: "border-purple-200 dark:border-purple-700",
      features: [
        "Everything in Pro",
        "Custom credit packages",
        "Dedicated account manager",
        "SLA guarantees",
        "Priority support & phone",
        "Custom integrations",
        "Volume discounts",
        "Advanced analytics",
        "White-label options",
        "Custom training & onboarding"
      ]
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="credits">Buy Credits</TabsTrigger>
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
                      {plans.find(p => p.id === currentPlan)?.credits}
                    </p>
                    <p className="text-sm text-gray-500">
                      Next billing: February 15, 2024
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${plans.find(p => p.id === currentPlan)?.price?.monthly || 'Custom'}{plans.find(p => p.id === currentPlan)?.price?.monthly ? '/mo' : ''}
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
                    Annual <Badge variant="secondary" className="ml-1">Save 24%</Badge>
                  </Label>
                  {isYearly && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Save 24%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const PlanIcon = plan.icon;
                const price = plan.price ? (isYearly ? plan.price.yearly : plan.price.monthly) : null;
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPlan ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${plan.color}`}>
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`p-3 rounded-full ${
                          plan.name === 'Free' ? 'bg-gray-100 dark:bg-gray-800' :
                          plan.name === 'Pro' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          <PlanIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plan.description}</p>

                      {price !== null ? (
                        <div className="mb-4">
                          <div className="text-4xl font-bold mb-1">
                            ${plan.name === 'Pro' ? proPricing.monthlyPrice : price}
                            <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                              /{plan.name === 'Pro' ? 'month' : (isYearly ? 'year' : 'month')}
                            </span>
                          </div>
                          {isYearly && price > 0 && plan.name !== 'Pro' && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                            </div>
                          )}
                          {plan.name === 'Pro' && isYearly && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Billed annually - Save 24%
                            </div>
                          )}
                          {plan.name === 'Pro' && !isYearly && (
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                              Monthly billing - 24% higher
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-bold mb-4">Custom Pricing</div>
                      )}

                      <div className="text-center mb-4">
                        <Badge variant="secondary" className="text-xs px-3 py-1">
                          {plan.credits}
                        </Badge>
                      </div>

                      {plan.name === 'Pro' && (
                        <div className="mb-4">
                          <label className="text-sm font-medium mb-2 block">Select Credits:</label>
                          <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {creditOptions.map((option) => {
                                const displayPrice = isYearly ? option.monthlyPrice : Math.round(option.monthlyPrice * 1.24);
                                return (
                                  <SelectItem key={option.credits} value={option.credits}>
                                    {option.label} - ${displayPrice}/month
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Button
                        onClick={() => handlePlanChange(plan.id)}
                        disabled={isCurrentPlan}
                        className={`w-full ${
                          plan.name === 'Free' ? 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200' :
                          plan.name === 'Pro' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-purple-600 hover:bg-purple-700'
                        }`}
                        variant={isCurrentPlan ? "outline" : "default"}
                      >
                        {isCurrentPlan ? "Current Plan" :
                         plan.name === 'Free' ? 'Get Started Free' :
                         plan.name === 'Enterprise' ? 'Contact Sales' : 'Choose Pro Plan'}
                      </Button>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Buy Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  Buy Individual Credits
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Purchase credits on demand without a subscription. Credits never expire.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Credits to Amount Calculator */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Buy Credits</h3>
                    <div>
                      <Label htmlFor="credits-input">Number of Credits</Label>
                      <Input
                        id="credits-input"
                        type="number"
                        min="100"
                        max="90000"
                        value={customCredits}
                        onChange={(e) => {
                          const credits = parseInt(e.target.value) || 0;
                          setCustomCredits(e.target.value);
                          if (credits >= 100 && credits <= 90000) {
                            setCustomAmount(calculatePriceFromCredits(credits).toString());
                          } else {
                            setCustomAmount("");
                          }
                        }}
                        placeholder="Enter credits (100 - 90,000)"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: 100 credits | Maximum: 90,000 credits
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="amount-display">Total Amount</Label>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        ${customCredits ? calculatePriceFromCredits(parseInt(customCredits) || 0).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>

                  {/* Amount to Credits Calculator */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Or Enter Amount</h3>
                    <div>
                      <Label htmlFor="amount-input">Amount ($)</Label>
                      <Input
                        id="amount-input"
                        type="number"
                        min="2.75"
                        max="2475"
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setCustomAmount(e.target.value);
                          if (amount >= 2.75 && amount <= 2475) {
                            setCustomCredits(calculateCreditsFromPrice(amount).toString());
                          } else {
                            setCustomCredits("");
                          }
                        }}
                        placeholder="Enter amount ($2.75 - $2,475)"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Rate: $0.0275 per credit
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="credits-display">Credits You'll Get</Label>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {customAmount ? calculateCreditsFromPrice(parseFloat(customAmount) || 0).toLocaleString() : '0'} credits
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Credit Usage Guide</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Chat Generation: Free</li>
                      <li>• Image Generation: Free</li>
                      <li>• Image→Video (5s): 100 credits</li>
                      <li>• Image→Video (10s): 200 credits</li>
                      <li>• Text→Speech: 100 credits</li>
                      <li>• Audio→Video: 100 credits/30 seconds</li>
                      <li>• Image→Video+Audio (5s): 200 credits</li>
                      <li>• Image→Video+Audio (10s): 400 credits</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!customCredits || parseInt(customCredits) < 100 || parseInt(customCredits) > 90000}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Purchase {customCredits ? parseInt(customCredits).toLocaleString() : '0'} Credits for ${customCredits ? calculatePriceFromCredits(parseInt(customCredits) || 0).toFixed(2) : '0.00'}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                        <li>• UGC Video Gen: 100-400 credits</li>
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