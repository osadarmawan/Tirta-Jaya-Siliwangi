import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number | string;
  onChangeValue?: (value: number) => void;
  prefix?: string;
}

export default function CurrencyInput({ value, defaultValue, onChangeValue, prefix = '', className, ...props }: CurrencyInputProps) {
  const formatNumber = (val: string) => {
    // Remove all non-numeric characters
    const numericValue = val.replace(/\D/g, '');
    // Add thousands separator
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const [displayValue, setDisplayValue] = useState(() => {
    if (value !== undefined && value !== null) {
      return formatNumber(value.toString());
    }
    if (defaultValue !== undefined && defaultValue !== null) {
      return formatNumber(defaultValue.toString());
    }
    return '';
  });

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value.toString()));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatNumber(rawValue);
    setDisplayValue(formattedValue);
    
    if (onChangeValue) {
      onChangeValue(rawValue ? parseInt(rawValue, 10) : 0);
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}
