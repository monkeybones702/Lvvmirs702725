import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Maximize2,
  Scan,
  Radio,
  AlertTriangle,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { CCTVCamera, CCTVDetectedSubject, CCTVSnapshotFrame } from "../types";

interface CCTVSnapshotThumbnailProps {
  camera: CCTVCamera;
  isAnimating: boolean;
  onToggleAnimate?: () => void;
  onOpenDetails: (camera: CCTVCamera) => void;
  showScanHud?: boolean;
  highlightSubjectType?: string | null;
  className?: string;
}

export const CCTVSnapshotThumbnail: React.FC<CCTVSnapshotThumbnailProps> = ({
  camera,
  isAnimating,
  onToggleAnimate,
  onOpenDetails,
  showScanHud = true,
  highlightSubjectType,
  className = ""
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isScanningActive, setIsScanningActive] = useState(false);

  const totalFrames = camera.frames?.length || 1;
  const currentFrame: CCTVSnapshotFrame = camera.frames?.[currentFrameIndex] || {
    frameIndex: 0,
    timestamp: new Date().toISOString(),
    relativeSecAgo: 0,
    simulatedSceneType: "traffic_freeflow",
    detectedSubjects: []
  };

  // Cycle frames if animation is active
  useEffect(() => {
    if (!isAnimating || totalFrames <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % totalFrames);
    }, 1200);

    return () => clearInterval(interval);
  }, [isAnimating, totalFrames]);

  // Filter detected subjects according to highlight filter if specified
  const displayedSubjects = currentFrame.detectedSubjects.filter((subj) => {
    if (!highlightSubjectType || highlightSubjectType === "all") return true;
    return subj.subjectType === highlightSubjectType;
  });

  const getSeverityBorder = (sev: string) => {
    switch (sev) {
      case "critical":
        return "border-red-500 bg-red-500/20 text-red-200";
      case "high":
        return "border-amber-500 bg-amber-500/20 text-amber-200";
      case "medium":
        return "border-yellow-400 bg-yellow-400/20 text-yellow-200";
      default:
        return "border-cyan-400 bg-cyan-400/20 text-cyan-200";
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-md group select-none ${className}`}
    >
      {/* CCTV Simulated Highway Canvas */}
      <div className="relative aspect-video w-full bg-linear-to-b from-stone-900 via-stone-950 to-stone-900 overflow-hidden">
        {/* Sky / Desert Mountains Silhouette */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-amber-950/40 via-stone-900/60 to-stone-950">
          <svg
            className="w-full h-full text-stone-900/80 opacity-60"
            preserveAspectRatio="none"
            viewBox="0 0 100 40"
          >
            <polygon points="0,40 10,25 25,32 45,18 60,28 75,15 90,30 100,40" fill="currentColor" />
          </svg>
        </div>

        {/* Highway Asphalt & Perspective Grid */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 flex items-end justify-center">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* Road surface */}
            <polygon points="120,20 280,20 380,200 20,200" fill="#292524" />
            {/* Left shoulder */}
            <polygon points="100,20 120,20 20,200 0,200" fill="#1c1917" />
            {/* Right shoulder */}
            <polygon points="280,20 300,20 400,200 380,200" fill="#1c1917" />

            {/* Road Lane Markers (Dashed lines perspective) */}
            <line
              x1="173"
              y1="20"
              x2="140"
              y2="200"
              stroke="#e7e5e4"
              strokeWidth="2"
              strokeDasharray="8 8"
              opacity="0.6"
            />
            <line
              x1="227"
              y1="20"
              x2="260"
              y2="200"
              stroke="#e7e5e4"
              strokeWidth="2"
              strokeDasharray="8 8"
              opacity="0.6"
            />
            {/* Solid yellow left line */}
            <line x1="120" y1="20" x2="20" y2="200" stroke="#eab308" strokeWidth="2.5" opacity="0.8" />
            {/* Solid white right line */}
            <line x1="280" y1="20" x2="380" y2="200" stroke="#f5f5f4" strokeWidth="2.5" opacity="0.8" />

            {/* Simulated Vehicles or Scene geometry based on frame */}
            {camera.congestionLevel === "gridlock" && (
              <>
                <rect x="145" y="110" width="38" height="22" rx="4" fill="#dc2626" opacity="0.9" />
                <rect x="210" y="125" width="42" height="24" rx="4" fill="#44403c" opacity="0.9" />
                <rect x="165" y="65" width="22" height="14" rx="2" fill="#78716c" opacity="0.8" />
                <rect x="200" y="72" width="24" height="15" rx="2" fill="#e11d48" opacity="0.8" />
                {/* Emergency Flashing Lights */}
                <circle cx="280" cy="115" r="5" fill="#3b82f6" className="animate-ping" />
                <circle cx="295" cy="115" r="5" fill="#ef4444" className="animate-ping" />
              </>
            )}

            {camera.congestionLevel === "heavy" && (
              <>
                <rect x="150" y="120" width="36" height="22" rx="3" fill="#57534e" opacity="0.85" />
                <rect x="220" y="130" width="38" height="23" rx="3" fill="#0284c7" opacity="0.85" />
                <rect x="180" y="70" width="20" height="13" rx="2" fill="#a8a29e" opacity="0.75" />
              </>
            )}

            {camera.congestionLevel === "moderate" && (
              <>
                <rect x="140" y="130" width="34" height="20" rx="3" fill="#57534e" opacity="0.8" />
                <rect x="240" y="90" width="24" height="15" rx="2" fill="#d97706" opacity="0.8" />
              </>
            )}

            {camera.congestionLevel === "clear" && (
              <>
                <rect x="145" y="140" width="32" height="18" rx="3" fill="#44403c" opacity="0.7" />
                <rect x="245" y="70" width="18" height="12" rx="2" fill="#64748b" opacity="0.65" />
              </>
            )}

            {/* Stalled vehicle indicator on shoulder if present */}
            {camera.frames?.some((f) => f.simulatedSceneType === "stalled_vehicle") && (
              <g opacity="0.95">
                <rect x="300" y="115" width="46" height="26" rx="4" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
                <polygon points="323,105 315,115 331,115" fill="#eab308" />
              </g>
            )}
          </svg>
        </div>

        {/* Scanlines Effect & Optical Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-70" />

        {/* Animated Laser Scanning HUD Beam */}
        {showScanHud && (
          <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.8)] animate-bounce opacity-90 pointer-events-none" />
        )}

        {/* Bounding Box Overlays for Detected Subjects */}
        {showScanHud &&
          displayedSubjects.map((subj) => (
            <div
              key={subj.id}
              style={{
                left: `${subj.boundingBox.x}%`,
                top: `${subj.boundingBox.y}%`,
                width: `${subj.boundingBox.width}%`,
                height: `${subj.boundingBox.height}%`
              }}
              className={`absolute border-2 rounded-none transition-all pointer-events-none flex flex-col justify-between p-1 ${getSeverityBorder(
                subj.severity
              )}`}
            >
              {/* Subject Tag Pill */}
              <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-none bg-black/90 text-cyan-300 border border-cyan-500/50 truncate max-w-full flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="truncate">{subj.label}</span>
                <span className="text-amber-400 font-mono text-[8px]">
                  {Math.round(subj.confidence * 100)}%
                </span>
              </div>

              {/* Crosshair corners */}
              <div className="flex justify-between w-full opacity-80">
                <div className="w-1.5 h-1.5 border-t-2 border-l-2 border-cyan-400" />
                <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-cyan-400" />
              </div>
              <div className="flex justify-between w-full opacity-80">
                <div className="w-1.5 h-1.5 border-b-2 border-l-2 border-cyan-400" />
                <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </div>
          ))}

        {/* CCTV OSD Header (On-Screen Display: Watermark, Camera ID, Timestamp) */}
        <div className="absolute top-2 inset-x-2 flex items-start justify-between text-[10px] font-mono text-cyan-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="bg-black/90 px-1.5 py-0.5 rounded border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                NV FAST #{camera.camNumber}
              </span>
              <span className="bg-amber-950/80 text-amber-300 px-1 py-0.5 rounded border border-amber-500/40 text-[9px]">
                {camera.direction}
              </span>
            </div>
            <div className="text-cyan-200/90 text-[9px] bg-black/80 px-1 rounded inline-block border border-cyan-500/30">
              {camera.name}
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <div className="bg-black/90 px-1.5 py-0.5 rounded border border-cyan-500/40 text-[9px] text-cyan-300">
              {new Date(currentFrame.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })}{" "}
              PST
            </div>
            {totalFrames > 1 && (
              <div className="text-[8px] text-amber-300 font-bold">
                FRAME {currentFrameIndex + 1}/{totalFrames} ({currentFrame.relativeSecAgo}s ago)
              </div>
            )}
          </div>
        </div>

        {/* CCTV OSD Bottom Telemetry (Speed, Flow, Source) */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[9px] font-mono text-stone-300 pointer-events-none">
          <div className="flex items-center gap-1 bg-black/90 px-1.5 py-0.5 rounded border border-cyan-500/40">
            <span className="text-cyan-400">FLOW:</span>
            <span
              className={`font-bold ${
                camera.trafficFlowSpeedMph < 20
                  ? "text-red-400"
                  : camera.trafficFlowSpeedMph < 45
                  ? "text-amber-400"
                  : "text-cyan-300"
              }`}
            >
              {camera.trafficFlowSpeedMph} MPH
            </span>
            <span className="text-stone-400 uppercase">({camera.congestionLevel})</span>
          </div>

          <div className="bg-black/90 px-1.5 py-0.5 rounded text-[8px] text-cyan-400/80 flex items-center gap-1 border border-cyan-500/30">
            <span>BUGATTI.NVFAST.ORG</span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs font-mono">
          {onToggleAnimate && totalFrames > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAnimate();
              }}
              className="p-2 rounded bg-black/90 text-cyan-300 hover:text-white border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-xs font-bold flex items-center gap-1"
              title={isAnimating ? "Pause snapshot animation" : "Play snapshot sequence loop"}
            >
              {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAnimating ? "STILL" : "ANIM"}</span>
            </button>
          )}

          <a
            href={camera.sourceUrl || `https://bugatti.nvfast.org/camera/${camera.camNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded bg-black/90 text-amber-300 hover:text-white border border-amber-500/50 shadow-[0_0_15px_rgba(255,170,0,0.3)] text-xs font-bold flex items-center gap-1"
            title="Open live NV FAST snapshot portal directly on bugatti.nvfast.org"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>NVFAST.ORG</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenDetails(camera)}
            className="p-2 rounded bg-cyan-500 text-black hover:bg-cyan-400 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)] text-xs flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>INSPECT & SCAN</span>
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-black/95 border-t border-cyan-500/30 flex items-center justify-between text-xs font-mono">
        <div className="min-w-0 pr-2">
          <div className="text-white font-bold truncate flex items-center gap-1.5 tracking-wide">
            <span className="truncate">{camera.name}</span>
          </div>
          <div className="text-cyan-200/60 text-[11px] truncate flex items-center gap-1">
            <span>{camera.neighborhood}</span>
            {camera.mileMarker && (
              <>
                <span className="text-cyan-500/40">•</span>
                <span className="font-mono text-[10px] text-amber-400">{camera.mileMarker}</span>
              </>
            )}
          </div>
        </div>

        {/* Detections Pill */}
        <div className="shrink-0 flex items-center gap-1.5">
          {displayedSubjects.length > 0 ? (
            <span
              className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] font-mono font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(255,170,0,0.3)]"
              title={`${displayedSubjects.length} subjects detected`}
            >
              <Scan className="w-3 h-3 text-amber-400" />
              <span>{displayedSubjects.length} TARGETS</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-black text-cyan-400/60 text-[10px] font-mono border border-cyan-500/20">
              CLEAR
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
