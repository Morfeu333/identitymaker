import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const TestReport: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestReport();
  }, []);

  const loadTestReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load the latest structured report
      const { data: structuredReports, error: structuredError } = await supabase
        .from('form_reports')
        .select('report_json')
        .eq('submission_id', 'a2569be0-79c4-4dfb-9494-424c2f8f56da')
        .like('report_json', '{%') // Only JSON objects
        .order('generated_at', { ascending: false })
        .limit(1);

      if (!structuredError && structuredReports && structuredReports.length > 0) {
        console.log('Loaded structured report:', structuredReports[0].report_json);
        setReportData(structuredReports[0].report_json);
      } else {
        // Try text report
        const { data: textReport, error: textError } = await supabase
          .from('form_reports')
          .select('report_json')
          .eq('submission_id', 'a2569be0-79c4-4dfb-9494-424c2f8f56da')
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (!textError && textReport && textReport.report_json) {
          const reportData = typeof textReport.report_json === 'string' 
            ? { textReport: textReport.report_json, assessmentType: 'Text Report' }
            : textReport.report_json;
          
          console.log('Loaded text report:', reportData);
          setReportData(reportData);
        } else {
          setError('No report found');
        }
      }
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Error loading report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading test report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTestReport}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Test Report Display</h1>
          <Button onClick={loadTestReport} variant="outline">Reload Report</Button>
        </div>

        {/* Report Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">Report Preview</h2>
            <p className="text-sm text-gray-600">
              Report Type: {reportData?.assessmentType || 'Unknown'}
            </p>
          </div>

          <div className="p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="flex justify-center min-h-full">
              <div className="w-full max-w-4xl">
                {reportData?.assessmentType === "Authentic Self Discovery" ? (
                  // AUTHENTIC SELF DISCOVERY FORMAT DISPLAY
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">🌟 Authentic Self Discovery Report</h1>
                    {/* Add the rest of the authentic self discovery display here */}
                    <p className="text-center text-gray-600">Authentic Self Discovery Report Content</p>
                  </div>
                ) : reportData?.temperamentAlignedProtocol ? (
                  // IDENTITY COLLISION ASSESSMENT FORMAT DISPLAY
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">⚡ Identity Collision Assessment Report</h1>

                    {/* Protocol Header */}
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6">
                      <h2 className="text-2xl font-semibold text-purple-900 mb-4">{reportData.temperamentAlignedProtocol.name}</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {reportData.temperamentAlignedProtocol.description}
                      </p>
                      <div className="bg-white p-4 rounded border">
                        <p className="text-sm text-purple-700 font-medium">
                          ⏱️ Total Time Investment: {reportData.temperamentAlignedProtocol.totalTimeInvestment}
                        </p>
                      </div>
                    </div>

                    {/* Daily Practices Preview */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-purple-900 mb-4">7-Day P.R.O.T.E.C.T. Protocol</h2>
                      <div className="space-y-4">
                        {reportData.temperamentAlignedProtocol.dailyPractices?.slice(0, 2).map((practice: any, index: number) => (
                          <div key={index} className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                            <div className="flex items-center mb-3">
                              <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                {practice.day}
                              </div>
                              <h3 className="text-lg font-semibold text-indigo-900">{practice.letter}</h3>
                              <span className="ml-auto text-sm text-indigo-600 font-medium">{practice.timing}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{practice.fullInstructions}</p>
                          </div>
                        ))}
                        {reportData.temperamentAlignedProtocol.dailyPractices?.length > 2 && (
                          <p className="text-center text-gray-500 text-sm">
                            ... and {reportData.temperamentAlignedProtocol.dailyPractices.length - 2} more practices
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : reportData?.textReport ? (
                  // TEXT REPORT DISPLAY
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">📋 Your Personalized Assessment Report</h1>
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {reportData.textReport}
                      </div>
                    </div>
                  </div>
                ) : (
                  // DEFAULT FALLBACK DISPLAY
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-6">Assessment Report</h1>
                    <p className="text-center text-gray-600">Report content will be displayed here</p>
                    <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto">
                      {JSON.stringify(reportData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReport;
