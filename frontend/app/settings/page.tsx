"use client";

import { User, Bell, Shield, Key, Moon, Monitor, Palette, Sparkles, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

import { WorkspaceLayout } from "@/components/workspace-layout";

const tabs = [
  { id: "profile", name: "Profile & Account", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { user } = useAuth();

  // Form states
  const [firstName, setFirstName] = useState("User");
  const [lastName, setLastName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification states
  const [notifs, setNotifs] = useState([true, false, true]);

  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setMounted(true);
    // Load saved notification preferences from localStorage
    const savedNotifs = localStorage.getItem("visionIqNotifs");
    if (savedNotifs) {
      try {
        setNotifs(JSON.parse(savedNotifs));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user && user.full_name) {
      const parts = user.full_name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await api.patch('/users/me', { full_name: `${firstName} ${lastName}`.trim() });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast.success(`Avatar ${e.target.files[0].name} uploaded!`);
    }
  };

  const toggleNotif = (index: number) => {
    const newNotifs = [...notifs];
    newNotifs[index] = !newNotifs[index];
    setNotifs(newNotifs);
    localStorage.setItem("visionIqNotifs", JSON.stringify(newNotifs));
    toast.success("Notification preferences updated");
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    try {
      // The backend endpoint PATCH /users/me takes password
      await api.patch('/users/me', { password: newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  return (
    <WorkspaceLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-brandAccent" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-brandAccent">Configuration</span>
        </div>
        <h1 className="h1 text-white">Settings</h1>
        <p className="text-white/60 mt-3 text-sm max-w-2xl">
          Manage your account settings, preferences, and security configurations.
        </p>
      </motion.div>

      <div className="w-full h-px bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent"></div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[11px] font-bold tracking-widest uppercase text-left ${
                activeTab === tab.id
                  ? "bg-brandAccent/10 text-brandAccent border border-brandAccent/20"
                  : "text-white/40 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="vision-card p-8 !rounded-2xl space-y-8"
            >
              <div className="mb-6">
                <h3 className="h3 text-white mb-1">Profile Information</h3>
                <p className="text-white/60 text-sm">Update your account details and public profile.</p>
              </div>
              
              <div className="flex items-center gap-6 pb-6 border-b border-white/[0.06]">
                <div className="w-24 h-24 rounded-full bg-brandAccent/20 border-2 border-brandAccent/30 flex items-center justify-center text-brandAccent text-3xl font-bold">
                  {firstName.charAt(0) || "U"}
                </div>
                <div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/gif" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <button onClick={handleAvatarClick} className="btn--primary px-4 py-2 text-sm">Upload Avatar</button>
                  <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <input 
                      type="text" 
                      className="w-full glass-input rounded-xl px-4 py-2 text-slate-100" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full glass-input rounded-xl px-4 py-2 text-slate-100" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <input type="email" className="w-full glass-input rounded-xl px-4 py-2 text-slate-400 opacity-70" value={user?.email || ""} disabled />
                  <p className="text-xs text-slate-500">Your email address cannot be changed right now.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={handleSaveProfile} className="btn--primary px-6 py-2.5">Save Changes</button>
              </div>
            </motion.div>
          )}



          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="vision-card p-8 !rounded-2xl space-y-6"
            >
               <div className="mb-6">
                <h3 className="h3 text-white mb-1">Email Notifications</h3>
                <p className="text-white/60 text-sm">Choose what you want to be notified about.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Scan Completed", desc: "Get notified when a background scan finishes." },
                  { title: "Marketing Updates", desc: "Receive emails about new features and VisionIQ updates." },
                  { title: "Security Alerts", desc: "Critical security notifications and login attempts." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div>
                      <p className="text-sm font-bold text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    <div 
                      onClick={() => toggleNotif(i)}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${notifs[i] ? 'bg-brandAccent' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifs[i] ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="vision-card p-8 !rounded-2xl space-y-8"
            >
              <div className="mb-6">
                <h3 className="h3 text-white mb-1">Security Settings</h3>
                <p className="text-white/60 text-sm">Manage your password and security keys.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full glass-input rounded-xl px-4 py-2 text-slate-100" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">New Password</label>
                  <input 
                    type="password" 
                    className="w-full glass-input rounded-xl px-4 py-2 text-slate-100" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full glass-input rounded-xl px-4 py-2 text-slate-100" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleUpdatePassword}
                  className="px-6 py-2.5 rounded-xl border border-brandAccent text-brandAccent font-bold text-sm hover:bg-brandAccent/10 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
    </WorkspaceLayout>
  );
}

