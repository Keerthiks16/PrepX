import { create } from 'zustand';
import axios from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeContext?: string;
  skills?: string[];
  experienceLevel?: string;
  currentRole?: string;
  groqApiKey?: string;
  projects?: {
      title: string;
      description?: string;
      workflow?: string;
      githubLink?: string;
      deploymentLink?: string;
  }[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: (userData) => set({ user: userData }),

  logout: async () => {
    try {
        await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
        set({ user: null });
    } catch (error) {
        console.error("Logout failed", error);
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('http://localhost:5000/api/auth/profile', {
        withCredentials: true 
      });
      set({ user: data, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  }
}));
