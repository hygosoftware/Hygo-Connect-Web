import React, { useRef } from 'react';

interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  label?: string;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className = '',
  autoComplete,
  autoCapitalize = 'none',
  label,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`w-full ${className}`} style={{ position: 'relative' }}>
      {label && (
        <label className="block mb-1 text-sm font-semibold text-gray-700">{label}</label>
      )}
      <div
        className={`flex items-center border rounded-xl overflow-hidden bg-gray-50 transition-all duration-150 ${
          error ? 'border-red-500' : 'border-gray-200'
        } focus-within:border-blue-500`}
      >
        <input
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 text-base py-4 px-3 text-gray-800 bg-transparent focus:outline-none"
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          aria-label={label || placeholder}
        />
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear input"
            onClick={handleClear}
            tabIndex={0}
            className="mx-2 text-gray-400 hover:text-gray-700 focus:outline-none bg-transparent"
            style={{ fontSize: 18, lineHeight: 1 }}
          >
            &#10005;
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default EnhancedInput;
