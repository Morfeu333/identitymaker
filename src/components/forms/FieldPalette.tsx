import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Mail, 
  Phone, 
  Hash, 
  List, 
  CheckSquare, 
  Circle, 
  FileText, 
  Calendar,
  Upload
} from 'lucide-react';

interface FieldPaletteProps {
  onAddField: (type: string) => void;
}

const fieldTypes = [
  { type: 'text', label: 'Text', icon: Type, description: 'Simple text field' },
  { type: 'phone', label: 'Phone', icon: Phone, description: 'Phone number field' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric field' },
  { type: 'select', label: 'Options List', icon: List, description: 'Dropdown list' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Checkbox selection' },
  { type: 'radio', label: 'Multiple Choice', icon: Circle, description: 'Radio buttons' },
  { type: 'ranking', label: 'Ranking', icon: List, description: 'Ranking/ordering field' },
  { type: 'textarea', label: 'Text Area', icon: FileText, description: 'Long text field' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'file', label: 'File', icon: Upload, description: 'File upload' }
];

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Available Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {fieldTypes.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <Button
                key={fieldType.type}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => onAddField(fieldType.type)}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{fieldType.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {fieldType.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}