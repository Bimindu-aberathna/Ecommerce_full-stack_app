import React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

/**
 * Card Component - Reusable container for content
 * Used for product cards, dashboard widgets, forms, etc.
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  href, 
  onClick 
}) => {
  const cardClasses = cn(
    'rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md',
    onClick && 'cursor-pointer',
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('p-6 pb-4', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
);
