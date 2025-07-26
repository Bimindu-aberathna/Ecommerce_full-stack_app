import { useAppDispatch, useAppSelector } from "@/src/store";
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  clearError 
} from "@/src/store";
import { registerUser, loginUser } from "@/src/services/auth";

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
    try {
      dispatch(loginStart());
      const response = await loginUser(credentials);
      
      if (response.success && response.data) {
        dispatch(loginSuccess({
          user: response.data.user,
          token: response.data.token
        }));
        return { success: true };
      } else {
        dispatch(loginFailure(response.message || 'Login failed'));
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch(loginFailure(message));
      return { success: false, message };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch(loginStart());
      const response = await registerUser(userData);
      
      if (response.success) {
        // Registration successful, but user needs to login
        dispatch(clearError());
        return { success: true, message: response.message };
      } else {
        dispatch(loginFailure(response.message || 'Registration failed'));
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch(loginFailure(message));
      return { success: false, message };
    }
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const clearAuthError = () => {
    dispatch(clearError());
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
    logout,
    clearError: clearAuthError,
    
    // Computed values
    isLoggedIn: isAuthenticated && !!user,
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    userFullName: user ? `${user.firstName} ${user.lastName}` : null,
  };
};
