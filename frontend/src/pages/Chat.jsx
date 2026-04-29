import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import NoChatSelected from '../components/NoChatSelected';
import { useSocketStore } from '../store/useSocketStore';

const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarWidth] = useState(300);
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  // On mobile: when user selects someone, hide sidebar and show chat
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // On mobile: back button goes back to sidebar
  const handleBack = () => {
    setSelectedUser(null);
    setIsSidebarOpen(true);
  };

  return (
    <div className="h-screen w-full bg-[#080b10] flex items-center justify-center overflow-hidden">
      <div className="w-full h-full md:max-w-5xl md:p-4 lg:p-6 flex">
        <div className="w-full h-full flex flex-row md:rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/[0.06] bg-[#0d1117]">

          {/* Sidebar — full screen on mobile when no user selected, fixed width on desktop */}
          <div
            className={`
              h-full flex-shrink-0 bg-[#0d1117] z-20 transition-all duration-200 ease-out relative border-r border-white/[0.06]
              ${selectedUser ? 'hidden md:block' : 'w-full md:block'}
            `}
            style={{ width: window.innerWidth >= 768 ? (isSidebarOpen ? sidebarWidth : 64) : undefined }}
          >
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onSelectUser={handleSelectUser}
              activeUserId={selectedUser?._id}
            />
          </div>

          {/* Chat Area — full screen on mobile when user selected */}
          <div
            className={`
              h-full min-w-0 bg-[#0d1117] relative flex flex-col
              ${selectedUser ? 'flex-1 w-full' : 'hidden md:flex flex-1'}
            `}
          >
            {!selectedUser
              ? <NoChatSelected />
              : <ChatArea selectedUser={selectedUser} onBack={handleBack} />
            }
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chat;
