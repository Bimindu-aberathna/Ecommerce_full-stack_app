"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { useCart } from "@/src/hooks/useCart";
import {
  checkCartAvailability,
  deleteCart,
  fetchCart,
  removeCartItem,
  updateCart,
} from "@/src/services/cart.service";
import profileService from "@/src/services/profile.service";
import { ClipboardX, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  originalTotal: number;
  calculatedTotal: number;
  totalSavings: number;
  discountPercentageGiven: number;
  shippingCost: number;
}

function CartPage() {
  const [cart, setCart] = useState<cart | null>(null);
  const { isAuthenticated, token } = useAuth();
  const [cartExists, setCartExists] = useState<boolean>(false);
  const { updateCartCount } = useCart();
  const [fetchUserData, setFetchUserData] = useState<boolean>(false);
  const router = useRouter();

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
        quantity: newQuantity,
      });

      if (response.success) {
        if (newQuantity <= 0) {
          toast.success("Item removed from cart");
        } else {
          toast.success("Cart updated successfully");
        }
        getCart(); // Refresh cart to reflect changes
      } else {
        toast.error(response.message || "Failed to update cart");
      }
    } catch (error) {
      toast.error("Failed to update cart");
      console.error("Cart update error:", error);
    }
  };

  const handleCheckout = async () => {
    if (!cart?.id) {
      toast.error("No cart found, Try refreshing the page");
      return;
    }
    if (cart?.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setFetchUserData(true);
    const result = await profileService.fetchUserProfile(token ?? "");
    if (!result.success) {
      toast.error("Failed to fetch user data");
      return;
    }

    const availability = await checkCartAvailability({
      isAuthenticated,
      token: token ?? "",
      cartId: cart?.id
    });
    if(!availability.success) {
      if(availability.lowStockItems.length > 0) {
        toast.error( `Some items are out of stock or have insufficient stock: ${availability.lowStockItems.map(item => item.name).join(", ")}` );
        setFetchUserData(false);
      }else{
        toast.error( availability.message || "Failed to check cart availability");
      }
      return;
    }

    const dataObject = {
      cartId: cart?.id,
      amount: cart?.calculatedTotal || 0,
      shippingCost: cart?.shippingCost || 0,
      address: result.data.address || "",
      postalCode: result.data.postalCode || "",
      email: result.data.email || "",
      telephone: result.data.phone || "",
    };
    const queryString = new URLSearchParams(dataObject as any).toString();
    router.push(`/checkout?${queryString}`);

  };

  const handleDeleteCart = async() => {
    if(!cart?.id) {
      toast.error("No cart found, Try refreshing the page");
      return;
    }
    try {
      const response = await deleteCart({
        isAuthenticated,
        token: token ?? "",
        cartId: cart?.id ,
      });
      if (response.success) {
        toast.success("Cart cleared");
        setCart(null);
        setCartExists(false);
        updateCartCount(0);
      } else {
        toast.error(response.message || "Failed to clear cart");
      }
    } catch (error) {
      toast.error("Failed to clear cart");
      console.error("Clear cart error:", error);
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await removeCartItem({
        isAuthenticated,
        token: token ?? "",
        itemId,
      });
      if (response.success) {
        toast.success("Item removed from cart");
        getCart();
      } else {
        toast.error(response.message || "Failed to remove item");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-4 lg:py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-lg sm:rounded-xl shadow-md lg:shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: 'var(--text)' }}>
            My Cart
          </h1>
          {cartExists && (<button
            className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-700 flex gap-1 items-center transition-colors"
            onClick={handleDeleteCart}
          >
            <ClipboardX size={16} />
            Clear Cart
          </button>)}
        </div>
        {cartExists ? (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4 sm:space-y-6">
                {cart?.items.map((item) => (
                  <div
                    key={item?.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 border-b pb-4 sm:pb-6"
                  >
                    <img
                      src={
                        item?.productVariety?.product?.images
                          ? JSON.parse(item?.productVariety?.product?.images)[0]
                          : "https://i.pcmag.com/imagery/reviews/04xfuyigoH0cSxuxGwpNFuM-5.fit_lim.size_480x280.v1727225999.jpg"
                      }
                      alt={item?.productVariety?.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                    />
                    <div className="flex-1 w-full">
                      <h2 className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: 'var(--text)' }}>
                        {item?.productVariety?.product?.name}
                      </h2>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--secondary)' }}>
                        {item?.productVariety?.product?.brand} • {item?.productVariety?.name}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mt-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            className="cart-quantity-btn px-2 py-1 text-xs sm:text-sm"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            -
                          </button>
                          <span className="px-2 sm:px-3 font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            className="cart-quantity-btn px-2 py-1 text-xs sm:text-sm"
                            onClick={() => handleQuantityChange(item.id, +1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart-remove-btn text-red-500 hover:text-red-700 p-1 text-xs sm:text-sm"
                          onClick={() => removeItem(item?.id)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: 'var(--primary)' }}>
                      Rs. {item?.productVariety?.product?.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 h-fit">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4" style={{ color: 'var(--text)' }}>
                Order Summary
              </h3>
              <div className="flex justify-between mb-2 text-xs sm:text-sm lg:text-base" style={{ color: 'var(--secondary)' }}>
                <span>Subtotal</span>
                <span>{cart?.originalTotal ? cart.originalTotal : 0} lkr</span>
              </div>
              <div className="flex justify-between mb-2 text-xs sm:text-sm lg:text-base" style={{ color: 'var(--secondary)' }}>
                <span>Discount</span>
                <span>{cart?.totalSavings ? cart.totalSavings : 0} lkr</span>
              </div>
              <div className="flex justify-between mb-2 text-sm sm:text-base lg:text-lg font-semibold" style={{ color: 'var(--text)' }}>
                <span>Final Price</span>
                <span style={{ color: 'var(--primary)' }}>{cart?.calculatedTotal ? cart.calculatedTotal : 0} lkr</span>
              </div>
              {cart?.discountPercentageGiven && (
                <div>
                  <span className="text-green-600 font-semibold text-xs sm:text-sm">
                    {cart.discountPercentageGiven}% Off deal
                  </span>
                </div>
              )}
              <div className="flex justify-between mb-2 text-gray-600 text-sm sm:text-base">
                <span>Shipping</span>
                <span>{cart?.shippingCost ? cart.shippingCost : 0}</span> lkr
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base sm:text-lg border-t pt-2 sm:pt-4 mt-2 sm:mt-4">
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }} className="font-bold">
                  {((cart?.calculatedTotal && cart?.shippingCost) ? cart.calculatedTotal + cart.shippingCost : 0).toFixed(2)} lkr
                </span>
              </div>
              <div className="flex justify-center text-xs sm:text-sm border-t mt-2 pt-2" style={{ color: 'var(--text-muted)' }}>
                <span>includes government taxes</span>
              </div>
              <button 
                className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 sm:py-3 rounded transition hover:opacity-90 text-sm sm:text-base" 
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckout();
                }}
              >
                {fetchUserData ? "Loading..." : "Checkout"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--secondary)' }}>
            <p className="text-sm sm:text-base">Your cart is empty</p>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default CartPage;
