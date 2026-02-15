import { useAppSelector, useAppDispatch } from "@/src/store";
import { loginStart, loginSuccess, loginFailure, logout } from "@/src/store";
import { AuthService } from "@/src/services/auth.service";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  password: string;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = async (credentials: LoginCredentials) => {
    dispatch(loginStart());
    try {
      const response = await AuthService.login(credentials);
      // rename role to buyer/seller from user/admin
      if (response.data?.data?.user?.role) {
        response.data.data.user.role = response.data.data.user.role === 'admin' ? 'seller' : 'buyer';
      }
      if (response.success && response.data) {
        dispatch(loginSuccess({
          user: response.data?.data?.user,
          token: response.data?.data?.token
        }));
      } else {
        dispatch(loginFailure(response.message));
      }
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch(loginFailure(message));
      return { success: false, message };
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch(loginStart());
    try {
      const response = await AuthService.register(userData);
      if (!response.success) {
        dispatch(loginFailure(response.message));
      }
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch(loginFailure(message));
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    // State
    isAuthenticated,
    user,
    token,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout: handleLogout,
    
    // Computed values
    isLoggedIn: isAuthenticated && !!user,
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    userFullName: user ? `${user.firstName} ${user.lastName}` : null,
  };
};
