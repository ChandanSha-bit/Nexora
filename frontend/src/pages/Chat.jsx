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
    <div className="h-screen w-full bg-[#0F1115] flex items-center justify-center p-2 sm:py-4 sm:px-6 md:py-6 md:px-8 overflow-hidden">
      
      <div className="w-full h-full max-w-5xl flex flex-row rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/10 bg-[#161B22]">
        
        {/* Sidebar */}
        <div
          className="h-full flex-shrink-0 bg-[#161B22] z-20 transition-all duration-200 ease-out relative"
          style={{ width: isSidebarOpen ? sidebarWidth : 72 }}
        >
           <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent shadow-[1px_0_10px_rgba(0,0,0,0.5)]"></div>
           
           <Sidebar 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
              onSelectUser={setSelectedUser} 
              activeUserId={selectedUser?._id} 
           />


        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 h-full min-w-0 bg-[#161B22] relative flex flex-col">
          {!selectedUser ? <NoChatSelected /> : <ChatArea selectedUser={selectedUser} />}
        </div>
        
      </div>

    </div>
  );
};

export default Chat;
