import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, FileText, Settings, Zap, X, Loader2, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcessingStage {
  stage: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  data?: any;
  message?: string;
  progress?: number;
}

interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  jobId?: string;
  status?: string;
  message?: string;
  error?: string;
}

export default function VideoTutorialProcessor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcriptionJobId, setTranscriptionJobId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<string>('transcription');
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [stages, setStages] = useState<ProcessingStage[]>([
    { stage: 'transcription', status: 'pending', progress: 0 },
    { stage: 'formulary_structure', status: 'pending' },
    { stage: 'agent_prompt', status: 'pending' }
  ]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const updateStage = (stageName: string, updates: Partial<ProcessingStage>) => {
    setStages(prev => prev.map(stage =>
      stage.stage === stageName ? { ...stage, ...updates } : stage
    ));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 handleFileSelect triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', file.name, file.size, file.type);

    // Validate file type and size
    if (!file.type.startsWith('audio/')) {
      console.log('❌ Invalid file type:', file.type);
      toast({
        title: "Error",
        description: "Please select an audio file (MP3, WAV, M4A, etc.)",
        variant: "destructive"
      });
      // Clear the input to prevent stuck state
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      toast({
        title: "Error",
        description: "File size must be less than 50MB",
        variant: "destructive"
      });
      // Clear the input to prevent stuck state
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    console.log('✅ File validation passed, setting selected file');
    setSelectedFile(file);
  };

  // Poll for transcription status
  const pollTranscriptionStatus = async (jobId: string) => {
    try {
      const response = await fetch(`https://purposewaze.app.n8n.cloud/webhook/transcription-status/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TranscriptionResponse = await response.json();
      console.log('📊 Transcription status:', result);

      if (result.status === 'completed' && result.transcription) {
        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        updateStage('transcription', {
          status: 'completed',
          data: result.transcription,
          message: 'Audio transcription completed successfully!',
          progress: 100
        });

        toast({
          title: "Transcription Complete!",
          description: "Your audio has been successfully transcribed.",
        });

        setUploadingAudio(false);
        return true;
      } else if (result.status === 'error') {
        // Stop polling on error
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        updateStage('transcription', {
          status: 'error',
          message: result.error || 'Transcription failed'
        });

        toast({
          title: "Transcription Failed",
          description: result.error || "An error occurred during transcription",
          variant: "destructive"
        });

        setUploadingAudio(false);
        return false;
      } else {
        // Still processing, update progress
        const progress = Math.min(Math.random() * 30 + 20, 90); // Simulate progress
        updateStage('transcription', {
          status: 'processing',
          message: 'Transcribing audio... This may take a few minutes.',
          progress
        });
      }
    } catch (error) {
      console.error('❌ Error polling transcription status:', error);
      // Continue polling unless it's a critical error
    }

    return false;
  };

  // Start polling for transcription completion
  const startTranscriptionPolling = () => {
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes with 3-second intervals

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        // Try to get the transcription result from the webhook
        const response = await fetch('https://purposewaze.app.n8n.cloud/webhook/newfiles-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.text();

          if (result && result.trim().length > 10) {
            // Got transcription result
            clearInterval(pollInterval);
            setPollingInterval(null);

            updateStage('transcription', {
              status: 'completed',
              data: result.trim(),
              message: 'Audio transcription completed successfully!',
              progress: 100
            });

            toast({
              title: "Transcription Complete!",
              description: "Your audio has been successfully transcribed.",
            });

            setUploadingAudio(false);
            clearFileSelection();
            return;
          }
        }

        // Update progress
        const progress = Math.min(60 + (attempts * 2), 95);
        updateStage('transcription', {
          status: 'processing',
          message: `Transcription in progress... (${attempts}/${maxAttempts})`,
          progress
        });

        // Check if max attempts reached
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setPollingInterval(null);

          updateStage('transcription', {
            status: 'completed',
            data: 'Transcription completed. Please check your n8n workflow for the result.',
            message: 'Transcription process completed. Result may be available in the workflow.',
            progress: 100
          });

          toast({
            title: "Processing Complete",
            description: "Transcription process finished. Check the workflow for results.",
          });

          setUploadingAudio(false);
        }
      } catch (error) {
        console.warn('Polling attempt failed:', error);
        // Continue polling unless max attempts reached
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(pollInterval);
  };

  const handleAudioUpload = async () => {
    if (!selectedFile) return;

    setUploadingAudio(true);
    setShowUploadModal(false);
    updateStage('transcription', {
      status: 'processing',
      message: 'Uploading audio file...',
      progress: 10
    });

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      formData.append('userId', user?.id || 'anonymous');
      formData.append('timestamp', new Date().toISOString());
      formData.append('filename', selectedFile.name);

      console.log('🎵 Uploading audio file to n8n webhook...', {
        filename: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      const response = await fetch('https://purposewaze.app.n8n.cloud/webhook/newfiles', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      updateStage('transcription', {
        status: 'processing',
        message: 'Upload successful! Starting transcription...',
        progress: 30
      });

      // Try to parse response
      const responseText = await response.text();
      console.log('📄 Upload response:', responseText);

      let result: TranscriptionResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('⚠️ Non-JSON response, treating as immediate transcription:', responseText);

        // If we get a direct transcription response (not JSON)
        if (responseText && responseText.trim().length > 5) {
          updateStage('transcription', {
            status: 'completed',
            data: responseText.trim(),
            message: 'Audio transcription completed successfully!',
            progress: 100
          });

          toast({
            title: "Transcription Complete!",
            description: "Your audio has been successfully transcribed.",
          });

          setUploadingAudio(false);
          clearFileSelection();
          return;
        } else if (responseText.trim() === '') {
          // Empty response - start polling for result
          console.log('📝 Empty response received, starting polling for transcription result...');

          updateStage('transcription', {
            status: 'processing',
            message: 'Transcription in progress... Waiting for result.',
            progress: 50
          });

          // Start polling for the transcription result
          let attempts = 0;
          const maxAttempts = 30; // 30 attempts = 1.5 minutes
          const pollInterval = setInterval(async () => {
            attempts++;

            try {
              // Try to get the transcription result from the webhook
              const statusResponse = await fetch('https://purposewaze.app.n8n.cloud/webhook/newfiles-status', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (statusResponse.ok) {
                const statusResult = await statusResponse.text();
                console.log(`📊 Polling attempt ${attempts}: ${statusResult.substring(0, 100)}...`);

                if (statusResult && statusResult.trim().length > 10) {
                  // Got transcription result
                  clearInterval(pollInterval);

                  updateStage('transcription', {
                    status: 'completed',
                    data: statusResult.trim(),
                    message: 'Audio transcription completed successfully!',
                    progress: 100
                  });

                  toast({
                    title: "Transcription Complete!",
                    description: "Your audio has been successfully transcribed.",
                  });

                  setUploadingAudio(false);
                  clearFileSelection();
                  return;
                }
              }

              // Update progress
              const progress = Math.min(50 + (attempts * 1.5), 95);
              updateStage('transcription', {
                status: 'processing',
                message: `Transcription in progress... (${attempts}/${maxAttempts})`,
                progress
              });

              // Check if max attempts reached
              if (attempts >= maxAttempts) {
                clearInterval(pollInterval);

                updateStage('transcription', {
                  status: 'error',
                  message: 'Transcription timeout - please check your n8n workflow and try again.',
                  progress: 0
                });

                toast({
                  title: "Transcription Timeout",
                  description: "The transcription process took too long. Please check your n8n workflow.",
                  variant: "destructive"
                });

                setUploadingAudio(false);
              }
            } catch (pollError) {
              console.error('❌ Error polling for transcription:', pollError);
            }
          }, 3000); // Poll every 3 seconds

          return;
        } else {
          throw new Error(`Unexpected response format: "${responseText}"`);
        }
      }

      // Handle structured JSON response
      console.log('🔍 Parsed JSON response:', result);

      if (result.success && result.transcription) {
        // Immediate transcription available
        console.log('✅ Transcription received immediately:', result.transcription.substring(0, 100) + '...');

        updateStage('transcription', {
          status: 'completed',
          data: result.transcription,
          message: 'Audio transcription completed successfully!',
          progress: 100
        });

        toast({
          title: "Transcription Complete!",
          description: "Your audio has been successfully transcribed.",
        });

        setUploadingAudio(false);
      } else if (result.jobId) {
        // Async processing - start polling
        console.log('🔄 Starting async processing with jobId:', result.jobId);
        setTranscriptionJobId(result.jobId);
        updateStage('transcription', {
          status: 'processing',
          message: 'Transcription in progress... Please wait.',
          progress: 40
        });

        // Start polling for status
        const interval = setInterval(() => {
          pollTranscriptionStatus(result.jobId!);
        }, 3000); // Poll every 3 seconds

        setPollingInterval(interval);

        // Set a timeout to stop polling after 10 minutes
        setTimeout(() => {
          if (pollingInterval) {
            clearInterval(interval);
            setPollingInterval(null);
            updateStage('transcription', {
              status: 'error',
              message: 'Transcription timeout - please try again'
            });
            setUploadingAudio(false);
          }
        }, 600000); // 10 minutes
      } else if (result.error) {
        console.error('❌ Error in response:', result.error);
        throw new Error(result.error);
      } else {
        console.error('❌ Unexpected response format:', result);
        throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
      }

      clearFileSelection();

    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      updateStage('transcription', {
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast({
        title: "Upload Failed",
        description: `Failed to upload audio file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setUploadingAudio(false);
    }
  };

  const clearFileSelection = () => {
    console.log('🧹 Clearing file selection');
    setSelectedFile(null);
    // Force re-render of file input to clear any stuck states
    setFileInputKey(prev => prev + 1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputClick = () => {
    console.log('🔍 Select File button clicked');
    console.log('📁 fileInputRef.current:', fileInputRef.current);

    try {
      if (fileInputRef.current) {
        console.log('✅ Triggering file input click');
        // Add a small delay to ensure the DOM is ready
        setTimeout(() => {
          fileInputRef.current?.click();
        }, 10);
      } else {
        console.error('❌ fileInputRef.current is null');
        // Force re-render if ref is null
        setFileInputKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('❌ Error clicking file input:', error);
      // Reset the file input on error
      setFileInputKey(prev => prev + 1);
    }
  };

  const triggerStage2 = async () => {
    updateStage('formulary_structure', { status: 'processing' });

    try {
      // Trigger stage 2 by calling the wait webhook
      const response = await fetch('https://purposewaze.app.n8n.cloud/webhook/a58ed88f-f7cf-4d7c-8519-3a1bcf998e90', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'stage2',
          transcription: stages.find(s => s.stage === 'transcription')?.data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Stage 2 response:', result);

      if (result.stage === 'formulary_structure') {
        updateStage('formulary_structure', { 
          status: 'completed', 
          data: result.formStructure,
          message: result.message 
        });

        toast({
          title: "Stage 2 Complete!",
          description: "Formulary structure generated successfully.",
        });
      }

    } catch (error) {
      console.error('❌ Error in stage 2:', error);
      updateStage('formulary_structure', { status: 'error' });
      toast({
        title: "Error",
        description: `Failed to generate formulary structure: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const triggerStage3 = async () => {
    updateStage('agent_prompt', { status: 'processing' });

    try {
      // Trigger stage 3 by calling the wait webhook
      const response = await fetch('https://purposewaze.app.n8n.cloud/webhook/7bcc01cd-6355-4055-85af-df41d3360849', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'stage3',
          formStructure: stages.find(s => s.stage === 'formulary_structure')?.data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Stage 3 response:', result);

      updateStage('agent_prompt', { 
        status: 'completed', 
        data: result.agentPrompt,
        message: result.message 
      });

      toast({
        title: "Stage 3 Complete!",
        description: "Agent prompt generated successfully.",
      });

    } catch (error) {
      console.error('❌ Error in stage 3:', error);
      updateStage('agent_prompt', { status: 'error' });
      toast({
        title: "Error",
        description: `Failed to generate agent prompt: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage.stage) {
      case 'transcription':
        return <FileText className="w-5 h-5" />;
      case 'formulary_structure':
        return <Settings className="w-5 h-5" />;
      case 'agent_prompt':
        return <Zap className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStageTitle = (stage: ProcessingStage) => {
    switch (stage.stage) {
      case 'transcription':
        return 'Audio Transcription';
      case 'formulary_structure':
        return 'Formulary Structure';
      case 'agent_prompt':
        return 'Agent Prompt';
      default:
        return stage.stage;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper function to get tab status
  const getTabStatus = (stageName: string) => {
    const stage = stages.find(s => s.stage === stageName);
    return stage?.status || 'pending';
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Video Tutorial Processor</h1>
              <p className="text-muted-foreground">Process video tutorials through 3 stages</p>
            </div>
          </div>
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={uploadingAudio}
                className="min-w-[140px]"
              >
                {uploadingAudio ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Audio</span>
                  </div>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Audio Tutorial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select an audio file to process through the 3-stage tutorial analysis workflow.
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    key={fileInputKey}
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-3">
                      <FileText className="w-8 h-8 mx-auto text-green-600" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Ready to upload
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Click to select an audio file
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supports MP3, WAV, M4A, etc. (Max 50MB)
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleFileInputClick}
                    className="mt-3"
                  >
                    {selectedFile ? 'Change File' : 'Select File'}
                  </Button>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('🔍 Cancel button clicked');
                      setShowUploadModal(false);
                      clearFileSelection();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAudioUpload}
                    disabled={!selectedFile || uploadingAudio}
                    className="min-w-[140px]"
                  >
                    {uploadingAudio ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload & Process</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>



        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transcription" className="flex items-center gap-2">
              {getStatusIcon(getTabStatus('transcription'))}
              <span>Audio Transcription</span>
              <Badge variant={getStatusBadgeVariant(getTabStatus('transcription'))} className="ml-2">
                {getTabStatus('transcription')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="formulary_structure" className="flex items-center gap-2">
              {getStatusIcon(getTabStatus('formulary_structure'))}
              <span>Formulary Structure</span>
              <Badge variant={getStatusBadgeVariant(getTabStatus('formulary_structure'))} className="ml-2">
                {getTabStatus('formulary_structure')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="agent_prompt" className="flex items-center gap-2">
              {getStatusIcon(getTabStatus('agent_prompt'))}
              <span>Agent Prompt</span>
              <Badge variant={getStatusBadgeVariant(getTabStatus('agent_prompt'))} className="ml-2">
                {getTabStatus('agent_prompt')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Audio Transcription Tab */}
          <TabsContent value="transcription" className="mt-6">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Audio Transcription
                  <Badge variant={getStatusBadgeVariant(getTabStatus('transcription'))}>
                    {getTabStatus('transcription')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const transcriptionStage = stages.find(s => s.stage === 'transcription');

                  if (transcriptionStage?.status === 'processing') {
                    return (
                      <div className="space-y-4">
                        {transcriptionStage.progress !== undefined && (
                          <div>
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                              <span>Processing Audio...</span>
                              <span>{Math.round(transcriptionStage.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${transcriptionStage.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Transcribing Audio</p>
                            <p className="text-sm text-blue-700">{transcriptionStage.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (transcriptionStage?.status === 'completed' && transcriptionStage.data) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">Transcription Complete</span>
                          <Badge variant="outline" className="ml-auto">
                            {typeof transcriptionStage.data === 'string' ? `${transcriptionStage.data.length} characters` : 'Data available'}
                          </Badge>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold mb-3">Full Transcription:</h3>
                          <Textarea
                            value={typeof transcriptionStage.data === 'string' ? transcriptionStage.data : JSON.stringify(transcriptionStage.data, null, 2)}
                            readOnly
                            className="min-h-[400px] font-mono text-sm bg-white"
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => setActiveTab('formulary_structure')}
                            className="flex items-center gap-2"
                          >
                            Next: Generate Form Structure
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="text-center py-12">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Audio Uploaded</h3>
                      <p className="text-muted-foreground mb-6">
                        Upload an audio file to start the transcription process
                      </p>
                      <Button
                        onClick={() => {
                          console.log('🔍 Upload Audio File button clicked (in tab)');
                          setShowUploadModal(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Audio File
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formulary Structure Tab */}
          <TabsContent value="formulary_structure" className="mt-6">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Formulary Structure
                  <Badge variant={getStatusBadgeVariant(getTabStatus('formulary_structure'))}>
                    {getTabStatus('formulary_structure')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const formularyStage = stages.find(s => s.stage === 'formulary_structure');
                  const transcriptionStage = stages.find(s => s.stage === 'transcription');

                  if (formularyStage?.status === 'processing') {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Generating Form Structure</p>
                            <p className="text-sm text-blue-700">{formularyStage.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (formularyStage?.status === 'completed' && formularyStage.data) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">Form Structure Generated</span>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold mb-3">Generated Form Structure (JSON):</h3>
                          <Textarea
                            value={typeof formularyStage.data === 'string' ? formularyStage.data : JSON.stringify(formularyStage.data, null, 2)}
                            readOnly
                            className="min-h-[400px] font-mono text-sm bg-white"
                          />
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('transcription')}
                          >
                            Back to Transcription
                          </Button>
                          <Button
                            onClick={() => setActiveTab('agent_prompt')}
                            className="flex items-center gap-2"
                          >
                            Next: Generate Agent Prompt
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  if (transcriptionStage?.status === 'completed') {
                    return (
                      <div className="text-center py-12">
                        <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ready to Generate Form Structure</h3>
                        <p className="text-muted-foreground mb-6">
                          Generate a comprehensive form structure based on the transcribed content
                        </p>
                        <Button onClick={triggerStage2} className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Generate Formulary Structure
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Waiting for Transcription</h3>
                      <p className="text-muted-foreground mb-6">
                        Complete the audio transcription first to generate the form structure
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('transcription')}
                      >
                        Go to Audio Transcription
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Prompt Tab */}
          <TabsContent value="agent_prompt" className="mt-6">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Agent Prompt
                  <Badge variant={getStatusBadgeVariant(getTabStatus('agent_prompt'))}>
                    {getTabStatus('agent_prompt')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const agentStage = stages.find(s => s.stage === 'agent_prompt');
                  const formularyStage = stages.find(s => s.stage === 'formulary_structure');

                  if (agentStage?.status === 'processing') {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Generating Agent Prompt</p>
                            <p className="text-sm text-blue-700">{agentStage.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (agentStage?.status === 'completed' && agentStage.data) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">Agent Prompt Generated</span>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold mb-3">Generated Agent Prompt:</h3>
                          <Textarea
                            value={typeof agentStage.data === 'string' ? agentStage.data : JSON.stringify(agentStage.data, null, 2)}
                            readOnly
                            className="min-h-[400px] font-mono text-sm bg-white"
                          />
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('formulary_structure')}
                          >
                            Back to Form Structure
                          </Button>
                          <Button className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Workflow Complete
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  if (formularyStage?.status === 'completed') {
                    return (
                      <div className="text-center py-12">
                        <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ready to Generate Agent Prompt</h3>
                        <p className="text-muted-foreground mb-6">
                          Generate workflow instructions and agent prompts based on the form structure
                        </p>
                        <Button onClick={triggerStage3} className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Generate Agent Prompt
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Waiting for Form Structure</h3>
                      <p className="text-muted-foreground mb-6">
                        Complete the form structure generation first to create the agent prompt
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('formulary_structure')}
                      >
                        Go to Form Structure
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
