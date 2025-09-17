import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Share, Copy, ExternalLink, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareFormDialogProps {
  formId: string;
  formTitle: string;
  formStatus: 'draft' | 'published' | 'archived';
}

export function ShareFormDialog({ formId, formTitle, formStatus }: ShareFormDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Check if this is an Identity Collision form and use the correct route
  const isIdentityCollisionForm = formTitle === "Identity Collision Assessment";
  const formUrl = isIdentityCollisionForm
    ? `${window.location.origin}/identity-collision/${formId}`
    : `${window.location.origin}/f/${formId}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`
      });
    });
  };

  const openForm = () => {
    window.open(formUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={formStatus !== 'published'}
        >
          <Share className="w-3 h-3 mr-1" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share Form
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{formTitle}</h4>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={formStatus === 'published' ? 'default' : 'secondary'}>
                {formStatus === 'published' ? 'Published' : 'Draft'}
              </Badge>
              {formStatus !== 'published' && (
                <span className="text-sm text-muted-foreground">
                  Publish the form to share it
                </span>
              )}
            </div>
          </div>

          {formStatus === 'published' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="form-url">Form Link</Label>
                <div className="flex">
                  <Input
                    id="form-url"
                    value={formUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => copyToClipboard(formUrl, 'Link')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="flex">
                  <Input
                    id="embed-code"
                    value={embedCode}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => copyToClipboard(embedCode, 'Code')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={openForm}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(formUrl, 'Link')}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}