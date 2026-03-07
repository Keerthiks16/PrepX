import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

interface LoginProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

const Login = ({ onSwitch, onSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      login(data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-base-800 p-8 rounded-2xl shadow-xl border border-base-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">Welcome Back</h2>
      
      {error && <div className="bg-error/20 text-error p-3 rounded mb-4 text-sm border border-error/50">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-text-secondary text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-accent-600 to-accent hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-accent/20"
        >
          Sign In
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-text-secondary text-sm">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-accent-200 hover:text-accent font-semibold hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
