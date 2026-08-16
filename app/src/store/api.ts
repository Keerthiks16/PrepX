import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to access localhost of host machine.
// For iOS simulator, use localhost.
const defaultIP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = 'https://prepx-e5cp.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
