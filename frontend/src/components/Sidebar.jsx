import React, { useState, useEffect } from 'react';
import { Search, LogOut, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, axiosInstance } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLogo from './AuthLogo';
void motion;

const Sidebar = ({ isSidebarOpen, toggleSidebar, onSelectUser, activeUserId }) => {
  const { logout, authUser } = useAuthStore();
  const { onlineUsers, unreadCounts } = useSocketStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] overflow-hidden">

      {/* Header */}
      <div className={`h-[64px] flex items-center shrink-0 border-b border-white/[0.06] px-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {isSidebarOpen && (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectUser?.(null)}>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="h-8 w-8 rounded-xl bg-[#080b10] border border-white/[0.08] flex items-center justify-center"
            >
              <AuthLogo className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-white font-bold text-[15px] tracking-tight">Nexora</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Search */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3 pb-2 shrink-0"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-[12.5px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section label */}
      {isSidebarOpen && (
        <div className="px-4 pt-2 pb-1.5">
          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.12em]">
            Direct Messages
          </span>
        </div>
      )}

      {/* User List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-1 px-2">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-gray-600 text-xs">{searchQuery ? 'No results' : 'No users yet'}</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isActive = activeUserId === user._id;
            const unread = unreadCounts[user._id] || 0;

            return (
              <button
                key={user._id}
                type="button"
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center rounded-xl transition-all duration-150 mb-0.5 ${
                  isSidebarOpen ? 'px-2.5 py-2' : 'p-2.5 justify-center'
                } ${isActive ? 'bg-indigo-500/10' : 'hover:bg-white/[0.04]'}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className={`rounded-full object-cover ring-2 ${isActive ? 'ring-indigo-500/40' : 'ring-transparent'} ${isSidebarOpen ? 'h-9 w-9' : 'h-10 w-10'}`}
                    />
                  ) : (
                    <div className={`rounded-full flex items-center justify-center font-semibold text-sm ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.06] text-gray-400'} ${isSidebarOpen ? 'h-9 w-9' : 'h-10 w-10'}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0d1117] ${isOnline ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  {!isSidebarOpen && unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>

                {/* Info */}
                {isSidebarOpen && (
                  <div className="ml-2.5 flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {user.name}
                      </span>
                      {unread > 0 && (
                        <span className="ml-2 shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isOnline ? 'text-emerald-400' : 'text-gray-600'}`}>
                      {isOnline ? '● Online' : '○ Offline'}
                    </p>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={`shrink-0 border-t border-white/[0.06] p-3 ${isSidebarOpen ? 'flex items-center justify-between' : 'flex flex-col items-center gap-3'}`}>
        {isSidebarOpen && (
          <div className="flex items-center gap-2.5 min-w-0">
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} alt={authUser.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-semibold">
                {authUser?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{authUser?.name}</p>
              <p className="text-[10px] text-gray-600 truncate">{authUser?.email}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Link
            to="/profile"
            className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
