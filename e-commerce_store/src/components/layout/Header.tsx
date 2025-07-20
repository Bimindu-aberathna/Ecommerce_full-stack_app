import React from 'react';
import Link from 'next/link';
import { User, ShoppingCart, Heart, Search, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Header Component - Main navigation header for buyers
 * Contains logo, search, navigation menu, and user actions (cart, wishlist, profile)
 */
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-blue-600"></div>
              <span className="text-xl font-bold">E-Store</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/categories" className="text-sm font-medium hover:text-blue-600">
                Categories
              </Link>
              <Link href="/deals" className="text-sm font-medium hover:text-blue-600">
                Deals
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
                  3
                </span>
                <span className="sr-only">Shopping Cart</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
