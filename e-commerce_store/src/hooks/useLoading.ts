import { useAppDispatch, useAppSelector } from '@/src/store';
import { startLoading, stopLoading, updateLoadingMessage } from '@/src/store';
import { useCallback } from 'react';

type LoadingType = 'auth' | 'profile' | 'products' | 'cart' | 'orders' | 'general';

export const useLoading = () => {
  const dispatch = useAppDispatch();
  const { isLoading, loadingMessage, loadingType } = useAppSelector(
    (state) => state.loading
  );

  const showLoading = useCallback((
    message: string = "Loading...", 
    type: LoadingType = "general"
  ) => {
    dispatch(startLoading({ message, type }));
  }, [dispatch]);

  const hideLoading = useCallback(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  const updateMessage = useCallback((message: string) => {
    dispatch(updateLoadingMessage(message));
  }, [dispatch]);

  return {
    isLoading,
    loadingMessage,
    loadingType,
    showLoading,
    hideLoading,
    updateMessage,
  };
};