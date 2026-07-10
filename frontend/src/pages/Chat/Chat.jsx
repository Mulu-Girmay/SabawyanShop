import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, MagnifyingGlassIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { chatService } from "../../services/chat.service";
import { formatDistanceToNow } from "date-fns";

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) fetchMessages(selectedConv.user._id);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("new-message");
  }, [socket]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await chatService.getConversations();
      setConversations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await chatService.getMessages(userId);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      setSending(true);
      const res = await chatService.sendMessage({ receiverId: selectedConv.user._id, content: newMessage });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 lg:w-80 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.user?._id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${selectedConv?.user?._id === conv.user?._id ? "bg-primary-50" : ""}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.user?.avatar || `https://ui-avatars.com/api/?name=${conv.user?.fullName}`}
                    alt={conv.user?.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{conv.user?.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.content || "..."}</p>
                </div>
                <p className="text-xs text-gray-300 shrink-0">
                  {conv.lastMessage?.createdAt
                    ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })
                    : ""}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <img
                src={selectedConv.user?.avatar || `https://ui-avatars.com/api/?name=${selectedConv.user?.fullName}`}
                alt={selectedConv.user?.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{selectedConv.user?.fullName}</p>
                <p className="text-xs text-gray-400">@{selectedConv.user?.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <AnimatePresence>
                {messages.map((msg) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-primary-500 text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? "text-primary-200" : "text-gray-400"}`}>
                          {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ""}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
              <button type="button" className="p-2 text-gray-400 hover:text-primary-500 transition">
                <PhotoIcon className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
              <PaperAirplaneIcon className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-gray-500">Select a conversation</p>
            <p className="text-sm">Choose from the list on the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
