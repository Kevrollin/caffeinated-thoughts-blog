import { motion } from 'framer-motion';
import { Coffee, DollarSign, Smartphone, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const defaultAmounts = [50, 100, 200];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-coffee">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your blog and payment settings
        </p>
      </div>

      {/* Coffee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coffee className="h-5 w-5 mr-2 text-emerald" />
            Coffee Settings
          </CardTitle>
          <CardDescription>
            Configure default coffee amounts and payment options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Default Coffee Amounts (KES)
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultAmounts.map((amount) => (
                <Badge key={amount} variant="secondary" className="text-sm py-1 px-3">
                  {amount} KES
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These amounts appear as quick-select options in the buy coffee modal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* M-Pesa Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            M-Pesa Integration
          </CardTitle>
          <CardDescription>
            Daraja API configuration (managed in backend)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
            <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">API Credentials</p>
              <p className="text-xs text-muted-foreground">
                M-Pesa credentials are securely stored in the backend environment. 
                Contact your administrator to update them.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Environment</label>
              <Badge variant="outline">Production</Badge>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Status</label>
              <Badge className="bg-green-500">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Info */}
      <Card className="border-2 border-emerald/30 bg-emerald/5">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-emerald/20">
              <Coffee className="h-6 w-6 text-emerald" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold mb-2">
                Backend Configuration
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Payment processing and API integrations are handled by the backend service. 
                All sensitive credentials are stored securely as environment variables.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• API Base URL: Configured in frontend environment</p>
                <p>• M-Pesa Credentials: Stored in backend .env</p>
                <p>• Webhook URL: Automatically configured</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
