import React from "react";

const TABS = [
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "discover", label: "Discover" },
];

const FeedTabs = ({ activeTab, onChange }) => {
  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
            ${
              activeTab === tab.id
                ? "bg-white text-primary-500 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FeedTabs;
