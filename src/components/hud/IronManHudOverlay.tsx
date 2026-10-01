import React, { useEffect, useState } from "react";
import { Crosshair, Shield, Activity, Wifi, Radio, Cpu, BatteryCharging } from "lucide-react";
import { HudTheme, THEME_CONFIG } from "./HudWindow";

interface IronManHudOverlayProps {
  theme?: HudTheme;
  title?: string;
  subTitle?: string;
  activeTab?: "social" | "cctv" | "trends" | string;
  locationName?: string;
  gpsActive?: boolean;
  unreadAlerts?: number;
  savedCount?: number;
}

export const IronManHudOverlay: React.FC<IronManHudOverlayProps> = ({
  theme,
  title = "VEGAS_PULSE // HUD AR.OS",
  subTitle = "VALLEY OPTICAL TELEMETRY // SECTOR 702",
  activeTab = "social",
  locationName = "Downtown Las Vegas",
  gpsActive = false,
  unreadAlerts = 0,
  savedCount = 0
}) => {
  const resolvedTheme: HudTheme =
    theme || (activeTab === "cctv" ? "ironman" : activeTab === "trends" ? "fallout" : "matrix");
  const conf = THEME_CONFIG[resolvedTheme];
  const [pulseDegree, setPulseDegree] = useState(0);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseDegree((prev) => (prev + 3) % 360);
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + `.${Math.floor(now.getMilliseconds() / 100)}`
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none">
      {/* Top Iron Man Target Arc & Center Telemetry Display */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 text-xs font-mono px-4 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <Crosshair className={`w-3.5 h-3.5 ${conf.textPrimary} animate-spin`} style={{ animationDuration: "12s" }} />
          <span className="text-white/60 tracking-wider">HUD.SYNC</span>
        </div>
        <div className="h-3 w-[1px] bg-white/20" />
        <div className={`font-bold tracking-widest ${conf.textPrimary}`}>
          {timeStr}
        </div>
        <div className="h-3 w-[1px] bg-white/20" />
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Wifi className="w-3 h-3 animate-pulse" />
          <span>REALTIME</span>
        </div>
        <div className="h-3 w-[1px] bg-white/20" />
        <div className="text-[11px] text-white/50 tracking-wider">
          FREQ: 5.8 GHz
        </div>
      </div>

      {/* Top Left Arc Reticle Corner */}
      <div className="absolute top-18 left-4 hidden lg:block opacity-75">
        <div className="text-[9px] font-mono text-white/50 tracking-widest space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${conf.textPrimary} bg-current`} />
            <span className="text-white/80">TARGET: {locationName.toUpperCase()}</span>
          </div>
          <div>GPS_LOCK: {gpsActive ? "ACTIVE_DOPPLER" : "STATIONARY"}</div>
          <div>J.A.R.V.I.S. PROTOCOL: ONLINE</div>
        </div>
      </div>

      {/* Top Right Arc Reticle Battery / Core */}
      <div className="absolute top-18 right-4 hidden lg:block opacity-75">
        <div className="text-[9px] font-mono text-white/50 tracking-widest text-right space-y-0.5">
          <div className="flex items-center justify-end gap-1.5">
            <BatteryCharging className={`w-3.5 h-3.5 ${conf.textPrimary}`} />
            <span className="text-white/80">ARC CORE: 99.8%</span>
          </div>
          <div>ACTIVE_ALERTS: {unreadAlerts}</div>
          <div>SAVED_LOGS: {savedCount}</div>
        </div>
      </div>

      {/* Bottom AR Ring Horizon Line */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 text-[10px] font-mono text-white/40 px-3 py-1 rounded bg-black/40 border border-white/5">
        <span>[RAD: 360°]</span>
        <span className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <span className={conf.textPrimary}>SECTOR: CLARK_COUNTY_NV</span>
        <span className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <span>[STATUS: SECURE]</span>
      </div>

      {/* Ambient Vignette Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
    </div>
  );
};
