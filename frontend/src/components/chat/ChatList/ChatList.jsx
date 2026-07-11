import React from "react";
import { formatDistanceToNow } from "date-fns";

const ChatList = ({ conversations, selectedId, onSelect, loading }) => {
  if (loading) {
    return (
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
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.user?._id}
          onClick={() => onSelect(conv)}
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${
            selectedId === conv.user?._id ? "bg-primary-50" : ""
          }`}
        >
          <div className="relative shrink-0">
            <img
              src={
                conv.user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user?.fullName || "U")}`
              }
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
            <p className="text-sm font-semibold text-gray-900 truncate">
              {conv.user?.fullName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {conv.lastMessage?.content || "..."}
            </p>
          </div>
          {conv.lastMessage?.createdAt && (
            <p className="text-xs text-gray-300 shrink-0">
              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                addSuffix: false,
              })}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

export default ChatList;
