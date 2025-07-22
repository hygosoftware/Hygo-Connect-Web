'use client';

import React from 'react';
import { Typography, Icon } from '../../components/atoms';

const RecordsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-blue-800 px-4 py-4 shadow-lg">
        <Typography variant="h6" className="text-white font-semibold">
          Medical Records
        </Typography>
        <Typography variant="body2" className="text-blue-100 text-sm">
          View and manage your health records
        </Typography>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Icon name="document" size="large" color="#9ca3af" className="mb-4 w-16 h-16" />
          <Typography variant="h6" color="secondary" className="mb-2">
            Medical Records
          </Typography>
          <Typography variant="body2" color="secondary" className="text-center mb-6">
            This page will show your medical records, test results, and health documents
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default RecordsPage;
