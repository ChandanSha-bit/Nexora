import React, { useEffect, useState } from 'react';
import { Mail, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import AuthLogo from '../components/AuthLogo';
void motion;

const isEmail = (v = '') => /\S+@\S+\.\S+/.test(v);
const isPhone = (v = '') => /^[+]?[0-9]{8,15}$/.test(v.replace(/\s+/g, ''));

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const {
    login, isLoggingIn, authUser,
    requestPasswordResetOtp, verifyResetOtp, resetPasswordWithOtp,
    isRequestingResetOtp, isVerifyingResetOtp, isResettingPassword,
  } = useAuthStore();

  useEffect(() => { if (authUser) navigate('/chat', { replace: true }); }, [authUser, navigate]);

  useEffect(() => {
    if (!showForgotModal || resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [showForgotModal, resendTimer]);

  const resetForgotState = () => {
    setForgotStep(1); setForgotOtp(''); setForgotNewPassword('');
    setForgotConfirmPassword(''); setResetToken(''); setResendTimer(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error('All fields are required');
    if (!isEmail(formData.email)) return toast.error('Enter a valid email');
    login(formData);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const id = forgotIdentifier.trim().toLowerCase();
    if (!isEmail(id) && !isPhone(id)) return toast.error('Enter a valid email or phone');
    const r = await requestPasswordResetOtp(id);
    if (r?.ok) { setForgotStep(2); setResendTimer(r.resendAfterSeconds || 60); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (forgotOtp.trim().length !== 6) return toast.error('Enter the 6-digit OTP');
    const r = await verifyResetOtp({ identifier: forgotIdentifier.trim().toLowerCase(), otp: forgotOtp.trim() });
    if (r?.ok && r?.resetToken) { setResetToken(r.resetToken); setForgotStep(3); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) return toast.error('Min 6 characters');
    if (forgotNewPassword !== forgotConfirmPassword) return toast.error('Passwords do not match');
    const ok = await resetPasswordWithOtp({ identifier: forgotIdentifier.trim().toLowerCase(), resetToken, newPassword: forgotNewPassword });
    if (ok) { setShowForgotModal(false); resetForgotState(); }
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
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-7">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="h-14 w-14 rounded-2xl bg-[#080b10] border border-white/[0.08] flex items-center justify-center mb-4 shadow-xl"
          >
            <AuthLogo className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-gray-600 text-sm mt-1.5 text-center">Sign in to your Nexora account</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setForgotIdentifier(formData.email || ''); resetForgotState(); }}
                  className="text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${inputCls} pr-12`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors p-1"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:bg-white/[0.06] disabled:text-gray-600 text-white text-[15px] font-semibold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 mt-1"
            >
              {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-gray-600 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create one</Link>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full sm:max-w-sm bg-[#0d1117] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
          >
            {/* Handle bar for mobile */}
            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5 sm:hidden" />

            <h2 className="text-white font-semibold text-[16px] mb-1">
              {forgotStep === 1 ? 'Reset password' : forgotStep === 2 ? 'Enter OTP' : 'New password'}
            </h2>
            <p className="text-gray-600 text-xs mb-5">Step {forgotStep} of 3</p>

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-3">
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[15px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setShowForgotModal(false); resetForgotState(); }} className="flex-1 h-11 rounded-xl text-sm text-gray-500 hover:bg-white/[0.05] transition-all">Cancel</button>
                  <button type="submit" disabled={isRequestingResetOtp} className="flex-1 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold text-white transition-all flex items-center justify-center">
                    {isRequestingResetOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[18px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all text-center tracking-[0.4em]"
                />
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={async () => { if (resendTimer > 0) return; const r = await requestPasswordResetOtp(forgotIdentifier.trim().toLowerCase()); if (r?.ok) setResendTimer(r.resendAfterSeconds || 60); }}
                    disabled={resendTimer > 0 || isRequestingResetOtp}
                    className="text-indigo-400 disabled:text-gray-600 transition-colors text-[13px]"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                  <span className="text-gray-600 text-[12px]">Expires in 10 min</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setForgotStep(1)} className="flex-1 h-11 rounded-xl text-sm text-gray-500 hover:bg-white/[0.05] transition-all">Back</button>
                  <button type="submit" disabled={isVerifyingResetOtp} className="flex-1 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold text-white transition-all flex items-center justify-center">
                    {isVerifyingResetOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="New password" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[15px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                <input type="password" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[15px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setForgotStep(2)} className="flex-1 h-11 rounded-xl text-sm text-gray-500 hover:bg-white/[0.05] transition-all">Back</button>
                  <button type="submit" disabled={isResettingPassword} className="flex-1 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold text-white transition-all flex items-center justify-center">
                    {isResettingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
