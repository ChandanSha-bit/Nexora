import React, { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, KeyRound, User as UserIcon, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLogo from '../components/AuthLogo';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

// Variants for staggered entrance animation to simulate Page Transitions
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1
    } 
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
void motion;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();
  
  const { register, isSigningUp, authUser } = useAuthStore();

  // Redirect to chat after successful registration
  useEffect(() => {
    if (authUser) {
      navigate('/chat', { replace: true });
    }
  }, [authUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("All fields are required");
    }
    if (!formData.email.includes('@')) {
      return toast.error("Please enter a valid email");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    register({ name: formData.name, email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-3 sm:p-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#161B22] w-full max-w-[335px] rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-white/10"
      >
        <motion.div variants={childVariants} className="mb-3 flex items-center justify-center">
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
            New Account
          </span>
        </motion.div>

        <motion.div variants={childVariants} className="flex justify-center">
          <AuthLogo />
        </motion.div>

        <motion.div variants={childVariants} className="mb-3 mt-0 text-center">
          <h1 className="text-white text-base font-semibold">Create your account</h1>
          <p className="mt-1 text-xs text-gray-400">Join and start chatting securely in minutes</p>
        </motion.div>

        <form className="space-y-2.5" onSubmit={handleSubmit}>
          
          <motion.div variants={childVariants} className="space-y-1">
            <label className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Full Name</label>
            <div className="relative flex items-center group">
              <UserIcon className="absolute left-3.5 text-gray-500 h-4 w-4 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-1.5 pl-10 pr-3 text-[12px] text-white focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all placeholder-gray-600" 
                placeholder="John Doe" 
              />
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-1">
            <label className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Email</label>
            <div className="relative flex items-center group">
              <Mail className="absolute left-3.5 text-gray-500 h-4 w-4 group-focus-within:text-white transition-colors" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-1.5 pl-10 pr-3 text-[12px] text-white focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all placeholder-gray-600" 
                placeholder="hi@nexora.com" 
              />
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-1">
            <label className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Password</label>
            <div className="relative flex items-center group">
              <KeyRound className="absolute left-3.5 text-gray-500 h-4 w-4 group-focus-within:text-white transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-1.5 pl-10 pr-10 text-[12px] text-white focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all placeholder-gray-600" 
                placeholder="••••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-500 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Confirm Password</label>
              <span className="text-[11px] text-gray-500">Min 6 characters</span>
            </div>
            <div className="relative flex items-center group">
              <KeyRound className="absolute left-3.5 text-gray-500 h-4 w-4 group-focus-within:text-white transition-colors" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-1.5 pl-10 pr-10 text-[12px] text-white focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all placeholder-gray-600" 
                placeholder="••••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-gray-500 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={childVariants}>
            <motion.button 
              whileHover={{ scale: 1.01, backgroundColor: "#818cf8" }}
              whileTap={{ scale: 0.97 }}
              type="submit" 
              disabled={isSigningUp}
              className="w-full flex items-center justify-center bg-indigo-500 text-white text-[12px] font-semibold rounded-xl py-1.5 transition-colors mt-1.5 shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSigningUp ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign Up"}
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={childVariants} className="text-center text-[11px] text-gray-400 mt-3 border-t border-white/10 pt-2.5">
          Already have an account? <Link to="/login" className="text-white hover:underline font-medium">Log in</Link>
        </motion.p>

      </motion.div>
    </div>
  );
};

export default Register;
