'use client';
import { useLoading } from '@/src/hooks/useLoading';
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  className = "" 
}) => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  const containerClass = fullScreen 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    : "flex items-center justify-center p-4";

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4 min-w-[200px]">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        
        {/* Loading message */}
        <p className="text-gray-600 font-medium text-center">
          {loadingMessage || "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;