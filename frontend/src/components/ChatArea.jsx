import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Image as ImageIcon, FileText, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../store/useAuthStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import toast from 'react-hot-toast';
void motion;

const ChatArea = ({ selectedUser, onBack }) => {
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

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      if (String(newMessage.senderId) !== String(selectedUser._id)) return;
      setMessages((prev) => {
        if (prev.some((m) => !m._pending && String(m._id) === String(newMessage._id))) return prev;
        return [...prev, newMessage];
      });
      clearUnread(selectedUser._id);
    };
    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, selectedUser._id, clearUnread]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowAttachMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setMessages((prev) => [...prev, {
      _id: tempId, _pending: true,
      senderId: authUser._id, receiverId: selectedUser._id,
      text, image: '', createdAt: new Date().toISOString(),
    }]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text });
      setMessages((prev) => prev.map((m) => m._id === tempId ? { ...res.data, _pending: false } : m));
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
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`Max ${MAX_MB}MB`); return; }
    setIsSending(true);
    setShowAttachMenu(false);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const payload = type === 'image'
          ? { image: reader.result, text: inputText.trim() || '' }
          : { image: reader.result, text: file.name };
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
        setMessages((prev) => [...prev, res.data]);
        setInputText('');
      } catch { toast.error(`Failed to send ${type}`); }
      finally { setIsSending(false); }
    };
    reader.onerror = () => { toast.error('Failed to read file'); setIsSending(false); };
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg._pending ? 'Today' : new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const label = date === today ? 'Today' : date;
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] w-full min-w-0 relative">

      {/* Header */}
      <div className="h-[64px] bg-[#0d1117] border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          {/* Back button — mobile only */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="relative">
            {selectedUser.profilePic ? (
              <img src={selectedUser.profilePic} alt={selectedUser.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold text-sm">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0d1117] ${isOnline ? 'bg-emerald-400' : 'bg-gray-600'}`} />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-white leading-tight">{selectedUser.name}</h2>
            <p className={`text-[11px] ${isOnline ? 'text-emerald-400' : 'text-gray-600'}`}>
              {isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 no-scrollbar">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              {selectedUser.profilePic ? (
                <img src={selectedUser.profilePic} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-500">{selectedUser.name.charAt(0)}</span>
              )}
            </div>
            <p className="text-gray-500 text-sm font-medium">{selectedUser.name}</p>
            <p className="text-gray-700 text-xs">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/[0.05]" />
                <span className="text-[10px] text-gray-600 font-medium px-2">{date}</span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>

              {msgs.map((msg) => {
                const isMe = String(msg.senderId) === String(authUser._id);
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: msg._pending ? 0.5 : 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Other user avatar */}
                    {!isMe && (
                      <div className="shrink-0 mr-2 mt-auto mb-1">
                        {selectedUser.profilePic ? (
                          <img src={selectedUser.profilePic} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-white/[0.06] text-gray-400 flex items-center justify-center text-[10px] font-semibold">
                            {selectedUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Image */}
                      {isImage && (
                        <div className="rounded-2xl overflow-hidden mb-1 ring-1 ring-white/[0.06]">
                          <img src={msg.image} alt="shared" className="max-w-[260px] max-h-[280px] object-cover" />
                        </div>
                      )}

                      {/* Document */}
                      {isDocument && (
                        <button
                          type="button"
                          onClick={() => {
                            const [header, base64] = msg.image.split(',');
                            const mime = header.match(/:(.*?);/)[1];
                            const bytes = atob(base64);
                            const arr = new Uint8Array(bytes.length);
                            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                            const blob = new Blob([arr], { type: mime });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, '_blank');
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                          }}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl mb-1 ring-1 hover:opacity-80 transition-opacity ${
                            isMe ? 'bg-indigo-500/15 ring-indigo-500/20' : 'bg-white/[0.05] ring-white/[0.08]'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-[12px] text-gray-200 font-medium truncate max-w-[140px]">{msg.fileName || 'Document'}</p>
                            <p className="text-[10px] text-gray-600 uppercase mt-0.5">{msg.fileType?.split('/')[1] || 'file'} · open</p>
                          </div>
                        </button>
                      )}

                      {/* Text bubble */}
                      {msg.text && !isDocument && (
                        <div className={`px-3.5 py-2 text-[13.5px] leading-relaxed break-words max-w-full ${
                          isMe
                            ? 'bg-indigo-500 text-white rounded-2xl rounded-br-md'
                            : 'bg-white/[0.07] text-gray-200 rounded-2xl rounded-bl-md ring-1 ring-white/[0.06]'
                        }`}>
                          {msg.text}
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-700 mt-1 px-1">
                        {msg._pending ? 'Sending…' : formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/95 to-transparent">
        <form onSubmit={handleSend} className="flex items-end gap-2">

          {/* Attach */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                showAttachMenu ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-12 left-0 w-40 bg-[#161b22] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                >
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-gray-300 hover:text-white"
                  >
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[12px] font-medium">Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-gray-300 hover:text-white"
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[12px] font-medium">Document</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text input */}
          <div className="flex-1 bg-white/[0.05] border border-white/[0.07] rounded-2xl flex items-center px-4 focus-within:border-indigo-500/40 focus-within:bg-white/[0.07] transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent text-[13.5px] text-white placeholder-gray-600 py-2.5 focus:outline-none"
            />
          </div>

          {/* Send */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              inputText.trim() && !isSending
                ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                : 'bg-white/[0.05] text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4 translate-x-[1px]" />
          </button>

          <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => { sendFile(e.target.files[0], 'image'); e.target.value = ''; }} className="hidden" />
          <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip" onChange={(e) => { sendFile(e.target.files[0], 'document'); e.target.value = ''; }} className="hidden" />
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
