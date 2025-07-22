import React from 'react';

interface IconProps {
  name: 'email' | 'eye' | 'eye-off' | 'check' | 'x' | 'alert' | 'arrow-left' | 'menu' | 'location' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'notification' | 'plus' | 'user' | 'document' | 'pill' | 'news' | 'logout' | 'pills' | 'family' | 'doctor' | 'health-card' | 'records' | 'robot' | 'appointment' | 'laboratory' | 'video' | 'hospital' | 'clock' | 'calendar' | 'qr-code' | 'lightbulb' | 'water' | 'apple' | 'brain' | 'sleep' | 'activity' | 'hygiene' | 'chair' | 'heart' | 'home' | 'bell' | 'bell-off' | 'pill-off' | 'capsule' | 'bottle-tonic' | 'needle' | 'food' | 'edit' | 'trash' | 'chevron-up';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color = 'currentColor',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  // If className includes size classes, use those instead of default size
  const hasCustomSize = className.includes('w-') && className.includes('h-');
  const iconClasses = hasCustomSize ? className : `${sizeClasses[size]} ${className}`;

  const icons = {
    email: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    eye: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    'eye-off': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ),
    check: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    x: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    alert: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    'arrow-left': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    menu: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    location: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    'chevron-down': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    'chevron-left': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
      </svg>
    ),
    'chevron-right': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
      </svg>
    ),
    notification: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    plus: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    user: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    document: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    pill: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.998 1.998 0 004 17.618v.786a2 2 0 00.281 1.023l1.46 2.435a2 2 0 001.718.972h9.082a2 2 0 001.718-.972l1.46-2.435A2 2 0 0020 18.404v-.786a2 2 0 00-.572-1.39z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    ),
    news: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    logout: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    pills: (
      <svg className={iconClasses} fill={color} viewBox="0 0 24 24">
        <path d="M4.22 11.29l6.36-6.36a3 3 0 014.24 0l5.66 5.66a3 3 0 010 4.24l-6.36 6.36a3 3 0 01-4.24 0L3.22 15.53a3 3 0 010-4.24z"/>
        <path d="M8.46 15.54l6.36-6.36" stroke="white" strokeWidth="1.5"/>
        <circle cx="7" cy="7" r="1.5" fill="white"/>
        <circle cx="17" cy="17" r="1.5" fill="white"/>
      </svg>
    ),
    family: (
      <svg className={iconClasses} fill={color} viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="2"/>
        <circle cx="15" cy="7" r="2"/>
        <circle cx="12" cy="10" r="1.5"/>
        <path d="M6 21v-4a3 3 0 013-3h2a3 3 0 013 3v4"/>
        <path d="M13 21v-3a2 2 0 012-2h2a2 2 0 012 2v3"/>
        <path d="M5 21v-3a2 2 0 012-2h2a2 2 0 012 2v3"/>
      </svg>
    ),
    doctor: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2v2m0-2h2m-2 0H10" />
      </svg>
    ),
    'health-card': (
      <svg className={iconClasses} fill={color} viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <rect x="2" y="6" width="20" height="3" rx="2" fill="white" fillOpacity="0.3"/>
        <circle cx="6" cy="13" r="1.5" fill="white"/>
        <rect x="9" y="12" width="6" height="1" rx="0.5" fill="white"/>
        <rect x="9" y="14" width="4" height="1" rx="0.5" fill="white"/>
        <path d="M18 11v4l2-2z" fill="white"/>
      </svg>
    ),
    records: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    robot: (
      <svg className={iconClasses} fill={color} viewBox="0 0 24 24">
        <rect x="6" y="8" width="12" height="10" rx="2"/>
        <rect x="8" y="6" width="8" height="2" rx="1"/>
        <circle cx="12" cy="4" r="1"/>
        <circle cx="9" cy="11" r="1" fill="white"/>
        <circle cx="15" cy="11" r="1" fill="white"/>
        <rect x="10" y="13" width="4" height="1" rx="0.5" fill="white"/>
        <rect x="4" y="10" width="2" height="3" rx="1"/>
        <rect x="18" y="10" width="2" height="3" rx="1"/>
        <rect x="9" y="18" width="2" height="3" rx="1"/>
        <rect x="13" y="18" width="2" height="3" rx="1"/>
      </svg>
    ),
    appointment: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    ),
    laboratory: (
      <svg className={iconClasses} fill={color} viewBox="0 0 24 24">
        <path d="M9 2v6l-4 8a2 2 0 002 3h10a2 2 0 002-3l-4-8V2"/>
        <rect x="9" y="2" width="6" height="1" fill="white"/>
        <circle cx="10" cy="14" r="1" fill="white"/>
        <circle cx="14" cy="16" r="0.8" fill="white"/>
        <circle cx="12" cy="17" r="0.6" fill="white"/>
        <path d="M9 8h6" stroke="white" strokeWidth="0.5"/>
      </svg>
    ),
    video: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    hospital: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2v2m0-2h2m-2 0H10" />
      </svg>
    ),
    clock: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    calendar: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'qr-code': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    lightbulb: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    water: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" />
      </svg>
    ),
    apple: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 0c-1.5 0-3 .5-3 2 0 1.5 1.5 2 3 2s3-.5 3-2c0-1.5-1.5-2-3-2zm0 0V3m0 1v3m0 0c2.5 0 4.5 2 4.5 4.5S14.5 16 12 16s-4.5-2-4.5-4.5S9.5 7.5 12 7.5z" />
      </svg>
    ),
    brain: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    sleep: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    activity: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    hygiene: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0l1 16h8l1-16" />
      </svg>
    ),
    chair: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    heart: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    home: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    bell: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    'bell-off': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0M8 5a6 6 0 0110.29 4.33M18.73 18.73L5.27 5.27m0 0L4 6.55 18.73 21.27M9.88 9.88a3 3 0 004.24 4.24" />
      </svg>
    ),
    'pill-off': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.998 1.998 0 004 17.618v.786a2 2 0 00.281 1.023l1.46 2.435a2 2 0 001.718.972h9.082a2 2 0 001.718-.972l1.46-2.435A2 2 0 0020 18.404v-.786a2 2 0 00-.572-1.39z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
      </svg>
    ),
    capsule: (
      <svg className={iconClasses} fill={color} viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(45 12 12)"/>
        <ellipse cx="12" cy="12" rx="4" ry="4" fill="white" fillOpacity="0.3"/>
      </svg>
    ),
    'bottle-tonic': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6v2H9V3zM8 5h8v2l2 12H6L8 7V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 10h4M10 13h4" />
      </svg>
    ),
    needle: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M8 8l8-8M16 16l-8 8" />
        <circle cx="18" cy="6" r="2" fill={color} />
      </svg>
    ),
    food: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 0c-1.5 0-3 .5-3 2 0 1.5 1.5 2 3 2s3-.5 3-2c0-1.5-1.5-2-3-2zm0 0V3m0 1v3m0 0c2.5 0 4.5 2 4.5 4.5S14.5 16 12 16s-4.5-2-4.5-4.5S9.5 7.5 12 7.5z" />
      </svg>
    ),
    edit: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    trash: (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    'chevron-up': (
      <svg className={iconClasses} fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ),
  };

  return icons[name] || null;
};

export default Icon;
