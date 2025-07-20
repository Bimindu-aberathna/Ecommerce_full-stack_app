interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  password: string;
}

export const registerUser = async (userData: UserData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: result.message, user: result.user };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
};

// Login function
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: result.message, user: result.user };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
};