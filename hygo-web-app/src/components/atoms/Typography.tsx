import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'text-primary' | 'text-secondary';
  align?: 'left' | 'center' | 'right';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'text-primary',
  align = 'left',
  className = '',
  as,
}) => {
  const variantClasses = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-bold',
    h5: 'text-lg font-bold',
    h6: 'text-base font-bold',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
    subtitle1: 'text-lg font-medium',
    subtitle2: 'text-base font-medium',
  };

  const colorClasses = {
    primary: 'text-[#0E3293]',
    secondary: 'text-gray-700',
    success: 'text-[#10B981]',
    error: 'text-[#EF4444]',
    warning: 'text-[#F59E0B]',
    info: 'text-[#06B6D4]',
    'text-primary': 'text-gray-900',
    'text-secondary': 'text-gray-600',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const defaultElements = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    subtitle1: 'h6',
    subtitle2: 'h6',
  };

  const Component = as || (defaultElements[variant] as keyof JSX.IntrinsicElements);
  const classes = `${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${className}`;

  return React.createElement(Component, { className: classes }, children);
};

export default Typography;
