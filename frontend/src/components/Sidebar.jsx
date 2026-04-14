import React, { useState, useEffect } from 'react';
import { Search, LogOut, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLogo from './AuthLogo';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';

const Sidebar = ({ isSidebarOpen, toggleSidebar, onSelectUser, activeUserId }) => {
  const { logout } = useAuthStore();
  const { onlineUsers, unreadCounts } = useSocketStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real users from backend
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

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#161B22] overflow-hidden">
      
      {/* Header */}
      <div className={`p-4 pb-3 flex items-center shrink-0 transition-all duration-300 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
        <div 
          onClick={() => onSelectUser && onSelectUser(null)} 
          className="flex items-center space-x-3 overflow-hidden cursor-pointer group"
        >
           <AuthLogo className="h-7 w-7 text-white shrink-0 opacity-90 group-hover:opacity-100 transition-opacity" />
           <span className={`text-white font-semibold text-base tracking-tight transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-w-xs block' : 'opacity-0 max-w-0 hidden'}`}>
             Nexora
           </span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="text-gray-400 hover:text-white transition-all p-2 rounded-xl hover:bg-white/5 active:scale-95 shrink-0"
        >
          {isSidebarOpen ? <PanelLeftClose className="h-[22px] w-[22px]" /> : <PanelLeftOpen className="h-[22px] w-[22px]" />}
        </button>
      </div>

      {/* Search bar */}
      <div className={`px-5 pb-5 hidden sm:block shrink-0 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 scale-100 h-auto' : 'opacity-0 scale-95 h-0 p-0 overflow-hidden'}`}>
        <div className="relative group">
          <Search className="absolute left-4 top-3 text-gray-500 h-[18px] w-[18px] group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F1115] text-sm text-white rounded-full pl-11 pr-5 py-2.5 focus:outline-none shadow-inner focus:shadow-[0_0_0_1px_rgba(99,102,241,0.5)] transition-all placeholder-gray-500 font-medium"
          />
        </div>
      </div>

      {/* User List */}
      <div className={`flex-1 overflow-y-auto pt-2 pb-4 space-y-1 no-scrollbar transition-all duration-300 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        
        <div className={`flex items-center px-3 mb-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 m-0 overflow-hidden'}`}>
           <span className="text-[11px] uppercase font-bold text-gray-500 tracking-widest whitespace-nowrap">Messages</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500 text-sm">{searchQuery ? 'No users found' : 'No other users yet'}</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            return (
              <div 
                key={user._id} 
                onClick={() => onSelectUser(user)}
                className={`flex items-center rounded-[16px] cursor-pointer transition-all duration-200 group relative ${
                  isSidebarOpen ? 'py-2.5 px-3' : 'p-3 justify-center'
                } ${
                  activeUserId === user._id 
                    ? 'bg-[#202020]' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Active indicator */}
                {activeUserId === user._id && isSidebarOpen && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-indigo-500 rounded-r-md"></div>
                )}

                <div className="relative shrink-0">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className={`rounded-[16px] object-cover ${isSidebarOpen ? 'h-[46px] w-[46px]' : 'h-11 w-11'}`}
                    />
                  ) : (
                    <div className={`rounded-[16px] bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold tracking-wide transition-all duration-300 ${isSidebarOpen ? 'h-[46px] w-[46px] text-lg' : 'h-11 w-11 text-lg'}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 rounded-full border-[3px] border-[#161B22] transition-all ${isOnline ? 'bg-emerald-500' : 'bg-gray-600'} ${isSidebarOpen ? 'h-3.5 w-3.5' : 'h-3 w-3'}`} />
                  {/* Unread dot when sidebar is collapsed */}
                  {!isSidebarOpen && unreadCounts[user._id] > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center border border-[#161B22]">
                      {unreadCounts[user._id] > 9 ? '9+' : unreadCounts[user._id]}
                    </span>
                  )}
                </div>
                
                <div className={`ml-4 flex-1 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100 w-full' : 'opacity-0 w-0 h-0 hidden'}`}>
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`text-sm font-semibold tracking-tight truncate ${activeUserId === user._id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                      {user.name}
                    </h3>
                    {unreadCounts[user._id] > 0 && (
                      <span className="ml-2 shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCounts[user._id] > 99 ? '99+' : unreadCounts[user._id]}
                      </span>
                    )}
                  </div>
                  <p className={`text-[12px] truncate ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={`p-5 pb-6 flex shrink-0 transition-all duration-300 ${isSidebarOpen ? 'justify-between items-center' : 'flex-col justify-center items-center space-y-4'}`}>
         <Link to="/profile" className="text-gray-400 hover:text-white transition-all p-2.5 rounded-xl hover:bg-white/5">
            <Settings className="h-5 w-5" />
          </Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-rose-400 transition-all p-2.5 rounded-xl hover:bg-rose-500/10">
            <LogOut className="h-5 w-5" />
          </button>
      </div>

    </div>
  );
};

export default Sidebar;
