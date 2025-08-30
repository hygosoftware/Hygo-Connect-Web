import React from 'react';
import { Icon } from '../atoms';

interface CashConfirmationModalProps {
  isOpen: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CashConfirmationModal: React.FC<CashConfirmationModalProps> = ({
  isOpen,
  amount,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="wallet" size="large" className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Cash Payment Confirmation
            </h3>
            <p className="text-gray-600 text-center text-sm">
              You have selected cash payment. Please pay ₹{amount.toFixed(2)} at the clinic before your appointment.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <p className="text-amber-800 text-sm text-center font-medium">
              Note: Your appointment will be confirmed, but payment must be made at the clinic.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashConfirmationModal;
