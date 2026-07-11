import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  PlusIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

/* ── tab config ──────────────────────────────────────────── */
const TABS = [
  { id: "profile",       label: "Profile",        icon: UserCircleIcon         },
  { id: "notifications", label: "Notifications",  icon: BellIcon               },
  { id: "security",      label: "Security",       icon: ShieldCheckIcon        },
  { id: "billing",       label: "Billing",        icon: CreditCardIcon         },
];

/* ── toggle switch ───────────────────────────────────────── */
const Toggle = ({ value, onChange }) => (
  <button
    role="switch"
    aria-checked={value}
    onClick={() => onChange(!value)}
    className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 ${value ? "bg-primary-500" : "bg-gray-200"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

/* ── field ───────────────────────────────────────────────── */
const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/* ── section heading ─────────────────────────────────────── */
const SectionHeading = ({ icon: Icon, title, desc }) => (
  <div className="flex items-center gap-3 mb-7">
    <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-primary-500" />
    </div>
    <div>
      <h2 className="font-bold text-gray-900 text-lg leading-tight">{title}</h2>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
  </div>
);

/* ── notification row ────────────────────────────────────── */
const NotifRow = ({ icon: Icon, title, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-gray-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
    <Toggle value={value} onChange={onChange} />
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const fileRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  /* ── profile form state ──────────────────────────────────── */
  const [profile, setProfile] = useState({
    fullName:  user?.fullName  || "",
    username:  user?.username  || "",
    bio:       user?.bio       || "",
    location:  user?.location  || "",
    website:   user?.website   || "",
    avatarPreview: user?.avatar || null,
  });

  /* ── notification prefs ──────────────────────────────────── */
  const [notif, setNotif] = useState({
    emailOrders:    user?.preferences?.notifications?.email   ?? true,
    emailMarketing: false,
    pushOrders:     user?.preferences?.notifications?.push    ?? true,
    pushMessages:   true,
    pushGroupBuys:  true,
    inApp:          user?.preferences?.notifications?.inApp   ?? true,
  });

  /* ── password state ──────────────────────────────────────── */
  const [pwd, setPwd]         = useState({ current: "", newPass: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, newPass: false, confirm: false });

  /* ── saved payment cards (demo) ──────────────────────────── */
  const [cards] = useState([
    { id: "c1", brand: "Visa",       last4: "4242", expiry: "12/27", default: true  },
    { id: "c2", brand: "Mastercard", last4: "5678", expiry: "06/26", default: false },
  ]);

  /* ── handlers ────────────────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, avatarPreview: url }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await new Promise((r) => setTimeout(r, 600)); /* simulate API */
      updateUser({ fullName: profile.fullName, bio: profile.bio });
      setSaved(true);
      toast.success("Profile saved!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSaving(true);
      await new Promise((r) => setTimeout(r, 400));
      updateUser({ preferences: { notifications: { email: notif.emailOrders, push: notif.pushOrders, inApp: notif.inApp } } });
      toast.success("Preferences saved!");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwd.newPass.length < 8)           { toast.error("Password must be at least 8 characters"); return; }
    if (pwd.newPass !== pwd.confirm)       { toast.error("Passwords don't match"); return; }
    if (!pwd.current)                     { toast.error("Enter your current password"); return; }
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Password updated!");
    setPwd({ current: "", newPass: "", confirm: "" });
  };

  /* ── input helpers ───────────────────────────────────────── */
  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition";

  const PwdField = ({ fieldKey, label }) => (
    <Field label={label}>
      <div className="relative">
        <input
          type={showPwd[fieldKey] ? "text" : "password"}
          value={pwd[fieldKey]}
          onChange={(e) => setPwd((p) => ({ ...p, [fieldKey]: e.target.value }))}
          className={inputCls + " pr-10"}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPwd((s) => ({ ...s, [fieldKey]: !s[fieldKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          {showPwd[fieldKey] ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );

  /* ── password strength ───────────────────────────────────── */
  const strength = pwd.newPass.length === 0 ? 0
    : pwd.newPass.length < 6 ? 1
    : pwd.newPass.length < 10 ? 2
    : /[A-Z]/.test(pwd.newPass) && /\d/.test(pwd.newPass) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-7">

          {/* ── Sidebar nav ───────────────────────────────── */}
          <aside className="md:w-52 shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === id
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" /> {label}
                  </span>
                  {activeTab === id && <ChevronRightIcon className="h-3.5 w-3.5 text-primary-400" />}
                </button>
              ))}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={() => { logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Content panel ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1,  x: 0  }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7"
              >

                {/* ── Profile tab ─────────────────────────── */}
                {activeTab === "profile" && (
                  <div>
                    <SectionHeading icon={UserCircleIcon} title="Profile Information" desc="Update your personal details and public profile." />

                    {/* avatar upload */}
                    <div className="flex items-center gap-5 mb-7">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 ring-4 ring-primary-50">
                          {profile.avatarPreview ? (
                            <img src={profile.avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-extrabold">
                              {(profile.fullName || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow hover:bg-primary-600 transition"
                        >
                          <CameraIcon className="h-4 w-4" />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Profile Photo</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · Max 5 MB</p>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700 transition"
                        >
                          Change photo
                        </button>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field label="Full Name">
                          <input type="text" value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} />
                        </Field>
                        <Field label="Username" hint="Cannot be changed after 30 days">
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
                            <input type="text" value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} className={inputCls + " pl-7"} />
                          </div>
                        </Field>
                      </div>

                      <Field label="Email Address" hint="Your email is private and cannot be changed">
                        <input type="email" value={user?.email || ""} disabled className={inputCls + " bg-gray-50 text-gray-400 cursor-not-allowed"} />
                      </Field>

                      <Field label="Bio">
                        <textarea
                          rows={3}
                          value={profile.bio}
                          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                          placeholder="Tell the community a little about yourself…"
                          className={inputCls + " resize-none"}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{profile.bio.length}/160</p>
                      </Field>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field label="Location">
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} placeholder="City, Country" className={inputCls + " pl-9"} />
                          </div>
                        </Field>
                        <Field label="Website">
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="url" value={profile.website} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" className={inputCls + " pl-9"} />
                          </div>
                        </Field>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={saveProfile}
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 shadow transition disabled:opacity-60"
                        >
                          {saving ? (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                          ) : saved ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : null}
                          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Notifications tab ───────────────────── */}
                {activeTab === "notifications" && (
                  <div>
                    <SectionHeading icon={BellIcon} title="Notification Preferences" desc="Choose how and when CollabCart contacts you." />

                    <div className="space-y-6">
                      {/* Email */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                          <EnvelopeIcon className="h-3.5 w-3.5" /> Email
                        </p>
                        <div className="bg-gray-50 rounded-2xl px-4 divide-y divide-gray-100">
                          <NotifRow icon={EnvelopeIcon} title="Order Updates"    desc="Confirmations, shipping & delivery"        value={notif.emailOrders}    onChange={(v) => setNotif((n) => ({ ...n, emailOrders: v }))} />
                          <NotifRow icon={EnvelopeIcon} title="Promotions"       desc="Sales, group buys & CollabCart news"       value={notif.emailMarketing} onChange={(v) => setNotif((n) => ({ ...n, emailMarketing: v }))} />
                        </div>
                      </div>

                      {/* Push */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                          <DevicePhoneMobileIcon className="h-3.5 w-3.5" /> Push
                        </p>
                        <div className="bg-gray-50 rounded-2xl px-4 divide-y divide-gray-100">
                          <NotifRow icon={BellIcon}            title="Order Alerts"  desc="Real-time status changes"              value={notif.pushOrders}    onChange={(v) => setNotif((n) => ({ ...n, pushOrders: v }))} />
                          <NotifRow icon={BellIcon}            title="Messages"      desc="New messages from sellers"             value={notif.pushMessages}  onChange={(v) => setNotif((n) => ({ ...n, pushMessages: v }))} />
                          <NotifRow icon={BellIcon}            title="Group Buys"    desc="Activity in your group buys"           value={notif.pushGroupBuys} onChange={(v) => setNotif((n) => ({ ...n, pushGroupBuys: v }))} />
                        </div>
                      </div>

                      {/* In-app */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                          <BellIcon className="h-3.5 w-3.5" /> In-App
                        </p>
                        <div className="bg-gray-50 rounded-2xl px-4">
                          <NotifRow icon={BellIcon} title="In-App Notifications" desc="Show notifications inside CollabCart" value={notif.inApp} onChange={(v) => setNotif((n) => ({ ...n, inApp: v }))} />
                        </div>
                      </div>

                      <button
                        onClick={saveNotifications}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-600 transition disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save Preferences"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Security tab ────────────────────────── */}
                {activeTab === "security" && (
                  <div>
                    <SectionHeading icon={ShieldCheckIcon} title="Security" desc="Manage your password and account security." />

                    <div className="max-w-sm space-y-5">
                      <PwdField fieldKey="current" label="Current Password"    />
                      <PwdField fieldKey="newPass"  label="New Password"        />

                      {/* strength bar */}
                      {pwd.newPass && (
                        <div>
                          <div className="flex gap-1 mb-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? strengthColor[strength] : "bg-gray-200"}`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-semibold ${strength >= 3 ? "text-green-600" : strength === 2 ? "text-amber-500" : "text-red-500"}`}>
                            {strengthLabel[strength]}
                          </p>
                        </div>
                      )}

                      <PwdField fieldKey="confirm" label="Confirm New Password" />

                      <button
                        onClick={changePassword}
                        className="flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-600 transition"
                      >
                        <ShieldCheckIcon className="h-4 w-4" /> Update Password
                      </button>
                    </div>

                    {/* 2FA promo */}
                    <div className="mt-8 flex items-start gap-4 bg-blue-50 rounded-2xl p-5 border border-blue-100">
                      <ShieldCheckIcon className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-700">Two-Factor Authentication</p>
                        <p className="text-xs text-blue-500 mt-0.5 mb-3">Add an extra layer of security to your account.</p>
                        <button className="text-xs font-bold text-blue-600 border border-blue-200 rounded-xl px-4 py-2 hover:bg-blue-100 transition">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* danger zone */}
                    <div className="mt-8 border border-red-100 rounded-2xl p-5">
                      <p className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1.5">
                        <TrashIcon className="h-4 w-4" /> Danger Zone
                      </p>
                      <p className="text-xs text-gray-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                      <button className="text-xs font-bold text-red-500 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition">
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Billing tab ─────────────────────────── */}
                {activeTab === "billing" && (
                  <div>
                    <SectionHeading icon={CreditCardIcon} title="Billing & Payments" desc="Manage your payment methods and billing history." />

                    {/* saved cards */}
                    <div className="space-y-3 mb-6">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-4 bg-gray-50 rounded-2xl border border-gray-100 p-4"
                        >
                          <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {card.brand}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {card.brand} •••• {card.last4}
                            </p>
                            <p className="text-xs text-gray-400">Expires {card.expiry}</p>
                          </div>
                          {card.default && (
                            <span className="text-xs font-bold bg-green-50 text-green-600 border border-green-100 rounded-full px-2.5 py-0.5">
                              Default
                            </span>
                          )}
                          <button className="text-xs text-gray-400 hover:text-red-500 transition">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-5 py-3 text-sm font-semibold text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition w-full justify-center">
                      <PlusIcon className="h-4 w-4" /> Add New Payment Method
                    </button>

                    {/* billing history */}
                    <div className="mt-8">
                      <h3 className="text-sm font-bold text-gray-700 mb-4">Billing History</h3>
                      <div className="space-y-2">
                        {[
                          { date: "Jul 1, 2026",  desc: "Order #ORD-003", amount: "$219.00", status: "Paid"    },
                          { date: "Jun 28, 2026", desc: "Order #ORD-002", amount: "$64.50",  status: "Paid"    },
                          { date: "Jun 15, 2026", desc: "Order #ORD-001", amount: "$129.99", status: "Paid"    },
                          { date: "May 20, 2026", desc: "Order #ORD-004", amount: "$45.00",  status: "Refunded"},
                        ].map((row) => (
                          <div key={row.desc} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{row.desc}</p>
                              <p className="text-xs text-gray-400">{row.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${row.status === "Paid" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                                {row.status}
                              </span>
                              <span className="text-sm font-bold text-gray-900">{row.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
