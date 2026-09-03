import axios from "axios";

// Use same-origin API path. `next.config.ts` rewrites `/api/*` to your backend.
const apiUrl = "/api";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const getApiErrorMessage = (data: unknown, fallback: string) => {
  if (!data || typeof data !== "object") return fallback;

  const errorData = data as {
    message?: unknown;
    errors?: Array<{ msg?: unknown }>;
  };
  const validationMessage = errorData.errors?.find(
    (error) => typeof error?.msg === "string" && error.msg.trim().length > 0
  )?.msg;

  return typeof validationMessage === "string"
    ? validationMessage
    : typeof errorData.message === "string"
      ? errorData.message
      : fallback;
};

export class AuthService {
  static async register(userData: UserData) {
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        address: userData.address,
        postalCode: userData.postalCode,
        phone: userData.mobile,
      });
      
      if (response.status === 201) {
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Registration error:', {
          status: error.response.status,
          data: error.response.data,
        });
        return { 
          success: false, 
          message: getApiErrorMessage(error.response.data, 'Registration failed')
        };
      }
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async verifyToken(Token: string) {
    try {
      const response = await axios.post(`${apiUrl}/auth/verifyAuthToken`, {
       token: Token
      });
      return response.data;
    } catch (error) {
        return { 
          success: false, 
          message: 'Token verification failed' 
        };
      }
  }

  static async login(loginData: LoginData) {
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: loginData.email,
        password: loginData.password,
      });
      
      if (response.status === 200) {
        return { 
          success: true, 
          message: 'Login successful',
          data: response.data 
        };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting (429)
        if (error.response.status === 429) {
          return { 
            success: false, 
            message: 'Too many login attempts. Please wait a few minutes before trying again.',
            statusCode: 429,
            retryAfter: error.response.headers['retry-after']
          };
        }
        return { 
          success: false, 
          message: error.response.data.message || 'Login failed',
          statusCode: error.response.status
        };
      }
      return { success: false, message: 'Network error' };
    }
  }
  
  static async resetPassword(token: string, newPassword: string) {
    try {
      const response = await axios.post(`${apiUrl}/auth/reset-password`, {
        token,
        newPassword,
      });

      if (response.status === 200) {
        return { success: true, message: 'Password reset successful' };
      } else {
        return { success: false, message: 'Password reset failed' };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Password reset failed',
        };
      }
      return { success: false, message: 'Network error' };
    }
  }
}
