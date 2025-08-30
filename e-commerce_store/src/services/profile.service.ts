import axios from "axios";
import { updateUserProfileObj } from "../types";

const fetchUserProfile = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || response.data.user, 
      };
    } else {
      throw new Error(response.data?.message || "Failed to fetch user profile");
    }
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Insufficient permissions.");
      } else if (error.response?.status === 404) {
        throw new Error("User profile not found.");
      } else if (error.response?.status !== undefined && error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch user profile");
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

const updateUserProfile = async (token: string, profileData: updateUserProfileObj) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || response.data.user,
      };
    } else {
      throw new Error(response.data?.message || "Failed to update user profile");
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Insufficient permissions.");
      } else if (error.response?.status === 404) {
        throw new Error("User profile not found.");
      } else if (error.response?.status !== undefined && error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to update user profile");
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

const deleteUser = async (token: string) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data?.message,
      };
    } else {
      throw new Error(response.data?.message || "Failed to delete user profile");
    }
  } catch (error) {
    console.error("Error deleting user profile:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: error.response?.data?.message || "Authentication failed. Please login again.",
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          message: error.response?.data?.message || "Access denied. Insufficient permissions.",
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: error.response?.data?.message || "User profile not found.",
        };
      } else if (error.response?.status !== undefined && error.response.status >= 500) {
        return {
          success: false,
          message: "Server error. Please try again later.",
        };
      } else {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to delete user profile",
        };
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

const profileService = {
  fetchUserProfile,
  updateUserProfile,
  deleteUser,
};

export default profileService;
