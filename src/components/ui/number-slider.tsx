import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface NumberSliderProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
}

export function NumberSlider({ 
  value, 
  onChange, 
  label, 
  min = 1, 
  max = 10, 
  step = 1,
  required = false,
  className = ""
}: NumberSliderProps) {
  // Convert string value to number, default to min if empty or invalid
  const numericValue = value ? parseInt(value, 10) : min;
  const validValue = isNaN(numericValue) ? min : Math.max(min, Math.min(max, numericValue));

  const handleSliderChange = (values: number[]) => {
    onChange(values[0].toString());
  };

  // Generate tick marks for visual reference
  const generateTicks = () => {
    const ticks = [];
    for (let i = min; i <= max; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

  const ticks = generateTicks();

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="px-3">
        {/* Current Value Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-bold text-lg">
            {validValue}
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <Slider
            value={[validValue]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          
          {/* Tick marks and labels */}
          <div className="flex justify-between mt-2 px-1">
            {ticks.map((tick) => (
              <div key={tick} className="flex flex-col items-center">
                <div className="w-0.5 h-2 bg-gray-300 mb-1"></div>
                <span className="text-xs text-gray-500 font-medium">{tick}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Range Labels */}
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span className="font-medium">
            {min} {min === 1 ? '(Rarely)' : '(Low)'}
          </span>
          <span className="font-medium">
            {max} {max === 10 ? '(Daily)' : '(High)'}
          </span>
        </div>
      </div>
    </div>
  );
}
