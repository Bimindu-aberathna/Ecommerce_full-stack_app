import { useState, useEffect } from 'react';



export const useSellerNavbar = (defaultExpanded: boolean = true) => {
  const STORAGE_KEY = 'seller-navbar-expanded';

  
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultExpanded;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? JSON.parse(stored) : defaultExpanded;
  });

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isExpanded));
    }
  }, [isExpanded]);

  
  const toggleExpansion = () => {
    setIsExpanded(prev => !prev);
  };

  
  const setExpansion = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  
  const collapse = () => {
    setIsExpanded(false);
  };

  // Expand navbar
  const expand = () => {
    setIsExpanded(true);
  };

  return {
    isExpanded,
    toggleExpansion,
    setExpansion,
    collapse,
    expand,
  };
};