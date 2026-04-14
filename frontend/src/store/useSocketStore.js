import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './useAuthStore.js';

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  // unreadCounts: { [userId]: number }
  unreadCounts: {},

  connectSocket: () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket });

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Global listener — tracks unread messages from any user
    socket.on('newMessage', (newMessage) => {
      const { authUser: currentUser } = useAuthStore.getState();
      // Only count messages sent TO me, not by me
      if (String(newMessage.senderId) === String(currentUser?._id)) return;

      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1,
        },
      }));
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null, onlineUsers: [], unreadCounts: {} });
    }
  },

  // Call this when user opens a chat — clears their unread badge
  clearUnread: (userId) => {
    set((state) => {
      const updated = { ...state.unreadCounts };
      delete updated[userId];
      return { unreadCounts: updated };
    });
  },
}));
