import React, { useEffect, useState } from 'react';
import { Mail, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AuthLogo from '../components/AuthLogo';
import { useAuthStore } from '../store/useAuthStore';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);
const isPhone = (value = '') => /^[+]?[0-9]{8,15}$/.test(value.replace(/\s+/g, ''));
void motion;

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
    login,
    isLoggingIn,
    authUser,
    requestPasswordResetOtp,
    sendResetTestEmail,
    verifyResetOtp,
    resetPasswordWithOtp,
    isRequestingResetOtp,
    isSendingResetTestEmail,
    isVerifyingResetOtp,
    isResettingPassword,
  } = useAuthStore();

  useEffect(() => {
    if (authUser) {
      navigate('/chat', { replace: true });
    }
  }, [authUser, navigate]);

  useEffect(() => {
    if (!showForgotModal || resendTimer <= 0) return undefined;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showForgotModal, resendTimer]);

  const resetForgotState = () => {
    setForgotStep(1);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setResetToken('');
    setResendTimer(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error('All fields are required');
    }
    if (!isEmail(formData.email)) {
      return toast.error('Please enter a valid email');
    }
    login(formData);
    return null;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const identifier = forgotIdentifier.trim().toLowerCase();
    if (!isEmail(identifier) && !isPhone(identifier)) {
      return toast.error('Please enter a valid email or phone number');
    }

    const result = await requestPasswordResetOtp(identifier);
    if (result?.ok) {
      setForgotStep(2);
      setResendTimer(result?.resendAfterSeconds || 60);
    }
    return null;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      return toast.error('Enter the 6-digit OTP');
    }

    const result = await verifyResetOtp({
      identifier: forgotIdentifier.trim().toLowerCase(),
      otp: forgotOtp.trim(),
    });
    if (result?.ok && result?.resetToken) {
      setResetToken(result.resetToken);
      setForgotStep(3);
    }
    return null;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!resetToken) {
      return toast.error('Session expired. Please verify OTP again.');
    }

    const ok = await resetPasswordWithOtp({
      identifier: forgotIdentifier.trim().toLowerCase(),
      resetToken,
      newPassword: forgotNewPassword,
    });
    if (ok) {
      setShowForgotModal(false);
      resetForgotState();
    }
    return null;
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isRequestingResetOtp) return;
    const result = await requestPasswordResetOtp(forgotIdentifier.trim().toLowerCase());
    if (result?.ok) {
      setResendTimer(result?.resendAfterSeconds || 60);
      toast.success('OTP sent successfully');
    }
  };

  const handleSendTestEmail = async () => {
    const identifier = forgotIdentifier.trim().toLowerCase();
    if (!isEmail(identifier)) {
      toast.error('Enter a valid email to send test email');
      return;
    }
    await sendResetTestEmail(identifier);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#161B22] w-full max-w-[345px] rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10"
      >
        <motion.div variants={childVariants} className="mb-3 flex items-center justify-center">
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
            Secure Login
          </span>
        </motion.div>

        <motion.div variants={childVariants} className="flex justify-center">
          <AuthLogo />
        </motion.div>

        <motion.div variants={childVariants} className="mb-4 mt-2 text-center">
          <h1 className="text-white text-lg font-semibold">Welcome back</h1>
          <p className="mt-1 text-xs text-gray-400">Sign in to continue your conversations</p>
        </motion.div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <motion.div variants={childVariants} className="space-y-1.5">
            <label className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Email</label>
            <div className="relative flex items-center group">
              <Mail className="absolute left-3.5 text-gray-500 h-4 w-4 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-2 pl-10 pr-3 text-[13px] text-white focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all placeholder-gray-600"
                placeholder="hi@nexora.com"
              />
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-1.5">
            <label className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Password</label>
            <div className="relative flex items-center group">
              <KeyRound className="absolute left-3.5 text-gray-500 h-4 w-4 group-focus-within:text-white transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-2 pl-10 pr-10 text-[13px] text-white focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all placeholder-gray-600"
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

          <motion.div variants={childVariants} className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-gray-500">Use your registered account credentials</p>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotIdentifier(formData.email || '');
                resetForgotState();
              }}
              className="text-[11px] text-gray-400 hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </motion.div>

          <motion.div variants={childVariants}>
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: '#818cf8' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center bg-indigo-500 text-white text-[13px] font-semibold rounded-xl py-2 transition-colors mt-2 shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In'}
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={childVariants} className="text-center text-xs text-gray-400 mt-4 border-t border-white/10 pt-3">
          Don't have an account? <Link to="/register" className="text-white hover:underline font-medium">Sign up</Link>
        </motion.p>
      </motion.div>

      {showForgotModal && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161B22] p-5">
            <h2 className="text-sm font-semibold text-white">
              {forgotStep === 1 && 'Reset your password'}
              {forgotStep === 2 && 'Verify OTP'}
              {forgotStep === 3 && 'Set a new password'}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {forgotStep === 1 && 'Step 1/3: Enter email/phone to receive OTP'}
              {forgotStep === 2 && 'Step 2/3: Enter OTP and verify your identity'}
              {forgotStep === 3 && 'Step 3/3: Choose your new password'}
            </p>

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="mt-4 space-y-3">
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="you@example.com or +9198xxxxxxx"
                  className="w-full rounded-lg border border-white/10 bg-[#0F1115] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/60"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isSendingResetTestEmail}
                    className="rounded-lg px-3 py-2 text-xs text-indigo-300 hover:bg-white/10 disabled:text-gray-500"
                  >
                    {isSendingResetTestEmail ? 'Testing...' : 'Send Test Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      resetForgotState();
                    }}
                    className="rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRequestingResetOtp}
                    className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:bg-gray-600"
                  >
                    {isRequestingResetOtp ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Sending...
                      </span>
                    ) : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full rounded-lg border border-white/10 bg-[#0F1115] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/60"
                />
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isRequestingResetOtp}
                    className="text-indigo-300 hover:text-indigo-200 disabled:text-gray-500"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                  <span className="text-gray-400">Expires in 10 minutes</span>
                </div>
                <div className="flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingResetOtp}
                    className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:bg-gray-600"
                  >
                    {isVerifyingResetOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-lg border border-white/10 bg-[#0F1115] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/60"
                />
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-white/10 bg-[#0F1115] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/60"
                />
                <div className="flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(2)}
                    className="rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:bg-gray-600"
                  >
                    {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
