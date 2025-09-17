import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { NumberSlider } from '@/components/ui/number-slider';
import {
  Settings,
  Trash,
  GripVertical,
  Plus,
  X
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FormFieldData {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  validation_rules: any;
  field_order: number;
}

interface FormFieldProps {
  field: FormFieldData;
  index: number;
  isPreview: boolean;
  onUpdate: (updates: Partial<FormFieldData>) => void;
  onRemove: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export function FormField({ field, index, isPreview, onUpdate, onRemove }: FormFieldProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const renderFieldInput = () => {
    const baseInputProps = {
      placeholder: field.placeholder,
      disabled: true,
      className: "bg-muted"
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return <Input {...baseInputProps} type={field.type} />;
      
      case 'number':
        return (
          <NumberSlider
            value="5"
            onChange={() => {}}
            label={field.label}
            required={field.required}
            className="pointer-events-none opacity-75"
          />
        );
      
      case 'textarea':
        return <Textarea {...baseInputProps} />;
      
      case 'date':
        return <Input {...baseInputProps} type="date" />;
      
      case 'file':
        return <Input {...baseInputProps} type="file" />;
      
      case 'select':
        return (
          <select className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" disabled>
            <option value="">{field.placeholder}</option>
            {field.options && field.options.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options && field.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input type="radio" disabled className="text-primary" />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Drag to reorder from most important (1) to least important:</p>
            {field.options && field.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2 p-2 border rounded bg-muted">
                <span className="text-sm font-medium">{idx + 1}.</span>
                <label className="text-sm flex-1">{option}</label>
                <span className="text-xs text-muted-foreground">Rank {idx + 1}</span>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled className="text-primary" />
            <label className="text-sm">{field.label}</label>
          </div>
        );
      
      default:
        return <Input {...baseInputProps} />;
    }
  };

  const addOption = () => {
    const newOptions = [...field.options, `Opção ${field.options.length + 1}`];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...field.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = field.options.filter((_, idx) => idx !== index);
    onUpdate({ options: newOptions });
  };

  if (isPreview) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {field.label}
          {field.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
        </Label>
        {renderFieldInput()}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <Badge variant="outline">{field.type}</Badge>
            <span className="font-medium">{field.label}</span>
            {field.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
          </div>
          <div className="flex gap-1">
            <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Settings className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            <Button size="sm" variant="ghost" onClick={onRemove}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          {renderFieldInput()}
        </div>

        <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor={`label-${field.id}`}>Label do Campo</Label>
                <Input
                  id={`label-${field.id}`}
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Digite o label do campo"
                />
              </div>
              
              <div>
                <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                <Input
                  id={`placeholder-${field.id}`}
                  value={field.placeholder}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Digite o placeholder"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                />
                <Label htmlFor={`required-${field.id}`}>Campo obrigatório</Label>
              </div>

              {(field.type === 'select' || field.type === 'radio' || field.type === 'ranking') && (
                <div className="md:col-span-2">
                  <Label>{field.type === 'ranking' ? 'Itens para Ranking' : 'Opções'}</Label>
                  <div className="space-y-2 mt-2">
                    {field.options.map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={field.type === 'ranking' ? `Item ${idx + 1}` : `Opção ${idx + 1}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeOption(idx)}
                          disabled={field.options.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {field.type === 'ranking' ? 'Adicionar Item' : 'Adicionar Opção'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}