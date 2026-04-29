import React, { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
void motion;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();
  const { register, isSigningUp, authUser } = useAuthStore();

  useEffect(() => { if (authUser) navigate('/chat', { replace: true }); }, [authUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return toast.error('All fields are required');
    if (!formData.email.includes('@')) return toast.error('Enter a valid email');
    if (formData.password.length < 6) return toast.error('Min 6 characters');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    register({ name: formData.name, email: formData.email, password: formData.password });
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-[15px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all";

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[400px]"
      >
        {/* Heading */}
        <div className="flex flex-col items-center mb-7">
          <h1 className="text-white text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-gray-600 text-sm mt-1.5 text-center">Join Nexora and start chatting</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputCls}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${inputCls} pr-12`}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors p-1" tabIndex="-1">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`${inputCls} pr-12`}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors p-1" tabIndex="-1">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full h-12 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:bg-white/[0.06] disabled:text-gray-600 text-white text-[15px] font-semibold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 mt-1"
            >
              {isSigningUp ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-gray-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
