import React from 'react';
import { Icon } from './';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  onClear,
  showClearButton = true,
}) => {
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-blue-300 focus-within:shadow-md transition-all duration-200">
        <Icon name="search" size="small" color="#9CA3AF" className="mr-3 flex-shrink-0" />
        <input
          type="text"
          className="flex-1 text-base outline-none bg-transparent placeholder-gray-400 disabled:text-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {showClearButton && value.length > 0 && !disabled && (
          <button
            onClick={handleClear}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
            type="button"
          >
            <Icon name="x" size="small" color="#9CA3AF" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
