import React from 'react';
import { CartItem as CartItemType } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Button } from '../../ui/Button';

/**
 * CartItem Component - Individual item in shopping cart
 * Shows product details, quantity controls, and remove option
 * Used in cart page and cart sidebar
 */
interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={item.product.images[0] || '/images/placeholder-product.jpg'}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.product.name}</h3>
        <p className="text-gray-600 text-sm">{item.product.brand}</p>
        <p className="text-blue-600 font-semibold mt-1">
          {formatCurrency(item.price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-8 w-8 p-0"
        >
          -
        </Button>
        
        <span className="w-12 text-center font-semibold">
          {item.quantity}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={item.quantity >= item.product.stock}
          className="h-8 w-8 p-0"
        >
          +
        </Button>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <p className="font-semibold text-lg">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Remove
      </Button>
    </div>
  );
};
