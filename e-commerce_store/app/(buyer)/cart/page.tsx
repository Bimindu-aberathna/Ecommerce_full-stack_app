"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { useCart } from "@/src/hooks/useCart";
import { fetchCart, removeCartItem, updateCart } from "@/src/services/cart.service";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface cartItem {
  id: string;
  cartId: string;
  productVarietyId: string;
  quantity: number;
  productVariety: {
    id: string;
    name: string;
    stock: number;
    product: {
      id: string;
      name: string;
      price: string;
      originalPrice: string;
      brand: string;
      images: string; // JSON string
    };
  };
}

interface cart {
  id: string;
  status: string;
  items: cartItem[];
}

function CartPage() {
  const [cart, setCart] = useState<cart | null>(null);
  const { isAuthenticated, token } = useAuth();
  const [cartExists, setCartExists] = useState<boolean>(false);
  const {updateCartCount} = useCart();

  const getCart = async () => {
    const response = await fetchCart({ isAuthenticated, token: token ?? "" });
    if (response.success) {
      setCart(response.data);
      setCartExists(response?.cartExists);
      updateCartCount(response?.data?.items.length || 0);
    } else {
      toast.error("Failed to fetch cart");
    }
  };
  useEffect(() => {
    getCart();
  }, [isAuthenticated, token]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
  try {
    const response = await updateCart({ 
      isAuthenticated, 
      token: token ?? "", 
      itemId, 
      quantity: newQuantity 
    });
    
    if (response.success) {
      if (newQuantity <= 0) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated successfully');
      }
      getCart(); // Refresh cart to reflect changes
    } else {
      toast.error(response.message || "Failed to update cart");
    }
  } catch (error) {
    toast.error("Failed to update cart");
    console.error('Cart update error:', error);
  }
};

const removeItem=async(itemId: string)=>{
  try {
    const response = await removeCartItem({ isAuthenticated, token: token ?? "", itemId });
    if (response.success) {
      toast.success('Item removed from cart');
      getCart();
    } else {
      toast.error(response.message || "Failed to remove item");
    }
  } catch (error) {
    toast.error("Failed to remove item");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-10 sm:px-0">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-blue-800 text-center sm:text-left">
          My Cart
        </h1>
        {cartExists ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                {/* Render Cart Items */}
                {cart?.items.map((item) => (
                  <div
                    key={item?.id}
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b pb-4 sm:pb-6"
                  >
                    <img
                      src={
                        item?.productVariety?.product?.images
                          ? JSON.parse(item?.productVariety?.product?.images)[0]
                          : "https://i.pcmag.com/imagery/reviews/04xfuyigoH0cSxuxGwpNFuM-5.fit_lim.size_480x280.v1727225999.jpg"
                      }
                      alt={item?.productVariety?.product?.name}
                      className="w-20 h-20 object-cover rounded mb-2 sm:mb-0"
                    />
                    <div className="flex-1 w-full">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                        {item?.productVariety?.product?.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {item?.productVariety?.product?.brand} • {item?.productVariety?.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <button
                            className="cart-quantity-btn px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            -
                          </button>

                          <span className="px-3 sm:px-4 font-medium">{item.quantity}</span>

                          <button
                            className="cart-quantity-btn px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                            onClick={() => handleQuantityChange(item.id, +1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="cart-remove-btn text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          onClick={() => removeItem(item?.id)} 
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-bold !text-gray-600 mt-2 sm:mt-0">
                      Rs. {item?.productVariety?.product?.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Cart Summary */}
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 h-fit mt-6 md:mt-0">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">
                Order Summary
              </h3>
              <div className="flex justify-between mb-2 text-gray-600 text-sm sm:text-base">
                <span>Subtotal</span>
                <span>$49.99</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600 text-sm sm:text-base">
                <span>Shipping</span>
                <span>$4.99</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base sm:text-lg border-t pt-2 sm:pt-4 mt-2 sm:mt-4">
                <span>Total</span>
                <span>$54.98</span>
              </div>
              <div className="flex justify-center text-gray-400 text-xs sm:text-sm border-t mt-2">
                <span>includes government taxes</span>
              </div>
              <button className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 sm:py-3 rounded transition">
                Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Your cart is empty</p>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default CartPage;
