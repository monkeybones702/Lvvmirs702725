import React from "react";
import {
  MapPin,
  Navigation,
  Sparkles,
  Bookmark,
  PlusCircle,
  RefreshCw,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Radio,
  Bell,
  Mic,
  Layers,
  TrendingUp,
  Cpu,
  Terminal,
  Video,
  Activity,
  Crosshair,
  Globe,
  Users
} from "lucide-react";
import { UserLocationSettings } from "../types";
import type { User as FirebaseUser } from "firebase/auth";

interface VegasHeaderProps {
  locationSettings: UserLocationSettings;
  onOpenLocationModal: () => void;
  onRequestGps: () => void;
  isDetectingGps: boolean;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenCreatePost: () => void;
  onOpenAIBriefing: () => void;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  activeTab: "social" | "cctv" | "trends" | "people";
  onTabChange: (tab: "social" | "cctv" | "trends" | "people") => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenVoiceMemo: () => void;
  onOpenHeatMap: () => void;
  onOpenAutoNotifyPrefs: () => void;
  onOpenSourcesRegistry: () => void;
}

export const VegasHeader: React.FC<VegasHeaderProps> = ({
  locationSettings,
  onOpenLocationModal,
  onRequestGps,
  isDetectingGps,
  savedCount,
  onOpenSavedModal,
  onOpenCreatePost,
  onOpenAIBriefing,
  onRefreshFeed,
  isRefreshing,
  currentUser,
  onOpenAuth,
  onSignOut,
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenVoiceMemo,
  onOpenHeatMap,
  onOpenAutoNotifyPrefs,
  onOpenSourcesRegistry
}) => {
  return (
    <header className="bg-black/90 border-b border-cyan-500/30 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,240,255,0.12)] backdrop-blur-xl transition-all">
      {/* Top Iron Man Neon Glow Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 via-amber-400 to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Logo & Brand Scope: Iron Man / Matrix HUD Theme */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-black flex items-center justify-center font-mono font-black text-sm tracking-tighter border border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.6)]">
                702
              </div>
              <div className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur-xs group-hover:bg-cyan-400/40 -z-10 transition-all" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base font-black tracking-wider text-white font-mono flex items-center gap-1.5">
                  <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">VEGAS</span>
                  <span className="text-white">PULSE</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                  <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                  HUD.AR // 702
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-200/50 truncate hidden md:block">
                OPTICAL SCANNER • MATRIX NEURAL FEED • FAST CCTV
              </p>
            </div>
          </div>

          {/* Center Location Anchor Pill (Holographic Reticle Style) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              id="btn-header-location-pill"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-100 text-xs font-mono transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)] group"
              title="Click to calibrate GPS anchor coordinates or detection radius"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:rotate-90 transition-transform" />
              <span className="font-bold text-white truncate max-w-[120px] sm:max-w-[190px]">
                {locationSettings.name}
              </span>
              <span className="text-cyan-400/70 text-[10px] hidden lg:inline font-mono">
                [RAD: {locationSettings.radiusMiles} MI]
              </span>
            </button>

            <button
              type="button"
              id="btn-header-quick-gps"
              onClick={onRequestGps}
              disabled={isDetectingGps}
              className="p-1.5 rounded-lg border border-cyan-500/40 bg-black/60 hover:bg-cyan-950/80 text-cyan-300 text-xs font-mono transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50"
              title="Detect my exact GPS coordinates"
            >
              <Navigation className={`w-3.5 h-3.5 text-cyan-400 ${isDetectingGps ? "animate-spin text-cyan-300" : ""}`} />
            </button>
          </div>

          {/* Right Actions: HUD Futuristic Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Safety Heat Map Shortcut */}
            <button
              type="button"
              id="btn-header-heat-map"
              onClick={onOpenHeatMap}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-xs font-mono font-semibold shadow-[0_0_10px_rgba(255,170,0,0.15)] transition-all flex items-center gap-1.5"
              title="Open Las Vegas Safety Heat Map Overlay"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">RADAR</span>
            </button>

            {/* Voice Memo Recording Shortcut */}
            <button
              type="button"
              id="btn-header-voice-memo"
              onClick={onOpenVoiceMemo}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-mono font-semibold shadow-[0_0_10px_rgba(239,68,68,0.15)] transition-all flex items-center gap-1.5"
              title="Record Voice Memo Incident"
            >
              <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="hidden md:inline">AUDIO LOG</span>
            </button>

            {/* Notification Bell with HUD Glow Badge */}
            <div className="relative">
              <button
                type="button"
                id="btn-header-notifications"
                onClick={onOpenNotifications}
                className="p-1.5 rounded-lg border border-white/20 bg-black/60 hover:bg-white/10 text-white text-xs font-mono relative transition-colors"
                title="View active notifications"
              >
                <Bell className="w-4 h-4 text-cyan-300" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none animate-pulse shadow-[0_0_8px_#f59e0b]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>

            {/* AI Neighborhood Pulse Briefing */}
            <button
              type="button"
              id="btn-ai-pulse-briefing"
              onClick={onOpenAIBriefing}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-black text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
              title="Generate AI Neighborhood Intelligence Briefing"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">AI INTEL</span>
            </button>

            {/* Post / Alert Button */}
            <button
              type="button"
              id="btn-create-post-header"
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-mono font-semibold transition-all shadow-[0_0_10px_rgba(255,170,0,0.2)]"
              title="Post a local notice, lost pet alert, or recommendation"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">+ TRANSMIT</span>
            </button>

            {/* Bookmarks */}
            <button
              type="button"
              id="btn-open-bookmarks-header"
              onClick={onOpenSavedModal}
              className="p-1.5 rounded-lg border border-white/20 bg-black/60 hover:bg-white/10 text-stone-300 text-xs font-mono relative transition-colors"
              title="View saved bookmarked posts"
            >
              <Bookmark className="w-4 h-4 text-cyan-300" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-400 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Sources Registry */}
            <button
              type="button"
              id="btn-header-sources"
              onClick={onOpenSourcesRegistry}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-mono font-semibold shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all flex items-center gap-1.5"
              title="View all 12 official Nevada data sources and camera networks"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">SOURCES</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              id="btn-refresh-feed-header"
              onClick={onRefreshFeed}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg border border-white/20 bg-black/60 hover:bg-white/10 text-cyan-300 transition-colors disabled:opacity-50"
              title="Re-scan frequencies"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1">
                <span
                  className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs font-mono font-bold flex items-center justify-center truncate shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  title={currentUser.email || "Signed In Neighbor"}
                >
                  {currentUser.email ? currentUser.email[0].toUpperCase() : "U"}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-header-signin"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono transition-all"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">AUTH</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary View Switcher: AR Matrix / Iron Man / Fallout Neon Tabs */}
        <div className="flex items-center gap-2 -mb-px pt-2 border-t border-white/10 overflow-x-auto pb-1.5">
          {/* TAB 1: Matrix Neon Green Community Feeds */}
          <button
            type="button"
            id="tab-social-feeds"
            onClick={() => onTabChange("social")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "social"
                ? "border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_20px_rgba(0,255,102,0.35)]"
                : "border-emerald-500/20 text-emerald-400/60 hover:text-emerald-300 hover:border-emerald-500/50 bg-black/40"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>[COMMUNITY_STREAM]</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
              MATRIX_V1
            </span>
            {activeTab === "social" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* TAB 2: Iron Man Arc Cyan Optical CCTV Scanner */}
          <button
            type="button"
            id="tab-cctv-scanner"
            onClick={() => onTabChange("cctv")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "cctv"
                ? "border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                : "border-cyan-500/20 text-cyan-400/60 hover:text-cyan-300 hover:border-cyan-500/50 bg-black/40"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>[CCTV_OPTICS_HUD]</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-1.5 py-0.2 rounded border border-cyan-400/40">
              FAST_QUAD
            </span>
            {activeTab === "cctv" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* TAB 3: Fallout Pip-Boy Amber Historical Trends & AI Forecast */}
          <button
            type="button"
            id="tab-trends-dashboard"
            onClick={() => onTabChange("trends")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "trends"
                ? "border-amber-400 bg-amber-950/80 text-amber-300 shadow-[0_0_20px_rgba(255,170,0,0.4)]"
                : "border-amber-500/20 text-amber-400/60 hover:text-amber-300 hover:border-amber-500/50 bg-black/40"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>[PIP_BOY_FORECAST]</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/40 font-mono">
              AI_RADAR
            </span>
            {activeTab === "trends" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* TAB 4: Google People & Live Contact Locations */}
          <button
            type="button"
            id="tab-people-tracker"
            onClick={() => onTabChange("people")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "people"
                ? "border-indigo-400 bg-indigo-950/80 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                : "border-indigo-500/20 text-indigo-400/60 hover:text-indigo-300 hover:border-indigo-500/50 bg-black/40"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>[GOOGLE_PEOPLE_RADAR]</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded border border-indigo-400/40 font-mono">
              LIVE_LOCATIONS
            </span>
            {activeTab === "people" && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


