import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const TABS = [
  { id: "profile", label: "Profile", icon: UserCircleIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "security", label: "Security", icon: ShieldCheckIcon },
  { id: "billing", label: "Billing", icon: CreditCardIcon },
];

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
  });
  const [notifPrefs, setNotifPrefs] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    push: user?.preferences?.notifications?.push ?? true,
    inApp: user?.preferences?.notifications?.inApp ?? true,
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const saveProfile = async () => {
    try {
      setSaving(true);
      updateUser(profile);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSaving(true);
      updateUser({ preferences: { notifications: notifPrefs } });
      toast.success("Notification preferences saved!");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password updated! (demo)");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-56 shrink-0">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === tab.id ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition mt-4"
              >
                <TrashIcon className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            {activeTab === "profile" && (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell others about yourself..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    />
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive order updates and news via email" },
                    { key: "push", label: "Push Notifications", desc: "Get notified in your browser" },
                    { key: "inApp", label: "In-App Notifications", desc: "See notifications inside CollabCart" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                        className={`relative h-6 w-11 rounded-full transition-colors ${notifPrefs[key] ? "bg-primary-500" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={saveNotifications}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-6">Change Password</h2>
                <div className="space-y-4 max-w-sm">
                  {[
                    { key: "current", label: "Current Password" },
                    { key: "newPass", label: "New Password" },
                    { key: "confirm", label: "Confirm New Password" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="password"
                        value={passwords[key]}
                        onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </div>
                  ))}
                  <button
                    onClick={changePassword}
                    className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Billing & Payments</h2>
                <div className="text-center py-12 text-gray-400">
                  <CreditCardIcon className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                  <p className="font-medium text-gray-500">No payment methods saved</p>
                  <p className="text-sm mt-1">Add a card to speed up checkout</p>
                  <button className="mt-4 px-5 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100 transition">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
