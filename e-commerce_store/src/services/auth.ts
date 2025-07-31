import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Your external backend URL

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

export const registerUser = async (userData: UserData) => {
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
    console.error('Registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          return { 
            success: false, 
            message: error.response.data.errors[0].msg || 'Registration failed' 
          };
        }
      return { 
        success: false, 
        message: error.response.data.message || 'Registration failed' 
      };
    }
    return { success: false, message: 'Network error' };
  }
};

export const loginUser = async (loginData: LoginData) => {
  console.log('Logging in user:', loginData);
  try {
    const response = await axios.post(`${apiUrl}/auth/login`, {
      email: loginData.email,
      password: loginData.password,
    });
    console.log('Login response:', response.data);
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
      return { 
        success: false, 
        message: error.response.data.message || 'Login failed' 
      };
    }
    return { success: false, message: 'Network error' };
  }
};