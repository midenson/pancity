"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  User,
  Mail,
  MapPin,
  AtSign,
  LogOut,
  ShieldCheck,
  Settings2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userData, setUserData] = useState({
    full_name: "Loading...",
    username: "...",
    phone: "...",
    balance: "0.00",
    internalId: "...",
  });

  useEffect(() => {
    // 1. Theme Sync
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");

    // 2. Data Fetch from Local Storage
    const raw = localStorage.getItem("user_session");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        const data = session.user_data;

        setUserData({
          full_name: data.full_name || "User Account",
          username: data.full_name
            ? data.full_name.replace(/\s+/g, "_").toLowerCase()
            : "user",
          phone: data.phone || "No phone linked",
          balance: parseFloat(data.balance || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }),
          internalId: data.userid || "N/A",
        });
      } catch (e) {
        console.error("Error parsing session data", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    localStorage.removeItem("user_session");
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("userToken");

    await Haptics.notification({ type: NotificationType.Success });
    router.push("/");
  };

  const ProfileItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div
      className={`p-5 rounded-[2rem] border transition-all flex items-center gap-4 ${
        isDarkMode
          ? "bg-[#1c1425] border-white/5"
          : "bg-white border-slate-100 shadow-sm"
      }`}
    >
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
          isDarkMode ? "bg-white/5 text-zinc-400" : "bg-slate-50 text-slate-400"
        }`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-black tracking-tight">{value}</p>
      </div>
    </div>
  );

  return (
    /* Fixed: Added w-full and ensured min-h-screen covers absolute viewport height */
    <div
      className={`w-full min-h-screen pt-safe pb-10 font-sans transition-colors duration-500 overflow-x-hidden ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header className="px-5 flex justify-between items-center py-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-10 w-10 ${
            isDarkMode
              ? "bg-zinc-900/50"
              : "bg-white shadow-sm border border-slate-100"
          }`}
        >
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          Identity Vault
        </h2>
        <div className="h-10 w-10" />
      </header>

      {/* Hero Section */}
      <div className="px-5 mb-10 text-center">
        <div className="relative inline-block mb-4">
          <div
            className={`h-28 w-28 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl ${
              isDarkMode
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {userData.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-full border-4 border-[#0f0a14] flex items-center justify-center">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter">
          {userData.full_name}
        </h1>
        <p
          className={`text-xs font-bold uppercase tracking-widest mt-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          @{userData.username}
        </p>
      </div>

      {/* Information Grid */}
      <div className="px-5 space-y-3 mb-10 max-w-2xl mx-auto">
        <ProfileItem
          icon={AtSign}
          label="Identity Handle"
          value={`@${userData.username}`}
        />
        <ProfileItem icon={Mail} label="Phone Line" value={userData.phone} />
        <ProfileItem
          icon={Wallet}
          label="Financial Balance"
          value={`₦${userData.balance}`}
        />
        <ProfileItem
          icon={Settings2}
          label="Account Status"
          value="Verified Member"
        />
      </div>

      {/* Actions */}
      <div className="px-5 space-y-4 max-w-2xl mx-auto">
        <div
          className={`p-6 rounded-[2.5rem] border ${
            isDarkMode
              ? "bg-red-500/5 border-red-500/10"
              : "bg-red-50/50 border-red-100"
          }`}
        >
          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 opacity-70">
            Danger Zone
          </h4>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full h-14 rounded-2xl flex items-center justify-between px-6 hover:bg-red-500/10 text-red-500 transition-all font-black"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span>Secure Sign Out</span>
            </div>
            <ChevronLeft size={18} className="rotate-180 opacity-40" />
          </Button>
        </div>

        <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
          Internal ID: {userData.internalId}
        </p>
      </div>
    </div>
  );
}
