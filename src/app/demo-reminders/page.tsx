'use client';

import React from 'react';
import ReminderScreen from '@/components/organisms/ReminderScreen';

export default function DemoRemindersPage() {
  return (
    <div className="min-h-screen">
      <ReminderScreen userId="demo-user-123" />
    </div>
  );
}
