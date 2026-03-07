import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'
import { useAuthStore } from './store/authStore'

axios.interceptors.request.use((config) => {
    const user = useAuthStore.getState().user;
    if (user?.groqApiKey) {
        config.headers['x-groq-api-key'] = user.groqApiKey;
    }
    return config;
});

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
