import React, { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  allowNegative?: boolean;
  className?: string;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>((
  {
    value,
    onValueChange,
    prefix,
    suffix,
    min,
    max,
    step = 1,
    decimals = 2,
    allowNegative = false,
    className,
    ...props
  },
  ref
) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format the value for display
  useEffect(() => {
    if (value === undefined || value === null) {
      setDisplayValue('');
    } else {
      // Format the number with the correct number of decimal places
      const formatted = parseFloat(value.toFixed(decimals));
      setDisplayValue(formatted.toString());
    }
  }, [value, decimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty input (will be treated as 0 on blur)
    if (newValue === '') {
      setDisplayValue('');
      return;
    }

    // Handle negative values if allowed
    if (newValue === '-' && allowNegative) {
      setDisplayValue('-');
      return;
    }

    // Allow only numbers and decimal point with specified decimal places
    newValue.split('.')[1];
    const decimalRegex = decimals > 0
      ? new RegExp(`^-?\\d*\\.?\\d{0,${decimals}}$`)
      : /^-?\d*$/;
      
    const regex = allowNegative ? decimalRegex : /^\d*\.?\d*$/;
    
    if (regex.test(newValue)) {
      setDisplayValue(newValue);
    }
  };

  const handleBlur = () => {
    let newValue: number;

    if (displayValue === '' || displayValue === '-') {
      newValue = min !== undefined && min > 0 ? min : 0;
    } else {
      newValue = parseFloat(displayValue);
    }

    // Apply min/max constraints
    if (min !== undefined && newValue < min) {
      newValue = min;
    }
    if (max !== undefined && newValue > max!) {
      newValue = max;
    }

    // Format to specified number of decimal places
    const formatted = parseFloat(newValue.toFixed(decimals));
    
    // Update display value and call onValueChange
    setDisplayValue(formatted.toString());
    onValueChange(formatted);
  };

  const handleIncrement = () => {
    const currentValue = displayValue === '' || displayValue === '-' 
      ? (min !== undefined && min > 0 ? min : 0)
      : parseFloat(displayValue);
    
    let newValue = currentValue + step;

    // Apply max constraint
    if (max !== undefined && newValue > max) {
      newValue = max;
    }

    const formatted = parseFloat(newValue.toFixed(decimals));
    setDisplayValue(formatted.toString());
    onValueChange(formatted);
  };

  const handleDecrement = () => {
    const currentValue = displayValue === '' || displayValue === '-' 
      ? (min !== undefined && min > 0 ? min : 0)
      : parseFloat(displayValue);
    
    let newValue = currentValue - step;

    // Apply min constraint
    if (min !== undefined && newValue < min) {
      newValue = min;
    } else if (!allowNegative && newValue < 0) {
      newValue = 0;
    }

    const formatted = parseFloat(newValue.toFixed(decimals));
    setDisplayValue(formatted.toString());
    onValueChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrows to increment/decrement
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        handleIncrement();
      } else {
        handleDecrement();
      }
    }
  };

  // Disable wheel event to prevent accidental changes
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).blur();
  };

  const isMinDisabled = min !== undefined ? value <= min : !allowNegative && value <= 0;
  const isMaxDisabled = max !== undefined && value >= max;

  return (
    <div className="relative flex items-center group">
      {prefix && (
        <span className="absolute left-3 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        className={cn(
          'text-right',
          prefix ? 'pl-10' : 'pl-3',
          suffix ? 'pr-10' : 'pr-3',
          className
        )}
        {...props}
      />
      
      <div className="absolute right-2 flex flex-col space-y-0.5">
        <button
          type="button"
          className={cn(
            "h-4 w-5 flex items-center justify-center rounded-sm",
            "border border-input hover:bg-accent hover:text-accent-foreground",
            "transition-colors duration-200",
            isMaxDisabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleIncrement}
          disabled={isMaxDisabled}
          aria-label="Increment"
        >
          <Plus className="h-3 w-3" />
        </button>
        
        <button
          type="button"
          className={cn(
            "h-4 w-5 flex items-center justify-center rounded-sm",
            "border border-input hover:bg-accent hover:text-accent-foreground",
            "transition-colors duration-200",
            isMinDisabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleDecrement}
          disabled={isMinDisabled}
          aria-label="Decrement"
        >
          <Minus className="h-3 w-3" />
        </button>
      </div>
      
      {suffix && (
        <span className="absolute right-10 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
});

InputNumber.displayName = 'InputNumber';
