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

  // Connect socket when chat page mounts, disconnect on unmount
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);


  return (
    <div className="h-screen w-full bg-[#080b10] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      <div className="w-full h-full sm:max-w-5xl flex flex-row sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/[0.06] bg-[#0d1117]">

        {/* Sidebar */}
        <div
          className="h-full flex-shrink-0 bg-[#0d1117] z-20 transition-all duration-200 ease-out relative border-r border-white/[0.06]"
          style={{ width: isSidebarOpen ? sidebarWidth : 64 }}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onSelectUser={setSelectedUser}
            activeUserId={selectedUser?._id}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 h-full min-w-0 bg-[#0d1117] relative flex flex-col">
          {!selectedUser ? <NoChatSelected /> : <ChatArea selectedUser={selectedUser} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
