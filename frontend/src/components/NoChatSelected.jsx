import React from 'react';
import { motion } from 'framer-motion';
import AuthLogo from './AuthLogo';
void motion;

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-10 bg-[#0d1117] z-10 min-w-0 h-full">
      <div className="max-w-md text-center space-y-7">

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Black background box with logo */}
            <div className="w-[86px] h-[86px] bg-[#080b10] rounded-2xl flex items-center justify-center shadow-2xl shadow-black/60 ring-1 ring-white/[0.06]">
              <AuthLogo className="w-10 h-10 text-white" />
            </div>

            {/* Floating pulse dot */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-indigo-500 rounded-full border-[4px] border-[#0d1117] shadow-[0_0_15px_rgba(99,102,241,0.6)]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Nexora</h2>
          <p className="text-gray-500 mt-2.5 text-sm font-medium leading-relaxed max-w-[280px] mx-auto hidden sm:block">
            Select a conversation from the sidebar to start messaging.
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default NoChatSelected;
