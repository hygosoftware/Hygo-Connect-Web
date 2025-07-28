'use client';

import React, { createContext, useContext } from 'react';

interface HeaderContextType {
  onMobileMenuToggle: () => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
};

interface HeaderProviderProps {
  children: React.ReactNode;
  onMobileMenuToggle: () => void;
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({
  children,
  onMobileMenuToggle,
}) => {
  return (
    <HeaderContext.Provider value={{ onMobileMenuToggle }}>
      {children}
    </HeaderContext.Provider>
  );
};

export default HeaderProvider;
