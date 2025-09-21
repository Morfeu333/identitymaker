import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Send, Mail, Webhook, CheckCircle, AlertCircle } from 'lucide-react';

interface WebhookTestData {
  formId: string;
  formTitle: string;
  userEmail: string;
  submissionId: string;
  submissionTimestamp: string;
  eventType: 'email_collected' | 'form_submitted';
  formResponses?: Record<string, string>;
  metadata: {
    totalQuestions: number;
    submissionSource: string;
    userAgent: string;
  };
}

const WebhookTestPage = () => {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [webhookUrl, setWebhookUrl] = useState('https://purposewaze.app.n8n.cloud/webhook/identityColision');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [testType, setTestType] = useState<'email_collected' | 'form_submitted'>('email_collected');

  // Simulate the exact data structure from IdentityCollisionForm
  const generateTestData = (eventType: 'email_collected' | 'form_submitted'): WebhookTestData => {
    const baseData = {
      formId: '5ac3cafd-72cd-40b0-99ee-1b4825906122',
      formTitle: 'Identity Collision Assessment',
      userEmail: testEmail,
      submissionId: crypto.randomUUID(),
      submissionTimestamp: new Date().toISOString(),
      eventType,
      metadata: {
        totalQuestions: eventType === 'email_collected' ? 0 : 12,
        submissionSource: 'identity_collision_form',
        userAgent: navigator.userAgent
      }
    };

    if (eventType === 'form_submitted') {
      return {
        ...baseData,
        formResponses: {
          'Current Role': 'Software Developer',
          'Years of Experience': '5-10 years',
          'Industry': 'Technology',
          'Career Satisfaction': '7',
          'Primary Challenge': 'Work-life balance',
          'Future Goals': 'Leadership position',
          'Skills Gap': 'Management skills',
          'Learning Preference': 'Online courses',
          'Motivation Level': '8',
          'Change Readiness': 'Very ready',
          'Support System': 'Strong',
          'Timeline': '6-12 months'
        }
      };
    }

    return baseData;
  };

  const sendWebhookTest = async (eventType: 'email_collected' | 'form_submitted') => {
    setLoading(true);
    setLastResponse(null);

    try {
      const testData = generateTestData(eventType);
      const targetUrl = customWebhookUrl || webhookUrl;

      console.log('🧪 Sending test webhook:', testData);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const responseData = await response.text();
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(responseData);
      } catch {
        parsedResponse = responseData;
      }

      setLastResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedResponse,
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: `${eventType} webhook sent successfully`,
        });
      } else {
        toast({
          title: "Webhook Test Failed",
          description: `Status: ${response.status} - ${response.statusText}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Webhook test error:', error);
      setLastResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Webhook Test Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Data copied successfully"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Webhook Test Page</h1>
          <p className="text-muted-foreground">
            Test webhook calls for IdentityMaker email collection and form submission
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Configure the webhook endpoint and test data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Test Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Default Webhook URL</Label>
                <Input
                  id="webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://purposewaze.app.n8n.cloud/webhook/..."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-webhook">Custom Webhook URL (Optional)</Label>
              <Input
                id="custom-webhook"
                value={customWebhookUrl}
                onChange={(e) => setCustomWebhookUrl(e.target.value)}
                placeholder="https://your-custom-webhook.com/endpoint"
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Collection Test
              </CardTitle>
              <CardDescription>
                Simulate webhook call when user enters email on first page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => sendWebhookTest('email_collected')}
                disabled={loading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Test Email Collection Webhook'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Form Submission Test
              </CardTitle>
              <CardDescription>
                Simulate webhook call when user completes the assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => sendWebhookTest('form_submitted')}
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Test Form Submission Webhook'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Response Display */}
        {lastResponse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastResponse.error ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                Webhook Response
                <Badge variant={lastResponse.error ? "destructive" : "default"}>
                  {lastResponse.error ? 'Error' : `${lastResponse.status} ${lastResponse.statusText}`}
                </Badge>
              </CardTitle>
              <CardDescription>
                Response received at {new Date(lastResponse.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Response Data</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(lastResponse, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={JSON.stringify(lastResponse, null, 2)}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use This Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Email Collection Test</h4>
              <p className="text-sm text-muted-foreground">
                Tests the webhook that should be called when a user enters their email on the first page.
                This allows you to start email nurturing sequences immediately.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Form Submission Test</h4>
              <p className="text-sm text-muted-foreground">
                Tests the existing webhook that's called when the user completes the full assessment.
                This includes all form responses and triggers the AI analysis.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Custom Webhook</h4>
              <p className="text-sm text-muted-foreground">
                You can test with a custom webhook URL to verify your n8n workflow setup before implementing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebhookTestPage;
