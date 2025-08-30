import React from 'react';
import { Icon, IconName } from '../atoms';

export interface PaymentMethodCardProps {
  method: {
    id: string;
    name: string;
    icon: IconName;
  };
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 transition-colors ${
        isSelected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-primary-300 bg-white'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              isSelected ? 'bg-primary-100' : 'bg-gray-100'
            }`}
          >
            <Icon
              name={method.icon}
              size="medium"
              className={isSelected ? 'text-primary-600' : 'text-gray-600'}
            />
          </div>
          <span
            className={`font-medium ${
              isSelected ? 'text-primary-900' : 'text-gray-900'
            }`}
          >
            {method.name}
          </span>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected
              ? 'border-primary-600 bg-primary-600'
              : 'border-gray-300'
          }`}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default PaymentMethodCard;
