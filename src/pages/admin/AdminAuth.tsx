import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";

const AdminAuth = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    secretKey: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Master credentials - in production, this should be from environment variables
  const MASTER_CREDENTIALS = {
    username: "preet_admin_2024",
    password: "AdMaxPro@2024#SecureAccess",
    secretKey: "ugc-ai-platform-master-key-2024"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
      credentials.username === MASTER_CREDENTIALS.username &&
      credentials.password === MASTER_CREDENTIALS.password &&
      credentials.secretKey === MASTER_CREDENTIALS.secretKey
    ) {
      // Set admin session
      localStorage.setItem("admin_session", JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      toast({
        title: "Access Granted",
        description: "Welcome to the Admin Dashboard",
      });

      navigate("/dashboard/system-control-panel");
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials. Unauthorized access attempt logged.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-slate-900/10 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-600/10 to-transparent"></div>

      <Card className="w-full max-w-md relative border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">System Access Control</CardTitle>
          <p className="text-slate-400 text-sm">Authorized Personnel Only</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Admin Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Master Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 pr-10"
                  placeholder="Enter master password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey" className="text-slate-300">Secret Access Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={credentials.secretKey}
                onChange={(e) => handleInputChange("secretKey", e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500"
                placeholder="Enter secret access key"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-2 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Access System"}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              All access attempts are logged and monitored.
              <br />
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;