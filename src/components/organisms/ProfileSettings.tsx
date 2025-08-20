'use client'
import React, { useState } from 'react';

import { Settings, Bell, Shield, Palette, Globe, Moon, Sun, Volume2, VolumeX, Smartphone, Mail, MessageSquare } from 'lucide-react';

interface ProfileSettingsProps {
  onClose: () => void;
}

interface SettingsState {
  theme: 'light' | 'dark' | 'auto' | string;
  language: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    appointments: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'private' | 'friends' | 'public' | string;
    dataSharing: boolean;
    analytics: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | string;
    highContrast: boolean;
    soundEffects: boolean;
  };
}

type NestedCategory = 'notifications' | 'privacy' | 'accessibility';

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    language: 'English',
    notifications: {
      push: true,
      email: true,
      sms: false,
      appointments: true,
      reminders: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      soundEffects: true,
    },
  });

  const updateSetting = <C extends NestedCategory, K extends keyof SettingsState[C]>(
    category: C,
    key: K,
    value: SettingsState[C][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as SettingsState[C]),
        [key]: value,
      } as SettingsState[C],
    }));
  };

  const SettingCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );

  const ToggleSwitch = ({ label, checked, onChange, description }: { 
    label: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectOption = ({ label, value, options, onChange }: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  }) => (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Appearance Settings */}
          <SettingCard title="Appearance" icon={<Palette className="w-5 h-5" />}>
            <SelectOption
              label="Theme"
              value={settings.theme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
              onChange={value => setSettings(prev => ({ ...prev, theme: value }))}
            />
            <SelectOption
              label="Font Size"
              value={settings.accessibility.fontSize}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
              ]}
              onChange={value => updateSetting('accessibility', 'fontSize', value)}
            />
            <ToggleSwitch
              label="High Contrast"
              checked={settings.accessibility.highContrast}
              onChange={checked => updateSetting('accessibility', 'highContrast', checked)}
              description="Improve visibility with higher contrast colors"
            />
          </SettingCard>

          {/* Notification Settings */}
          <SettingCard title="Notifications" icon={<Bell className="w-5 h-5" />}>
            <div className="space-y-2">
              <ToggleSwitch
                label="Push Notifications"
                checked={settings.notifications.push}
                onChange={checked => updateSetting('notifications', 'push', checked)}
                description="Receive notifications on your device"
              />
              <ToggleSwitch
                label="Email Notifications"
                checked={settings.notifications.email}
                onChange={checked => updateSetting('notifications', 'email', checked)}
                description="Receive notifications via email"
              />
              <ToggleSwitch
                label="SMS Notifications"
                checked={settings.notifications.sms}
                onChange={checked => updateSetting('notifications', 'sms', checked)}
                description="Receive notifications via text message"
              />
              <ToggleSwitch
                label="Appointment Reminders"
                checked={settings.notifications.appointments}
                onChange={checked => updateSetting('notifications', 'appointments', checked)}
                description="Get reminded about upcoming appointments"
              />
              <ToggleSwitch
                label="Medication Reminders"
                checked={settings.notifications.reminders}
                onChange={checked => updateSetting('notifications', 'reminders', checked)}
                description="Get reminded to take your medications"
              />
              <ToggleSwitch
                label="Marketing Communications"
                checked={settings.notifications.marketing}
                onChange={checked => updateSetting('notifications', 'marketing', checked)}
                description="Receive promotional content and health tips"
              />
            </div>
          </SettingCard>

          {/* Privacy Settings */}
          <SettingCard title="Privacy & Security" icon={<Shield className="w-5 h-5" />}>
            <SelectOption
              label="Profile Visibility"
              value={settings.privacy.profileVisibility}
              options={[
                { value: 'private', label: 'Private' },
                { value: 'friends', label: 'Friends Only' },
                { value: 'public', label: 'Public' }
              ]}
              onChange={value => updateSetting('privacy', 'profileVisibility', value)}
            />
            <ToggleSwitch
              label="Data Sharing"
              checked={settings.privacy.dataSharing}
              onChange={checked => updateSetting('privacy', 'dataSharing', checked)}
              description="Share anonymized data for research purposes"
            />
            <ToggleSwitch
              label="Analytics"
              checked={settings.privacy.analytics}
              onChange={checked => updateSetting('privacy', 'analytics', checked)}
              description="Help improve the app with usage analytics"
            />
          </SettingCard>

          {/* Language & Region */}
          <SettingCard title="Language & Region" icon={<Globe className="w-5 h-5" />}>
            <SelectOption
              label="Language"
              value={settings.language}
              options={[
                { value: 'English', label: 'English' },
                { value: 'Spanish', label: 'Español' },
                { value: 'French', label: 'Français' },
                { value: 'German', label: 'Deutsch' },
                { value: 'Chinese', label: '中文' },
                { value: 'Japanese', label: '日本語' }
              ]}
              onChange={value => setSettings(prev => ({ ...prev, language: value }))}
            />
          </SettingCard>

          {/* Accessibility */}
          <SettingCard title="Accessibility" icon={<Volume2 className="w-5 h-5" />}>
            <ToggleSwitch
              label="Sound Effects"
              checked={settings.accessibility.soundEffects}
              onChange={checked => updateSetting('accessibility', 'soundEffects', checked)}
              description="Play sounds for interactions and notifications"
            />
          </SettingCard>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save settings logic here
                console.log('Saving settings:', settings);
                onClose();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;