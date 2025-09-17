import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Zap, Users } from 'lucide-react';

interface FormTypeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormTypeSelectionDialog({ open, onOpenChange }: FormTypeSelectionDialogProps) {
  const navigate = useNavigate();

  const handleCreateIdentityCollision = () => {
    onOpenChange(false);
    // Navigate to create form with identity collision type parameter
    navigate('/criar-formulario?type=identity-collision');
  };

  const handleCreateStandard = () => {
    onOpenChange(false);
    // Navigate to create form with standard type parameter
    navigate('/criar-formulario?type=standard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Assessment Type
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Select the type of assessment you want to create
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Identity Collision Assessment */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 group"
            onClick={handleCreateIdentityCollision}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-purple-700">
                Identity Collision Assessment
              </CardTitle>
              <CardDescription className="text-sm">
                Specialized assessment for identity pattern recognition and breakthrough analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">AI-powered pattern analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Personalized breakthrough reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Specialized for entrepreneurs</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  Perfect for identifying what's blocking premium pricing and execution
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleCreateIdentityCollision}
                >
                  Create Identity Collision Assessment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Standard Assessment */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 group"
            onClick={handleCreateStandard}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-green-700">
                Standard Assessment
              </CardTitle>
              <CardDescription className="text-sm">
                General-purpose form builder for surveys, feedback, and data collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Flexible form builder</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Multiple field types</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm">General audience</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  Ideal for surveys, feedback forms, and general data collection
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  onClick={handleCreateStandard}
                >
                  Create Standard Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
