import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

const Login = ({ onSwitch, onSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      login(data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative mx-auto">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-accent-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-base-800/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-base-900 border border-accent/40 flex items-center justify-center shadow-lg shadow-accent/20 mb-3 group hover:scale-105 transition-transform">
            <Cpu className="w-7 h-7 text-accent animate-pulse" />
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-text-primary tracking-tight">Prep</span>
            <span className="text-2xl font-black text-accent tracking-tight">X</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CAREER PLATFORM</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-center text-text-primary mb-1 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm text-center mb-5">
          Sign in to access your AI interview coach & GD practice
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error/15 text-error p-3.5 rounded-xl mb-5 text-sm border border-error/40 flex items-center gap-2"
          >
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-base-900/80 border border-base-600 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl pl-11 pr-4 py-3 text-text-primary text-sm placeholder:text-text-secondary/40 outline-none transition-all"
                required
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div>
            <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-base-900/80 border border-base-600 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl pl-11 pr-11 py-3 text-text-primary text-sm placeholder:text-text-secondary/40 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent hover:bg-accent-300 disabled:opacity-70 text-base-900 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Switch Link */}
        <div className="mt-6 pt-5 border-t border-white/5 text-center">
          <p className="text-text-secondary text-sm">
            Don't have an account?{' '}
            <button 
              onClick={onSwitch} 
              className="text-accent hover:text-accent-200 font-bold hover:underline inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </p>
        </div>


      </motion.div>
    </div>
  );
};

export default Login;

