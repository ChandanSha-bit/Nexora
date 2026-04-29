import React, { useState, useRef } from 'react';
import { Camera, User, Edit3, ArrowLeft, Loader2, Check, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, axiosInstance } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1], staggerChildren: 0.08 }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
void motion;

const Profile = () => {
  const { authUser, setAuthUser, requestDeleteAccountOtp, deleteAccount } = useAuthStore();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Profile form state
  const [name, setName] = useState(authUser?.name || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  // Delete account state
  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=confirm, 2=otp
  const [deleteOtp, setDeleteOtp] = useState('');
  const [isSendingDeleteOtp, setIsSendingDeleteOtp] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');

    try {
      setIsUpdatingProfile(true);
      const res = await axiosInstance.put('/users/profile', { name: name.trim(), bio });
      setAuthUser(res.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        setIsUploadingPic(true);
        const res = await axiosInstance.put('/users/profile', { profilePic: reader.result });
        setAuthUser(res.data);
        toast.success('Profile picture updated!');
      } catch {
        toast.error('Failed to upload picture');
      } finally {
        setIsUploadingPic(false);
      }
    };
  };

  const handleRequestDeleteOtp = async () => {
    setIsSendingDeleteOtp(true);
    const ok = await requestDeleteAccountOtp();
    setIsSendingDeleteOtp(false);
    if (ok) setDeleteStep(2);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteOtp || deleteOtp.trim().length !== 6) {
      return toast.error('Enter the 6-digit OTP');
    }
    setIsDeletingAccount(true);
    const ok = await deleteAccount(deleteOtp.trim());
    setIsDeletingAccount(false);
    if (ok) navigate('/login', { replace: true });
  };  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#0d1117] w-full max-w-[380px] rounded-2xl p-6 shadow-2xl border border-white/[0.07]"
      >
        
        {/* Header */}
        <motion.div variants={childVariants} className="flex items-center justify-between mb-6">
          <Link to="/chat" className="text-gray-400 hover:text-white transition-colors p-1.5 -ml-1.5 rounded-full hover:bg-[#0F1115]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-white text-[17px] font-bold">Profile</h1>
          <div className="w-8"></div>
        </motion.div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          
          {/* Avatar */}
          <motion.div variants={childVariants} className="flex flex-col items-center justify-center mb-5">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {isUploadingPic ? (
                <div className="h-20 w-20 rounded-full bg-[#0F1115] flex items-center justify-center border border-white/10">
                  <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                </div>
              ) : authUser?.profilePic ? (
                <img src={authUser.profilePic} alt={authUser.name} className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-[#18181B]" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-semibold shadow-md border border-[#18181B]">
                  {authUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
            </div>
            <p className="text-[11px] text-gray-500 mt-2 font-medium">Click to change</p>
          </motion.div>

          {/* Name Field */}
          <motion.div variants={childVariants} className="space-y-1.5">
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 text-gray-500 h-4 w-4" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#080b10] border border-white/[0.07] rounded-xl py-2 pl-9 pr-3 text-[13px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-gray-600" 
                placeholder="Your name" 
              />
            </div>
          </motion.div>

          {/* Bio Field */}
          <motion.div variants={childVariants} className="space-y-1.5">
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Bio</label>
            <div className="relative">
              <Edit3 className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
              <textarea 
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#080b10] border border-white/[0.07] rounded-xl py-2 pl-9 pr-3 text-[13px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-gray-600 resize-none" 
                placeholder="Tell us about yourself..." 
              />
            </div>
          </motion.div>

          {/* Email (read-only) */}
          <motion.div variants={childVariants} className="space-y-1.5">
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Email</label>
            <div className="w-full bg-[#080b10] border border-white/[0.07] rounded-xl py-2 px-3 text-[13px] text-gray-500">
              {authUser?.email}
            </div>
          </motion.div>

          <motion.div variants={childVariants}>
            <motion.button 
              whileHover={{ scale: 1.01, backgroundColor: "#818cf8" }}
              whileTap={{ scale: 0.97 }}
              type="submit" 
              disabled={isUpdatingProfile}
              className="w-full flex items-center justify-center bg-indigo-500 text-white text-[13px] font-semibold rounded-lg py-2.5 transition-colors mt-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <><Check className="h-4 w-4 mr-1.5" /> Save Profile</>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Delete Account */}
        <motion.div variants={childVariants} className="mt-5 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setDeleteStep(1)}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-[13px] font-medium py-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </motion.div>

      </motion.div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {deleteStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161B22] p-5"
            >
              {deleteStep === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-red-500/10">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="text-white font-semibold text-sm">Delete Account</h2>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">This will permanently delete:</p>
                  <ul className="text-gray-500 text-xs mb-4 space-y-0.5 list-disc list-inside">
                    <li>Your profile and all data</li>
                    <li>All your messages and chat history</li>
                    <li>Your uploaded files and profile picture</li>
                  </ul>
                  <p className="text-gray-300 text-xs mb-4">An OTP will be sent to <span className="text-white font-medium">{authUser?.email}</span> to confirm.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      className="flex-1 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestDeleteOtp}
                      disabled={isSendingDeleteOtp}
                      className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-400 disabled:bg-gray-600 transition-colors"
                    >
                      {isSendingDeleteOtp ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send OTP'}
                    </button>
                  </div>
                </>
              )}

              {deleteStep === 2 && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-red-500/10">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="text-white font-semibold text-sm">Confirm Deletion</h2>
                  </div>
                  <p className="text-gray-400 text-xs mb-4">Enter the 6-digit OTP sent to <span className="text-white font-medium">{authUser?.email}</span></p>
                  <form onSubmit={handleDeleteAccount} className="space-y-3">
                    <input
                      type="text"
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="w-full rounded-lg border border-white/10 bg-[#0F1115] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-400/60 tracking-widest text-center"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setDeleteStep(0); setDeleteOtp(''); }}
                        className="flex-1 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isDeletingAccount}
                        className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-400 disabled:bg-gray-600 transition-colors"
                      >
                        {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Delete Forever'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
