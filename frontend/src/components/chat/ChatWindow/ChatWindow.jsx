import React, { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, PhotoIcon } from "@heroicons/react/24/outline";
import ChatMessage from "../ChatMessage/ChatMessage";

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  newMessage,
  onMessageChange,
  onSend,
  sending,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
          <PaperAirplaneIcon className="h-10 w-10 text-gray-300" />
        </div>
        <p className="text-lg font-semibold text-gray-500">
          Select a conversation
        </p>
        <p className="text-sm">Choose from the list on the left to start chatting</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <img
          src={
            conversation.user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user?.fullName || "U")}`
          }
          alt={conversation.user?.fullName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">
            {conversation.user?.fullName}
          </p>
          <p className="text-xs text-gray-400">
            @{conversation.user?.username}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMine =
              msg.sender?._id === currentUserId ||
              msg.sender === currentUserId;
            return (
              <ChatMessage key={msg._id} message={msg} isMine={isMine} />
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={onSend}
        className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3"
      >
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-primary-500 transition"
        >
          <PhotoIcon className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
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
  );
};

export default ChatWindow;
