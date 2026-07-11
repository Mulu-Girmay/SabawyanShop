import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const ChatMessage = ({ message, isMine }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
          isMine
            ? "bg-primary-500 text-white rounded-br-sm"
            : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
        }`}
      >
        {/* Image attachment */}
        {message.image && (
          <img
            src={message.image}
            alt="attachment"
            className="rounded-xl mb-2 max-w-full object-cover"
          />
        )}
        <p>{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isMine ? "text-primary-200" : "text-gray-400"
          }`}
        >
          {message.createdAt
            ? formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })
            : ""}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
