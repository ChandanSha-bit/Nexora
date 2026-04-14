import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, MoreVertical, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../store/useAuthStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import toast from 'react-hot-toast';
void motion;

const ChatArea = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { authUser } = useAuthStore();
  const { socket, onlineUsers, clearUnread } = useSocketStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages on user switch + clear unread badge
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      setMessages([]);
      try {
        const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (selectedUser._id) {
      fetchMessages();
      clearUnread(selectedUser._id);
    }
  }, [selectedUser._id, clearUnread]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Real-time incoming messages via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const isFromSelected = String(newMessage.senderId) === String(selectedUser._id);
      if (!isFromSelected) return;

      setMessages((prev) => {
        if (prev.some((m) => !m._pending && String(m._id) === String(newMessage._id))) return prev;
        return [...prev, newMessage];
      });

      clearUnread(selectedUser._id);
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, selectedUser._id, clearUnread]);

  // Close attach menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMsg = {
      _id: tempId,
      _pending: true,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text,
      image: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text });
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...res.data, _pending: false } : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const sendFile = async (file, type) => {
    if (!file) return;
    const MAX_MB = type === 'image' ? 10 : 20;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_MB}MB.`);
      return;
    }

    setIsSending(true);
    setShowAttachMenu(false);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const payload =
          type === 'image'
            ? { image: reader.result, text: inputText.trim() || '' }
            : { image: reader.result, text: file.name };

        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
        setMessages((prev) => [...prev, res.data]);
        setInputText('');
      } catch {
        toast.error(`Failed to send ${type}`);
      } finally {
        setIsSending(false);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsSending(false);
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    sendFile(file, 'image');
  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    sendFile(file, 'document');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#161B22] z-10 w-full min-w-0 relative">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-[74px] bg-[#161B22]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-5 shrink-0 z-30 shadow-sm shadow-black/30">
        <div className="flex items-center cursor-pointer group">
          <div className="relative shrink-0">
            {selectedUser.profilePic ? (
              <img src={selectedUser.profilePic} alt={selectedUser.name} className="h-12 w-12 rounded-[16px] object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-[16px] bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[20px] transition-transform group-hover:scale-105 shadow-inner">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#161B22] ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-500'}`} />
          </div>
          <div className="ml-4 min-w-0 flex-1 truncate">
            <h2 className="text-white text-base font-bold tracking-tight truncate">{selectedUser.name}</h2>
            <p className={`text-[12px] font-medium tracking-wide mt-0.5 ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 ml-4">
          <button className="p-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
            <MoreVertical className="h-[20px] w-[20px]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-[88px] p-3 sm:p-5 pb-28 flex flex-col gap-5 no-scrollbar w-full">
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.senderId) === String(authUser._id);

            // Determine message type with fallback for legacy messages (no fileType)
            const hasFile = !!msg.image;
            const isImage = hasFile && (
              msg.fileType?.startsWith('image/') ||
              (!msg.fileType && msg.image.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i)) ||
              (!msg.fileType && msg.image.includes('/image/upload/')) ||
              (!msg.fileType && msg.image.startsWith('data:image/'))
            );
            const isDocument = hasFile && !isImage;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: msg._pending ? 0.55 : 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

                  {/* Image */}
                  {isImage && (
                    <div className="mb-1 rounded-[16px] overflow-hidden ring-1 ring-white/5">
                      <img src={msg.image} alt="shared" className="max-w-[280px] max-h-[300px] object-cover" />
                    </div>
                  )}

                  {/* Document */}
                  {isDocument && (
                    <button
                      type="button"
                      onClick={() => {
                        // Convert base64 data URI to blob and open natively
                        const [header, base64] = msg.image.split(',');
                        const mime = header.match(/:(.*?);/)[1];
                        const bytes = atob(base64);
                        const arr = new Uint8Array(bytes.length);
                        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                        const blob = new Blob([arr], { type: mime });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, '_blank');
                        // Revoke after short delay to free memory
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[16px] ring-1 mb-1 transition-opacity hover:opacity-80 cursor-pointer ${
                        isMe ? 'bg-indigo-500/10 ring-indigo-500/20' : 'bg-white/[0.04] ring-white/10'
                      }`}
                    >
                      <div className="bg-emerald-500/10 p-2 rounded-full shrink-0">
                        <FileText className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-[13px] text-gray-200 truncate max-w-[160px] font-medium">
                          {msg.fileName || 'Document'}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                          {msg.fileType ? msg.fileType.split('/')[1] : 'file'} · tap to open
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Text bubble — only for plain text messages */}
                  {msg.text && !isDocument && (
                    <div className={`px-4 py-2.5 text-[14px] tracking-wide break-words w-full ${
                      isMe
                        ? 'bg-indigo-500/10 text-indigo-200 rounded-[20px] rounded-br-[4px] ring-1 ring-indigo-500/20'
                        : 'bg-white/[0.03] text-gray-300 rounded-[20px] rounded-bl-[4px] ring-1 ring-white/5'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  )}

                  <span className="text-[11px] mt-1.5 font-medium px-1 text-gray-500 tracking-wider">
                    {msg._pending ? 'Sending…' : formatTime(msg.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-[#161B22] via-[#161B22]/90 to-transparent z-40 pointer-events-none">
        <form onSubmit={handleSend} className="relative z-50 pointer-events-auto max-w-5xl mx-auto flex items-end">
          <div className="flex-1 bg-white/[0.03] backdrop-blur-md rounded-2xl ring-1 ring-white/10 flex flex-col p-1 transition-all focus-within:ring-white/20 focus-within:bg-white/[0.06]">
            <div className="flex items-center">

              {/* Attach menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`p-3 ml-1 rounded-full transition-all ${showAttachMenu ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Paperclip className="h-[20px] w-[20px]" />
                </button>

                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-[60px] left-0 w-44 bg-[#222222] ring-1 ring-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col p-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center space-x-3 w-full p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-300 hover:text-white"
                      >
                        <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400"><ImageIcon className="h-4 w-4" /></div>
                        <span className="text-[13px] font-semibold tracking-wide">Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        className="flex items-center space-x-3 w-full p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-300 hover:text-white"
                      >
                        <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-400"><FileText className="h-4 w-4" /></div>
                        <span className="text-[13px] font-semibold tracking-wide">Document</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-transparent text-white text-sm font-medium px-2 py-3 focus:outline-none placeholder-gray-500"
              />

              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip" onChange={handleDocUpload} className="hidden" />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`p-2.5 mr-1.5 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() && !isSending
                    ? 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send className="h-[20px] w-[20px] translate-x-[1px]" />
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ChatArea;
