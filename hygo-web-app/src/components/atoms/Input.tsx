import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className = '',
  autoComplete,
  autoCapitalize = 'none',
}) => {
  const baseClasses = 'flex-1 text-base py-4 px-3 text-gray-800 bg-transparent focus:outline-none';
  const errorClasses = error ? 'border-red-500' : 'border-gray-200';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const inputClasses = `${baseClasses} ${disabledClasses} ${className}`;

  return (
    <div className="w-full">
      <div className={`flex items-center border rounded-xl overflow-hidden bg-gray-50 ${errorClasses}`}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClasses}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
