import React from "react";

const TABS = [
  { id: "posts", label: "Posts" },
  { id: "products", label: "Products" },
  { id: "group-buys", label: "Group Buys" },
];

/**
 * ProfileTabs – tab bar for switching between a user's posts, products, and group buys.
 *
 * Props:
 *   activeTab – currently selected tab id
 *   onChange  – callback(tabId) fired when a tab is clicked
 *   counts    – optional object { posts, products, "group-buys" } for badge counts
 */
const ProfileTabs = ({ activeTab, onChange, counts = {} }) => {
  return (
    <div className="flex border-b border-gray-200">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition flex items-center gap-1.5 ${
            activeTab === tab.id
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {counts[tab.id] != null && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id
                  ? "bg-primary-100 text-primary-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
