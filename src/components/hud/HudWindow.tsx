import React from "react";

export type HudTheme = "ironman" | "matrix" | "fallout";

export interface HudWindowProps {
  id?: string;
  title: string;
  code?: string;
  theme?: HudTheme;
  statusBadge?: string;
  telemetryText?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  showScanline?: boolean;
}

export const THEME_CONFIG = {
  ironman: {
    name: "Stark Mark-LXXXV Arc",
    primary: "#00f0ff", // Arc Cyan
    primaryGlow: "rgba(0, 240, 255, 0.4)",
    secondary: "#ffd700", // Gold
    bg: "rgba(3, 10, 20, 0.88)",
    border: "border-cyan-500/40",
    cornerBorder: "border-cyan-400",
    textPrimary: "text-cyan-400",
    textSecondary: "text-cyan-200/80",
    glowClass: "shadow-[0_0_20px_rgba(0,240,255,0.18)]",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    hudLine: "from-transparent via-cyan-400/50 to-transparent",
    techLabel: "MARK-85 // ARC_OPTICS",
    matrixColor: "#00e5ff"
  },
  matrix: {
    name: "Nebuchadnezzar Stream",
    primary: "#00ff66", // Phosphor Green
    primaryGlow: "rgba(0, 255, 102, 0.4)",
    secondary: "#39ff14",
    bg: "rgba(2, 14, 6, 0.90)",
    border: "border-emerald-500/40",
    cornerBorder: "border-emerald-400",
    textPrimary: "text-emerald-400",
    textSecondary: "text-emerald-200/80",
    glowClass: "shadow-[0_0_20px_rgba(0,255,102,0.18)]",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    hudLine: "from-transparent via-emerald-400/50 to-transparent",
    techLabel: "OPERATOR // SIM_702",
    matrixColor: "#00ff66"
  },
  fallout: {
    name: "Pip-Boy 3000 Mark IV",
    primary: "#ffaa00", // Pip-Boy Amber
    primaryGlow: "rgba(255, 170, 0, 0.4)",
    secondary: "#ff4400",
    bg: "rgba(18, 10, 2, 0.90)",
    border: "border-amber-500/45",
    cornerBorder: "border-amber-400",
    textPrimary: "text-amber-400",
    textSecondary: "text-amber-200/80",
    glowClass: "shadow-[0_0_20px_rgba(255,170,0,0.18)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    hudLine: "from-transparent via-amber-400/50 to-transparent",
    techLabel: "VAULT-TEC // RAD_RADAR",
    matrixColor: "#ff9900"
  }
};

export const HudWindow: React.FC<HudWindowProps> = ({
  id,
  title,
  code = "SYS.01",
  theme = "ironman",
  statusBadge = "ONLINE",
  telemetryText,
  children,
  className = "",
  headerRight,
  showScanline = true
}) => {
  const conf = THEME_CONFIG[theme];

  return (
    <div
      id={id}
      className={`relative rounded-xl border ${conf.border} ${conf.glowClass} overflow-hidden backdrop-blur-md transition-all duration-300 ${className}`}
      style={{ backgroundColor: conf.bg }}
    >
      {/* Iron Man HUD Arc Reticle Corners (4 corner brackets) */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${conf.cornerBorder} z-20 pointer-events-none`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${conf.cornerBorder} z-20 pointer-events-none`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${conf.cornerBorder} z-20 pointer-events-none`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${conf.cornerBorder} z-20 pointer-events-none`} />

      {/* Subtle Top HUD Glow Bar */}
      <div className={`h-[2px] w-full bg-gradient-to-r ${conf.hudLine}`} />

      {/* AR HUD Window Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 bg-black/40">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Tech Code Pill */}
          <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
            {code}
          </span>

          <div className="min-w-0">
            <h3 className={`text-xs sm:text-sm font-bold tracking-wide font-mono uppercase truncate ${conf.textPrimary}`}>
              {title}
            </h3>
            {telemetryText && (
              <span className="text-[10px] font-mono text-white/50 block truncate">
                {telemetryText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {headerRight}

          {statusBadge && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${conf.badgeBg}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span>{statusBadge}</span>
            </span>
          )}
        </div>
      </div>

      {/* CRT Scanline Overlay Animation */}
      {showScanline && (
        <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.04] bg-[repeating-linear-gradient(0deg,#000,#000_2px,transparent_2px,transparent_4px)]" />
      )}

      {/* Window Content */}
      <div className="relative z-10 p-4 sm:p-5">
        {children}
      </div>

      {/* Window Footer Telemetry */}
      <div className="px-4 py-1.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{conf.techLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LAT: 36.1699° N</span>
          <span>LNG: 115.1398° W</span>
          <span className="text-white/60">FPS: 60.0</span>
        </div>
      </div>
    </div>
  );
};
