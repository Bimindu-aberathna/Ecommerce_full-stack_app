'use client';
import React from 'react';
import LoadingSpinner from '../common/Loading/LoadingSpinner';
const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <LoadingSpinner fullScreen />
    </>
  );
};

export default LoadingProvider;