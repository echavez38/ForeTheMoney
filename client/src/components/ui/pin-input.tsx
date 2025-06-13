import React, { useState, useRef, useEffect } from 'react';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PinInput({ length = 4, value, onChange, className = '' }: PinInputProps) {
  const [pins, setPins] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const newPins = value.split('').slice(0, length);
    while (newPins.length < length) {
      newPins.push('');
    }
    setPins(newPins);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newPins = [...pins];
    newPins[index] = digit.slice(-1);
    setPins(newPins);
    onChange(newPins.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`flex space-x-2 justify-center ${className}`}>
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          className="w-12 h-12 text-center text-xl font-bold bg-dark-card border border-gray-600 rounded-lg text-white focus:border-golf-green focus:outline-none"
        />
      ))}
    </div>
  );
}
