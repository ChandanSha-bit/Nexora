import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create an Axios instance custom for our API
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Axios interceptor to magically attach the token directly from localStorage to every single request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Zustand Global State
export const useAuthStore = create((set) => ({
  authUser: null, 
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isRequestingResetOtp: false,
  isSendingResetTestEmail: false,
  isVerifyingResetOtp: false,
  isResettingPassword: false,

  // Called once when the app loads to verify if user has a valid stored token
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/users/profile');
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
      localStorage.removeItem('jwt'); // Clean up bad token
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Called when user submits Register form
  register: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/register', data);
      set({ authUser: res.data });
      // Store token so they remain logged in
      localStorage.setItem('jwt', res.data.token);
      toast.success('Account created successfully!');
    } catch (error) {
      if (!error.response) {
        toast.error('Server is starting up, please try again in a moment.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create account');
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Called when user submits Login form
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      set({ authUser: res.data });
      localStorage.setItem('jwt', res.data.token);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Called when user clicks Logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('jwt');
      set({ authUser: null });
      toast.success('Logged out!');
    } catch {
      toast.error('Error logging out');
    }
  },

  requestPasswordResetOtp: async (identifier) => {
    set({ isRequestingResetOtp: true });
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { identifier });
      toast.success(res.data?.message || 'OTP sent successfully');
      return {
        ok: true,
        resendAfterSeconds: res.data?.resendAfterSeconds || 60,
      };
    } catch (error) {
      if (!error.response) {
        toast.error('Server is starting up, please try again in a moment.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to request password reset');
      }
      return { ok: false };
    } finally {
      set({ isRequestingResetOtp: false });
    }
  },

  sendResetTestEmail: async (email) => {
    set({ isSendingResetTestEmail: true });
    try {
      const res = await axiosInstance.post('/auth/test-reset-email', { email });
      toast.success(res.data?.message || 'Test email sent');
      return true;
    } catch (error) {
      if (!error.response) {
        toast.error('Server is starting up, please try again in a moment.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send test email');
      }
      return false;
    } finally {
      set({ isSendingResetTestEmail: false });
    }
  },

  verifyResetOtp: async ({ identifier, otp }) => {
    set({ isVerifyingResetOtp: true });
    try {
      const res = await axiosInstance.post('/auth/verify-reset-otp', { identifier, otp });
      toast.success(res.data?.message || 'OTP verified');
      return {
        ok: true,
        resetToken: res.data?.resetToken,
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
      return { ok: false, resetToken: null };
    } finally {
      set({ isVerifyingResetOtp: false });
    }
  },

  resetPasswordWithOtp: async ({ identifier, resetToken, newPassword }) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post('/auth/reset-password', { identifier, resetToken, newPassword });
      toast.success(res.data?.message || 'Password reset successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  requestDeleteAccountOtp: async () => {
    try {
      const res = await axiosInstance.post('/auth/delete-account/request-otp');
      toast.success(res.data?.message || 'OTP sent to your email');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      return false;
    }
  },

  deleteAccount: async (otp) => {
    try {
      const res = await axiosInstance.delete('/auth/delete-account', { data: { otp } });
      toast.success(res.data?.message || 'Account deleted successfully');
      localStorage.removeItem('jwt');
      set({ authUser: null });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      return false;
    }
  },

  setAuthUser: (user) => set({ authUser: user }),
}));
