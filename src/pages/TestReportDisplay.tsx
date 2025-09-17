import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function TestReportDisplay() {
  const [reportId, setReportId] = useState('11a233a3-b143-4827-9c7a-0af06b39c445');
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!reportId.trim()) return;
    
    setLoading(true);
    setError(null);
    setReportHtml(null);
    
    try {
      console.log('🔄 Fetching report with ID:', reportId);
      
      const { data, error } = await supabase
        .rpc('get_form_report', { p_report_id: reportId });
      
      console.log('📊 Supabase response:', { data, error });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('✅ Report found, HTML length:', data[0].report_html?.length);
        setReportHtml(data[0].report_html);
      } else {
        throw new Error('Report not found');
      }
    } catch (err) {
      console.error('❌ Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setReportHtml(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4">🧪 Test Report Display</h1>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportId">Report ID</Label>
              <Input
                id="reportId"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                placeholder="Enter report ID"
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={fetchReport} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Report'}
              </Button>
              <Button onClick={clearReport} variant="outline">
                Clear
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => {
                  setReportId('11a233a3-b143-4827-9c7a-0af06b39c445');
                  setTimeout(fetchReport, 100);
                }}
                variant="outline"
                size="sm"
              >
                Load Latest Report (automatrix333@gmail.com)
              </Button>
              <Button 
                onClick={() => {
                  setReportId('ca3dd9e6-ada8-4f43-8f30-62db92ab3de5');
                  setTimeout(fetchReport, 100);
                }}
                variant="outline"
                size="sm"
              >
                Load Sample Report (lucmattsley@gmail.com)
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {reportHtml && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold">Report HTML Content:</h2>
              <p className="text-sm text-gray-600">
                Length: {reportHtml.length} characters
              </p>
            </div>
            <div 
              className="w-full min-h-96 overflow-auto"
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
