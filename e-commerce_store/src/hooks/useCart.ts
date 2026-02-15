import { useAppSelector, useAppDispatch } from "@/src/store";
import { setCount } from "@/src/store"; // Import cart action, not auth actions
import axios from "axios";



export const useCart = () => {
  const dispatch = useAppDispatch();
  
  const { itemCount } = useAppSelector((state) => state.cart);

  const getCartCount = async (token: string) => {
    try {
      const response = await axios.get(
        `/api/cart/itemCount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { success, itemCount } = response.data;

      if (success) {
        dispatch(setCount(itemCount));
        return { success: true, itemCount };
      } else {
        return { success: false, message: 'Failed to fetch cart count' };
      }
    } catch (error) {
      console.error('Cart count fetch error:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch cart count';
      return { success: false, message };
    }
  };

  const updateCartCount = (count: number) => {
    dispatch(setCount(count));
  };

  const incrementCartCount = () => {
    dispatch(setCount(itemCount + 1));
  };

  return {
    itemCount, 
    getCartCount,
    updateCartCount,
    incrementCartCount
  };
};