import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Scan,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Compass,
  Radio,
  Sliders,
  Share2,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Layers,
  ArrowRight
} from "lucide-react";
import { CCTVCamera, CCTVDetectedSubject, GeoCoordinate } from "../types";
import { CCTVSnapshotThumbnail } from "./CCTVSnapshotThumbnail";
import { calculateDistanceMiles, formatDistance, getCompassDirection } from "../lib/geoUtils";

interface CCTVScannerModalProps {
  camera: CCTVCamera | null;
  onClose: () => void;
  userCoords: GeoCoordinate;
  onCreateAlertFromCamera: (camera: CCTVCamera, subject?: CCTVDetectedSubject) => void;
  onFilterCommunityByCamera: (camera: CCTVCamera) => void;
}

export const CCTVScannerModal: React.FC<CCTVScannerModalProps> = ({
  camera,
  onClose,
  userCoords,
  onCreateAlertFromCamera,
  onFilterCommunityByCamera
}) => {
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [targetSubjectQuery, setTargetSubjectQuery] = useState("");
  const [showScanHud, setShowScanHud] = useState(true);
  const [feedMode, setFeedMode] = useState<"loop" | "live_stream">("loop");
  const [isConnectingLive, setIsConnectingLive] = useState(false);
  const [liveStreamConnected, setLiveStreamConnected] = useState(false);
  const [streamBitrateKbps, setStreamBitrateKbps] = useState(2450);

  // Reset frame index and analysis when camera changes
  useEffect(() => {
    setSelectedFrameIndex(0);
    setAiAnalysisResult(null);
    setTargetSubjectQuery("");
    setFeedMode("loop");
    setLiveStreamConnected(false);
  }, [camera?.id]);

  const handleConnectLive = () => {
    setIsConnectingLive(true);
    setTimeout(() => {
      setIsConnectingLive(false);
      setLiveStreamConnected(true);
      setFeedMode("live_stream");
      setStreamBitrateKbps(2400 + Math.floor(Math.random() * 200));
    }, 1200);
  };

  // Animation player cycle
  useEffect(() => {
    if (!camera || !isPlayingAnimation) return;
    const totalFrames = camera.frames?.length || 1;
    if (totalFrames <= 1) return;

    const intervalMs = Math.round(1200 / playbackSpeed);
    const interval = setInterval(() => {
      setSelectedFrameIndex((prev) => (prev + 1) % totalFrames);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [camera, isPlayingAnimation, playbackSpeed]);

  if (!camera) return null;

  const totalFrames = camera.frames?.length || 1;
  const currentFrame = camera.frames?.[selectedFrameIndex] || camera.frames?.[0];
  const distance = calculateDistanceMiles(userCoords, camera.coordinates);
  const direction = getCompassDirection(userCoords, camera.coordinates);

  const handleRunAiAnalysis = async () => {
    setIsAiScanning(true);
    try {
      const res = await fetch("/api/cctv/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cameraId: camera.id,
          cameraName: camera.name,
          corridor: camera.corridor,
          neighborhood: camera.neighborhood,
          targetSubjectQuery,
          currentDetections: currentFrame?.detectedSubjects || []
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysisResult(data.data);
      }
    } catch (err) {
      console.error("CCTV analysis failed:", err);
    } finally {
      setIsAiScanning(false);
    }
  };

  const detectedSubjectsToDisplay: CCTVDetectedSubject[] =
    aiAnalysisResult?.detectedSubjects || currentFrame?.detectedSubjects || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-mono">
      <div
        id="modal-cctv-scanner"
        className="bg-black/95 text-cyan-100 rounded-xl max-w-4xl w-full border border-cyan-500/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 flex items-start justify-between gap-3 bg-cyan-950/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-mono shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                STARK_OPTICAL // CAM #{camera.camNumber}
              </span>
              <span className="font-semibold px-2 py-0.5 rounded bg-black/80 text-stone-300 border border-cyan-500/30">
                {camera.corridor}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                <MapPin className="w-3 h-3 text-amber-400" />
                {formatDistance(distance)} ({direction})
              </span>
              <span className="text-cyan-400/80 font-mono text-[11px] hidden sm:inline">
                BEARING: {camera.direction}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
              {camera.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={liveStreamConnected ? () => setFeedMode(feedMode === "live_stream" ? "loop" : "live_stream") : handleConnectLive}
              disabled={isConnectingLive}
              className={`p-2 px-3 rounded text-xs font-bold inline-flex items-center gap-1.5 transition-all border ${
                feedMode === "live_stream"
                  ? "bg-red-950 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isConnectingLive ? "animate-spin" : "animate-pulse"}`} />
              <span>
                {isConnectingLive
                  ? "CONNECTING STREAM..."
                  : feedMode === "live_stream"
                  ? "LIVE VIDEO ACTIVE"
                  : "DIRECT LIVE STREAM"}
              </span>
            </button>

            <a
              href={camera.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded bg-black/80 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors text-xs inline-flex items-center gap-1 hidden sm:inline-flex"
              title="Open source camera page at bugatti.nvfast.org"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>NVFAST.ORG</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-red-400 rounded hover:bg-black/80 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Main Visual Player & Scrubber / Live Stream */}
          <div className="space-y-2.5">
            {feedMode === "live_stream" ? (
              <div className="max-w-2xl mx-auto border-2 border-red-500/70 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.25)] bg-black relative">
                {/* Live stream video simulation */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <CCTVSnapshotThumbnail
                    camera={camera}
                    isAnimating={true}
                    showScanHud={showScanHud}
                    onOpenDetails={() => {}}
                    className="w-full h-full object-cover"
                  />

                  {/* Direct Live Feed Overlay HUD */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded border border-red-500/50 backdrop-blur-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-red-400 font-bold text-xs tracking-wider">LIVE 30FPS DIRECT RTSP</span>
                    <span className="text-[10px] text-stone-400 font-mono">[{streamBitrateKbps} kbps]</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/80 px-2.5 py-1 rounded border border-cyan-500/40 text-[11px] text-cyan-300 font-mono">
                    NVFAST_EDGE // LATENCY: 42ms
                  </div>

                  {/* Live Scan Reticle Grid */}
                  <div className="absolute inset-0 pointer-events-none border border-red-500/20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-red-500/30 rounded-full animate-pulse" />
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/15" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-500/15" />
                  </div>
                </div>

                {/* Live Stream Telemetry Banner */}
                <div className="bg-black/90 p-2.5 border-t border-red-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">STREAM ACTIVE:</span>
                    <span className="text-stone-300">Direct TCP/HLS Tunnel to FAST Sensor #{camera.camNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedMode("loop")}
                    className="px-2 py-1 rounded bg-black hover:bg-red-950 border border-red-500/40 text-red-300 text-[11px] font-bold"
                  >
                    RETURN TO FRAME LOOP
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.15)] bg-black">
                <CCTVSnapshotThumbnail
                  camera={{
                    ...camera,
                    frames: camera.frames
                  }}
                  isAnimating={isPlayingAnimation}
                  showScanHud={showScanHud}
                  onOpenDetails={() => {}}
                  className="w-full"
                />
              </div>
            )}

            {/* Animation & Scrubber Controls Bar (visible in loop mode) */}
            {feedMode === "loop" && (
              <div className="bg-black/80 p-3 rounded-lg border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Playback Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                  className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                >
                  {isPlayingAnimation ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{isPlayingAnimation ? "PAUSE LOOP" : "PLAY LOOP"}</span>
                </button>

                {/* Speed selector */}
                <div className="flex items-center gap-1 bg-black p-1 rounded border border-cyan-500/30">
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        playbackSpeed === spd
                          ? "bg-cyan-500 text-black font-bold"
                          : "text-stone-400 hover:text-white"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* HUD toggle */}
                <button
                  type="button"
                  onClick={() => setShowScanHud(!showScanHud)}
                  className={`px-2.5 py-1.5 rounded border text-xs font-mono transition-colors ${
                    showScanHud
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                      : "bg-black text-stone-500 border-white/10"
                  }`}
                >
                  HUD {showScanHud ? "ENGAGED" : "MUTED"}
                </button>
              </div>

              {/* Frame Scrubber */}
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm justify-end">
                <span className="text-[11px] text-cyan-400 font-mono shrink-0">
                  FRAME {selectedFrameIndex + 1} / {totalFrames}
                </span>
                <input
                  type="range"
                  min="0"
                  max={totalFrames - 1}
                  value={selectedFrameIndex}
                  onChange={(e) => {
                    setSelectedFrameIndex(Number(e.target.value));
                    setIsPlayingAnimation(false);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}
          </div>

          {/* AI Subject Detection Scanner Section */}
          <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.1)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>JARVIS OPTICAL RECOGNITION TELEMETRY</span>
                    <span className="text-[10px] text-cyan-400 font-normal">
                      (FAST / BUGATTI.NVFAST.ORG FEED)
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Scanning for vehicles, pedestrians, debris, stalled cars, wildlife, or lane hazards
                  </p>
                </div>
              </div>

              {/* Gemini Trigger Button */}
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAiScanning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
              >
                {isAiScanning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isAiScanning ? "SCANNING TARGETS..." : "EXECUTE JARVIS VISION SCAN"}</span>
              </button>
            </div>

            {/* Custom Subject Search Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Specific subject search (e.g. 'stalled red car', 'debris', 'tow truck')..."
                value={targetSubjectQuery}
                onChange={(e) => setTargetSubjectQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded bg-black border border-cyan-500/40 text-xs text-cyan-100 placeholder:text-stone-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              {targetSubjectQuery && (
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  className="px-3 py-1.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white rounded text-xs font-bold"
                >
                  LOCK TARGET
                </button>
              )}
            </div>

            {/* AI Summary Banner if run */}
            {aiAnalysisResult && (
              <div className="p-3 rounded bg-cyan-950/60 border border-cyan-500/40 text-xs space-y-1">
                <div className="text-cyan-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JARVIS NEURAL SYNTHESIS</span>
                </div>
                <p className="text-stone-200 leading-relaxed">{aiAnalysisResult.summary}</p>
                {aiAnalysisResult.actionableAdvisory && (
                  <div className="text-[11px] text-amber-300 font-bold pt-1">
                    ADVISORY: {aiAnalysisResult.actionableAdvisory}
                  </div>
                )}
              </div>
            )}

            {/* Detected Subjects Cards List */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                IDENTIFIED TARGETS ({detectedSubjectsToDisplay.length})
              </div>

              {detectedSubjectsToDisplay.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400 italic bg-black/50 rounded border border-cyan-500/20">
                  Corridor travel lanes appear clear in this snapshot frame. No immediate
                  obstructions or hazards detected.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detectedSubjectsToDisplay.map((subj) => (
                    <div
                      key={subj.id}
                      className="p-3 rounded bg-black border border-cyan-500/30 flex items-start justify-between gap-2 text-xs hover:border-cyan-400 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              subj.severity === "critical"
                                ? "bg-red-400 animate-ping"
                                : subj.severity === "high"
                                ? "bg-amber-400"
                                : "bg-cyan-400"
                            }`}
                          />
                          <span className="font-bold text-white">{subj.label}</span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            ({Math.round(subj.confidence * 100)}%)
                          </span>
                        </div>
                        <p className="text-stone-300 text-[11px] leading-relaxed">{subj.details}</p>
                      </div>

                      {/* Create Alert button from this subject */}
                      <button
                        type="button"
                        onClick={() => onCreateAlertFromCamera(camera, subj)}
                        className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[10px] font-bold shrink-0"
                        title="Broadcast community notice about this detected subject"
                      >
                        + ALERT
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-cyan-500/30 bg-black/95 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onFilterCommunityByCamera(camera)}
              className="px-3 py-1.5 rounded bg-black hover:bg-cyan-950 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>CROSS-REFERENCE LOCAL POSTS</span>
            </button>

            <button
              type="button"
              onClick={() => onCreateAlertFromCamera(camera)}
              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(255,170,0,0.3)]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>BROADCAST ALERT FROM OPTICAL FEED</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-black/80 hover:bg-cyan-950 border border-white/20 text-white font-bold transition-colors"
          >
            CLOSE VIEWER
          </button>
        </div>
      </div>
    </div>
  );
};
