import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';

export default function FileUploadTest() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 File input change event triggered');
    const file = event.target.files?.[0];
    if (file) {
      console.log('✅ File selected:', file.name, file.size, file.type);
      setSelectedFile(file);
    }
  };

  const handleSelectFileClick = () => {
    console.log('🔍 Select File button clicked');
    console.log('📁 fileInputRef.current:', fileInputRef.current);
    if (fileInputRef.current) {
      console.log('✅ Triggering file input click');
      fileInputRef.current.click();
    } else {
      console.error('❌ fileInputRef.current is null');
    }
  };

  const handleModalOpen = () => {
    console.log('🔍 Modal open button clicked');
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">File Upload Test</h2>
      
      {/* Simple file input test */}
      <div className="mb-8 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Direct File Input Test</h3>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="mb-2"
        />
        {selectedFile && (
          <p className="text-green-600">Selected: {selectedFile.name}</p>
        )}
      </div>

      {/* Hidden file input with button test */}
      <div className="mb-8 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Hidden Input + Button Test</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button onClick={handleSelectFileClick}>
          Select File (Hidden Input)
        </Button>
        {selectedFile && (
          <p className="text-green-600 mt-2">Selected: {selectedFile.name}</p>
        )}
      </div>

      {/* Dialog modal test */}
      <div className="mb-8 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Dialog Modal Test</h3>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button onClick={handleModalOpen}>
              <Upload className="w-4 h-4 mr-2" />
              Open Modal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Modal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Modal content here</p>
              <Button onClick={handleSelectFileClick}>
                Select File in Modal
              </Button>
              <Button onClick={() => setShowModal(false)}>
                Close Modal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
