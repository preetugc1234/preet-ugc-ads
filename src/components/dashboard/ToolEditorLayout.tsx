import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Clock, AlertTriangle } from "lucide-react";

interface ToolEditorLayoutProps {
  toolName: string;
  toolIcon: React.ComponentType<{ className?: string }>;
  credits: string;
  estimatedTime?: string;
  children: ReactNode;
  previewPane: ReactNode;
  onGenerate?: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  costBreakdown?: {
    baseCost: number;
    additionalCosts?: { name: string; cost: number }[];
    total: number;
  };
}

const ToolEditorLayout = ({
  toolName,
  toolIcon: Icon,
  credits,
  estimatedTime,
  children,
  previewPane,
  onGenerate,
  isGenerating = false,
  canGenerate = true,
  costBreakdown
}: ToolEditorLayoutProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Top Bar with Tool Name + Cost Estimator */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{toolName}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {credits}
              </Badge>
              {estimatedTime && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {estimatedTime}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Cost Estimator */}
        {costBreakdown && (
          <Card className="w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Cost Estimate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base cost:</span>
                  <span>{costBreakdown.baseCost} credits</span>
                </div>
                {costBreakdown.additionalCosts?.map((cost, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{cost.name}:</span>
                    <span>+{cost.cost} credits</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">{costBreakdown.total} credits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid lg:grid-cols-3 gap-6 p-6">
        {/* Left Pane: Inputs (prompts, files, options, templates) */}
        <div className="lg:col-span-1 space-y-6">
          {children}

          {/* Generate Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={onGenerate}
                disabled={!canGenerate || isGenerating}
                className={`w-full h-12 text-lg font-medium ${
                  isGenerating
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </Button>

              {!canGenerate && (
                <div className="flex items-center mt-3 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Complete required fields to generate
                </div>
              )}

              {credits !== "Free" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Credits will be deducted when you click Generate
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panes: Preview & Progress */}
        <div className="lg:col-span-2">
          {previewPane}
        </div>
      </div>
    </div>
  );
};

export default ToolEditorLayout;