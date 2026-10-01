import React, { useState, useMemo, useEffect } from "react";
import {
  Video,
  Play,
  Pause,
  Scan,
  Sparkles,
  MapPin,
  Filter,
  Search,
  AlertTriangle,
  Radio,
  RefreshCw,
  ExternalLink,
  Layers,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  LayoutGrid,
  Grid2X2,
  List,
  Maximize2,
  Check,
  Plus,
  X,
  Gauge,
  History,
  Navigation,
  Eye,
  Timer,
  Clock,
  ChevronLeft,
  Crosshair
} from "lucide-react";
import {
  CCTVCamera,
  CCTVCorridor,
  CCTVSubjectType,
  CCTVDetectedSubject,
  UserLocationSettings,
  TargetOfInterestLog,
  CCTVCorridorRoute
} from "../types";
import { CCTV_CAMERAS, CCTV_CORRIDOR_ROUTES, INITIAL_TARGETS_OF_INTEREST } from "../data/cctvData";
import { CCTVSnapshotThumbnail } from "./CCTVSnapshotThumbnail";
import { VehicleIncidentLiveTracker } from "./VehicleIncidentLiveTracker";
import { RouteHistoricalScanner } from "./RouteHistoricalScanner";
import { TargetOfInterestLogView } from "./TargetOfInterestLogView";
import { PursuitScannerDashboard } from "./PursuitScannerDashboard";
import { calculateDistanceMiles, formatDistance, getCompassDirection } from "../lib/geoUtils";

interface CCTVScannerDashboardProps {
  locationSettings: UserLocationSettings;
  onOpenLocationModal: () => void;
  onInspectCamera: (camera: CCTVCamera) => void;
  onCreateAlertFromCamera: (camera: CCTVCamera, subject?: CCTVDetectedSubject) => void;
  onFilterCommunityByCamera: (camera: CCTVCamera) => void;
}

const CORRIDORS: (CCTVCorridor | "ALL")[] = [
  "ALL",
  "I-15",
  "US-95",
  "CC-215",
  "The Strip",
  "Downtown",
  "Arterials"
];

const SUBJECT_TYPES: { id: CCTVSubjectType | "ALL"; label: string; icon: string }[] = [
  { id: "ALL", label: "All Subjects", icon: "🌐" },
  { id: "stalled_vehicle", label: "Stalled Vehicles", icon: "🚗" },
  { id: "vehicle_congestion", label: "Congestion / Backup", icon: "🛑" },
  { id: "road_hazard", label: "Road Debris & Hazards", icon: "⚠️" },
  { id: "pedestrian", label: "Pedestrians", icon: "🚶" },
  { id: "wildlife_pet", label: "Wildlife & Pets", icon: "🐕" },
  { id: "emergency_vehicle", label: "Police / Fire / NHP", icon: "🚨" }
];

export const CCTVScannerDashboard: React.FC<CCTVScannerDashboardProps> = ({
  locationSettings,
  onOpenLocationModal,
  onInspectCamera,
  onCreateAlertFromCamera,
  onFilterCommunityByCamera
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCorridor, setSelectedCorridor] = useState<CCTVCorridor | "ALL">("ALL");
  const [selectedSubjectType, setSelectedSubjectType] = useState<CCTVSubjectType | "ALL">("ALL");
  const [isGlobalAnimationActive, setIsGlobalAnimationActive] = useState(true);
  const [isAutoScanningRadius, setIsAutoScanningRadius] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [onlyWithDetections, setOnlyWithDetections] = useState(false);

  // View Mode: standard catalog list vs quad multi-camera grid vs routes vs target log vs 8-dir pursuit
  const [viewMode, setViewMode] = useState<"standard" | "quad" | "routes" | "targets_log" | "pursuit">("standard");

  // Selected cameras for simultaneous multi-camera live grid (up to 4)
  const [selectedGridCameraIds, setSelectedGridCameraIds] = useState<string[]>(() => [
    "fast-cam-104", // Tropicana
    "fast-cam-105", // Flamingo
    "fast-cam-101", // Spaghetti Bowl
    "fast-cam-106"  // Spring Mountain
  ]);

  // Filter and sort cameras by proximity
  const filteredCameras = useMemo(() => {
    return CCTV_CAMERAS.map((cam) => {
      const distanceMiles = calculateDistanceMiles(locationSettings.coordinates, cam.coordinates);
      const direction = getCompassDirection(locationSettings.coordinates, cam.coordinates);
      return { cam, distanceMiles, direction };
    })
      .filter(({ cam, distanceMiles }) => {
        // 1. Distance Radius Filter
        if (distanceMiles > locationSettings.radiusMiles) {
          return false;
        }

        // 2. Corridor Filter
        if (selectedCorridor !== "ALL" && cam.corridor !== selectedCorridor) {
          return false;
        }

        // 3. Subject Type Filter
        if (selectedSubjectType !== "ALL") {
          const hasMatchingSubject = cam.frames?.some((f) =>
            f.detectedSubjects?.some((s) => s.subjectType === selectedSubjectType)
          );
          if (!hasMatchingSubject) return false;
        }

        // 4. Only with detections toggle
        if (onlyWithDetections) {
          const hasAnyDetection = cam.frames?.some((f) => (f.detectedSubjects?.length || 0) > 0);
          if (!hasAnyDetection) return false;
        }

        // 5. Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            cam.name.toLowerCase().includes(q) ||
            cam.corridor.toLowerCase().includes(q) ||
            cam.neighborhood.toLowerCase().includes(q) ||
            String(cam.camNumber).includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => a.distanceMiles - b.distanceMiles); // Closest first
  }, [
    locationSettings,
    selectedCorridor,
    selectedSubjectType,
    onlyWithDetections,
    searchQuery
  ]);

  // Total detected subjects in current filtered cameras
  const totalDetectedSubjects = filteredCameras.reduce((acc, { cam }) => {
    const frameSubjects = cam.frames?.[0]?.detectedSubjects?.length || 0;
    return acc + frameSubjects;
  }, 0);

  // Auto-Cycle Mode: Automatically rotate available CCTV streams in the quad grid every 10 seconds
  const [isAutoCycleActive, setIsAutoCycleActive] = useState<boolean>(false);
  const [autoCycleCountdown, setAutoCycleCountdown] = useState<number>(10);

  // Targets of Interest Logging & Historical Audit Store
  const [targetLogs, setTargetLogs] = useState<TargetOfInterestLog[]>(() => {
    try {
      const saved = localStorage.getItem("nvfast_targets_of_interest");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TARGETS_OF_INTEREST;
  });

  const [selectedTargetLog, setSelectedTargetLog] = useState<TargetOfInterestLog | null>(null);

  // Route Scanning State
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-i15-central");
  const [isRouteScanning, setIsRouteScanning] = useState<boolean>(false);
  const [activeRouteStepIndex, setActiveRouteStepIndex] = useState<number>(0);

  // Save targets to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem("nvfast_targets_of_interest", JSON.stringify(targetLogs));
    } catch {
      // ignore
    }
  }, [targetLogs]);

  // 10-Second Auto-Cycle Interval Effect
  useEffect(() => {
    if (!isAutoCycleActive || viewMode !== "quad") return;

    const timer = setInterval(() => {
      setAutoCycleCountdown((prev) => {
        if (prev <= 1) {
          // Trigger quad rotation to next set of 4 available cameras
          setSelectedGridCameraIds((currentIds) => {
            if (filteredCameras.length <= 4) return currentIds;
            const currentHeadId = currentIds[0];
            const currentHeadIndex = filteredCameras.findIndex((c) => c.cam.id === currentHeadId);
            const nextStart = (currentHeadIndex + 4) % filteredCameras.length;
            const nextBatch = filteredCameras.slice(nextStart, nextStart + 4).map((c) => c.cam.id);
            // If less than 4 at end of array, wrap around to beginning
            if (nextBatch.length < 4) {
              const needed = 4 - nextBatch.length;
              const wrapAround = filteredCameras.slice(0, needed).map((c) => c.cam.id);
              return [...nextBatch, ...wrapAround];
            }
            return nextBatch;
          });
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoCycleActive, viewMode, filteredCameras]);

  // Add a newly detected subject to target logs
  const handleLogTargetOfInterest = (camera: CCTVCamera, subject: CCTVDetectedSubject) => {
    const newLog: TargetOfInterestLog = {
      id: `toi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      cameraId: camera.id,
      cameraNumber: camera.camNumber,
      cameraName: camera.name,
      corridor: camera.corridor,
      direction: camera.direction,
      subjectType: subject.subjectType,
      label: subject.label,
      confidence: subject.confidence,
      details: subject.details,
      severity: subject.severity,
      frameIndex: 0,
      sourceSite: camera.sourceSite,
      sourceUrl: camera.sourceUrl,
      routeKey: `${camera.corridor} Corridor`,
      notes: "Logged via FAST Optical Scanner operator HUD."
    };

    setTargetLogs((prev) => [newLog, ...prev]);
    setScanStatusMessage(`✓ Logged target "${subject.label}" on Cam #${camera.camNumber} to historical registry.`);
    setTimeout(() => setScanStatusMessage(null), 5000);
  };

  // Route Scanning historical playback simulation
  const handleStartRouteScan = (route: CCTVCorridorRoute) => {
    setSelectedRouteId(route.id);
    setIsRouteScanning(true);
    setActiveRouteStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= route.cameraIds.length) {
        clearInterval(interval);
        setIsRouteScanning(false);
        setScanStatusMessage(`✓ Route scan of ${route.name} complete across ${route.cameraIds.length} sequence snapshot frames.`);
        setTimeout(() => setScanStatusMessage(null), 6000);
      } else {
        setActiveRouteStepIndex(step);
      }
    }, 2200);
  };

  // Trigger an automated sweep across all cameras in radius
  const handleAutoScanAll = () => {
    setIsAutoScanningRadius(true);
    setScanStatusMessage("Scanning FAST snapshot feeds across the Las Vegas Valley for target subjects...");

    setTimeout(() => {
      setIsAutoScanningRadius(false);
      setScanStatusMessage("✓ Subject detection sweep complete. 8 active hazards & subjects recognized across Valley corridors.");
      setTimeout(() => setScanStatusMessage(null), 6000);
    }, 1500);
  };

  // Toggle camera in/out of the 4-camera grid
  const handleToggleGridCamera = (camId: string) => {
    setSelectedGridCameraIds((prev) => {
      if (prev.includes(camId)) {
        if (prev.length <= 1) return prev; // Keep at least one camera
        return prev.filter((id) => id !== camId);
      } else {
        if (prev.length >= 4) {
          // Replace last one if already 4 selected
          return [...prev.slice(0, 3), camId];
        }
        return [...prev, camId];
      }
    });
  };

  // Switch to Quad Grid and prefill with top 4 filtered cameras
  const handleActivateQuadGridWithTop4 = () => {
    const top4Ids = filteredCameras.slice(0, 4).map((c) => c.cam.id);
    if (top4Ids.length > 0) {
      setSelectedGridCameraIds(top4Ids);
    }
    setViewMode("quad");
  };

  return (
    <div className="space-y-6 font-mono">
      {/* CCTV Scanner Banner / Header Stats */}
      <div className="bg-black/80 text-white rounded-xl border border-cyan-500/40 p-4 sm:p-6 shadow-[0_0_20px_rgba(0,240,255,0.15)] relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Video className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-wide">
                <span className="text-cyan-400">FAST OPTICAL SCANNER</span>
                <span className="text-xs font-normal text-cyan-500/70">
                  // RTC_SO_NV_SURVEILLANCE
                </span>
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                LIVE_OPTICAL_FEED
              </span>
            </div>

            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Real-time snapshot telemetry & neural computer vision scanning across NDOT & RTC Southern Nevada freeway feeds.
              Detects stalled vehicles, hazards, and traffic backups within range.
            </p>
          </div>

          {/* Quick Metrics & Auto Scan Trigger */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Proximity badge */}
            <div className="bg-black/90 p-3 rounded-lg border border-cyan-500/40 text-center min-w-[90px] shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {filteredCameras.length}
              </div>
              <div className="text-[10px] text-cyan-200/70 uppercase tracking-wider">Cams in Sector</div>
            </div>

            {/* Detections badge */}
            <div className="bg-black/90 p-3 rounded-lg border border-red-500/40 text-center min-w-[90px] shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <div className="text-lg font-bold text-red-400 font-mono">
                {totalDetectedSubjects}
              </div>
              <div className="text-[10px] text-red-300/80 uppercase tracking-wider">Anomalies</div>
            </div>

            {/* Auto-Scan Button */}
            <button
              type="button"
              onClick={handleAutoScanAll}
              disabled={isAutoScanningRadius}
              className="px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Scan className={`w-4 h-4 ${isAutoScanningRadius ? "animate-spin" : ""}`} />
              <span>{isAutoScanningRadius ? "SWEEPING..." : "OPTICAL_SWEEP"}</span>
            </button>
          </div>
        </div>

        {/* Scan Status Toast if active */}
        {scanStatusMessage && (
          <div className="mt-4 p-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in duration-150">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{scanStatusMessage}</span>
          </div>
        )}
      </div>

      {/* Real-time Vehicle Incident Live Tracker & Direct CCTV Connection */}
      <VehicleIncidentLiveTracker
        userCoordinates={locationSettings.coordinates}
        onSelectCamera={onInspectCamera}
        onOpenPursuitScan={() => setViewMode("pursuit")}
        allCameras={CCTV_CAMERAS}
      />

      {/* CCTV Controls & Multi-Subject Filter Toolbar */}
      <div className="bg-black/80 rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_15px_rgba(0,240,255,0.1)] space-y-4 backdrop-blur-md">
        {/* Top Controls Line: Search, Animation Toggle, Location Sync */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-cyan-500/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH CHANNEL (E.G. 'TROPICANA', 'SAHARA', 'I-15')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/70 border border-cyan-500/40 text-xs text-cyan-200 placeholder:text-cyan-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Animation & Proximity Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Global Snapshot Animation Toggle */}
            <button
              type="button"
              onClick={() => setIsGlobalAnimationActive(!isGlobalAnimationActive)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isGlobalAnimationActive
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-black/60 text-stone-400 border-white/10 hover:border-white/20"
              }`}
            >
              {isGlobalAnimationActive ? (
                <Pause className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-stone-500" />
              )}
              <span>{isGlobalAnimationActive ? "LOOP: RUNNING" : "LOOP: PAUSED"}</span>
            </button>

            {/* Detections only checkbox toggle */}
            <button
              type="button"
              onClick={() => setOnlyWithDetections(!onlyWithDetections)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                onlyWithDetections
                  ? "bg-red-950/80 text-red-300 border-red-500/60 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  : "bg-black/60 text-stone-400 border-white/10 hover:border-white/20"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>ANOMALIES ONLY ({totalDetectedSubjects})</span>
            </button>

            {/* Toggle Grid Feature (Standard Catalog vs 4-Camera Live Quad Grid vs Route Scan vs Targets Log) */}
            <div className="inline-flex items-center p-1 rounded-lg bg-black/80 border border-cyan-500/40 flex-wrap gap-1">
              <button
                type="button"
                id="btn-cctv-standard-view"
                onClick={() => setViewMode("standard")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "standard"
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "text-stone-400 hover:text-cyan-300"
                }`}
                title="Catalog list view of all cameras"
              >
                <List className="w-3.5 h-3.5" />
                <span>ALL ({filteredCameras.length})</span>
              </button>

              <button
                type="button"
                id="btn-cctv-toggle-grid"
                onClick={() => {
                  if (viewMode === "quad") {
                    setViewMode("standard");
                  } else {
                    handleActivateQuadGridWithTop4();
                  }
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "quad"
                    ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(255,170,0,0.4)]"
                    : "text-amber-400 hover:text-amber-300 hover:bg-amber-950/40"
                }`}
                title="Toggle simultaneous 4-camera live quad grid monitor"
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span>QUAD (4X)</span>
                {viewMode === "quad" && isAutoCycleActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>

              <button
                type="button"
                id="btn-cctv-routes-scan"
                onClick={() => setViewMode("routes")}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "routes"
                    ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
                }`}
                title="Scan all possible travel routes of matching historical snapshots"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>ROUTE_SCAN</span>
              </button>

              <button
                type="button"
                id="btn-cctv-targets-log"
                onClick={() => setViewMode("targets_log")}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "targets_log"
                    ? "bg-red-500 text-black shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "text-red-400 hover:text-red-300 hover:bg-red-950/40"
                }`}
                title="Historical audit view and target of interest registry"
              >
                <History className="w-3.5 h-3.5" />
                <span>TARGETS ({targetLogs.length})</span>
              </button>

              <button
                type="button"
                id="btn-cctv-pursuit-scanner"
                onClick={() => setViewMode("pursuit")}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "pursuit"
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-400"
                    : "text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900/60 border border-red-500/40"
                }`}
                title="8-Directional 5-mile multi-hop camera pursuit scanner to track down suspect vehicles and map laying-low containment zones"
              >
                <Crosshair className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span>8-DIR PURSUIT</span>
              </button>
            </div>

            {/* Location Radius Indicator */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="px-3 py-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 hover:border-cyan-500/40 text-stone-300 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Change your anchor location or radius"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>RADIUS: {locationSettings.radiusMiles} MI</span>
            </button>
          </div>
        </div>

        {/* Subject Type Filter Chips */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">
            OPTICAL DETECTION TARGET:
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SUBJECT_TYPES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedSubjectType(st.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  selectedSubjectType === st.id
                    ? "bg-cyan-950 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                    : "bg-black/50 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-200"
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Corridor Pill Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-cyan-500/20">
          <span className="text-[10px] font-bold text-cyan-500/70 mr-1 uppercase">SECTOR:</span>
          {CORRIDORS.map((corr) => (
            <button
              key={corr}
              type="button"
              onClick={() => setSelectedCorridor(corr)}
              className={`px-2.5 py-0.5 rounded text-xs transition-all ${
                selectedCorridor === corr
                  ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-stone-400 hover:text-cyan-300 hover:bg-cyan-950/40"
              }`}
            >
              {corr}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode: Quad Multi-Camera Live Grid Monitor (Up to 4 Simultaneous Streams) */}
      {viewMode === "quad" ? (
        <div className="space-y-4">
          {/* Quad Grid Monitoring Header / Camera Selection Bar */}
          <div className="bg-black/90 text-white rounded-xl border border-amber-500/40 p-4 shadow-[0_0_20px_rgba(255,170,0,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(255,170,0,0.3)]">
                  <Grid2X2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">SIMULTANEOUS 4X OPTICAL HUD GRID</span>
                  <span className="text-[11px] font-mono text-black bg-amber-400 px-2 py-0.5 rounded font-bold">
                    {selectedGridCameraIds.length}/4 ACTIVE
                  </span>
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                Synchronized real-time optical scan of critical Valley corridors. Click channel chips below to route feeds.
              </p>
            </div>

            {/* Quick Channel Chips & Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Auto-Cycle 10-Second Mode Toggle */}
              <button
                type="button"
                id="btn-auto-cycle-mode"
                onClick={() => {
                  setIsAutoCycleActive(!isAutoCycleActive);
                  setAutoCycleCountdown(10);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  isAutoCycleActive
                    ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border-cyan-500/40"
                }`}
                title="Automatically rotate available CCTV streams in the grid every 10 seconds"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>
                  {isAutoCycleActive ? `AUTO-CYCLE ON (${autoCycleCountdown}s)` : "AUTO-CYCLE (10s)"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  // Cycle to next set of 4 cameras
                  const currentIdx = filteredCameras.findIndex((c) => c.cam.id === selectedGridCameraIds[0]);
                  const nextStart = (currentIdx + 4) % Math.max(filteredCameras.length, 1);
                  const next4 = filteredCameras.slice(nextStart, nextStart + 4).map((c) => c.cam.id);
                  if (next4.length > 0) setSelectedGridCameraIds(next4);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/40 transition-all shadow-[0_0_10px_rgba(255,170,0,0.2)]"
                title="Rotate to next 4 cameras in corridor queue"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>CYCLE_NEXT_4</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("standard")}
                className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/20 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <List className="w-3.5 h-3.5" />
                <span>CATALOG_VIEW</span>
              </button>
            </div>
          </div>

          {/* Camera Selector Pills to Customize the 4 Slots */}
          <div className="bg-black/80 rounded-xl border border-cyan-500/30 p-3 shadow-2xs backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-cyan-400/90 uppercase tracking-wider flex items-center gap-1">
                <span>SELECT OPTICAL CHANNELS (MAX 4):</span>
              </span>
              <span className="text-[10px] text-cyan-500/70 font-mono">
                {selectedGridCameraIds.length} OF 4 CHANNELS ASSIGNED
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {filteredCameras.map(({ cam }) => {
                const isSelected = selectedGridCameraIds.includes(cam.id);
                const hasHazards = (cam.frames?.[0]?.detectedSubjects?.length || 0) > 0;
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => handleToggleGridCamera(cam.id)}
                    className={`px-2.5 py-1 rounded shrink-0 flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? "bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_10px_rgba(255,170,0,0.3)]"
                        : "bg-black/60 text-stone-400 border-white/10 hover:border-white/25 hover:text-stone-200"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-black" />
                    ) : (
                      <Plus className="w-3 h-3 text-stone-400" />
                    )}
                    <span>#{cam.camNumber}</span>
                    <span className="text-[10px] opacity-75 truncate max-w-[90px]">{cam.corridor}</span>
                    {hasHazards && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Active hazard detected" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2x2 Quad Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedGridCameraIds.map((camId, slotIdx) => {
              const camera = CCTV_CAMERAS.find((c) => c.id === camId);
              if (!camera) return null;

              const distanceMiles = calculateDistanceMiles(locationSettings.coordinates, camera.coordinates);
              const direction = getCompassDirection(locationSettings.coordinates, camera.coordinates);
              const hazardCount = camera.frames?.[0]?.detectedSubjects?.length || 0;

              return (
                <div
                  key={camera.id}
                  className="bg-black/90 rounded-xl border border-cyan-500/40 overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.15)] flex flex-col justify-between group hover:border-cyan-400 transition-all"
                >
                  {/* Grid Slot Overlay Header */}
                  <div className="px-3 py-2 bg-black/90 border-b border-cyan-500/30 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
                        CH 0{slotIdx + 1}
                      </span>
                      <span className="font-bold truncate max-w-[140px] sm:max-w-[180px] text-cyan-100">
                        #{camera.camNumber} {camera.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hazardCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 text-[10px] font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{hazardCount}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-cyan-500/80 font-mono">
                        {formatDistance(distanceMiles)} ({direction})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleGridCamera(camera.id)}
                        className="text-stone-500 hover:text-red-400 p-0.5"
                        title="Remove channel from grid"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* High-Visibility Live Snapshot Display */}
                  <div className="p-2 relative bg-black">
                    <CCTVSnapshotThumbnail
                      camera={camera}
                      isAnimating={isGlobalAnimationActive}
                      showScanHud={true}
                      highlightSubjectType={selectedSubjectType}
                      onOpenDetails={onInspectCamera}
                    />
                  </div>

                  {/* Grid Slot Quick Telemetry & Actions */}
                  <div className="px-3 py-2 bg-black/80 border-t border-cyan-500/30 flex items-center justify-between text-[11px] text-stone-300 font-mono">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono">
                        <Gauge className="w-3 h-3 text-cyan-400" />
                        <span className={camera.trafficFlowSpeedMph < 25 ? "text-red-400 font-bold" : "text-cyan-300"}>
                          {camera.trafficFlowSpeedMph} MPH
                        </span>
                      </div>
                      <span className="text-cyan-800">•</span>
                      <span className="capitalize text-stone-400">FLOW: {camera.congestionLevel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {camera.frames?.[0]?.detectedSubjects && camera.frames[0].detectedSubjects.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sub = camera.frames[0].detectedSubjects[0];
                            handleLogTargetOfInterest(camera, sub);
                          }}
                          className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-semibold text-[10px] transition-colors"
                          title="Log target to registry"
                        >
                          LOG TARGET
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onCreateAlertFromCamera(camera)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-colors"
                      >
                        + ALERT
                      </button>
                      <button
                        type="button"
                        onClick={() => onInspectCamera(camera)}
                        className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                        <span>INSPECT</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === "routes" ? (
        /* Arterial Route Scanning Historical View */
        <RouteHistoricalScanner
          routes={CCTV_CORRIDOR_ROUTES}
          selectedRouteId={selectedRouteId}
          isScanning={isRouteScanning}
          activeStepIndex={activeRouteStepIndex}
          onSelectRoute={(id) => {
            setSelectedRouteId(id);
            setActiveRouteStepIndex(0);
          }}
          onStartRouteScan={handleStartRouteScan}
          onStopRouteScan={() => setIsRouteScanning(false)}
          onInspectCamera={onInspectCamera}
        />
      ) : viewMode === "targets_log" ? (
        /* Target of Interest Historical Audit Log */
        <TargetOfInterestLogView
          logs={targetLogs}
          onClearLogs={() => setTargetLogs([])}
          onInspectCamera={onInspectCamera}
        />
      ) : viewMode === "pursuit" ? (
        /* 8-Directional 5-Mile Multi-Hop Intersection Camera Pursuit & Lay-Low Containment Scanner */
        <PursuitScannerDashboard
          onInspectCamera={onInspectCamera}
          userCoordinates={locationSettings.coordinates}
        />
      ) : (
        /* Standard Catalog Grid View */
        filteredCameras.length === 0 ? (
          <div className="bg-black/70 rounded-xl border border-cyan-500/30 p-12 text-center space-y-3 font-mono">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              NO OPTICAL FEEDS MATCHED CURRENT RADAR FILTERS
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
              Expand your search distance or clear corridor / hazard filters to discover feeds.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="px-3.5 py-1.5 rounded bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400"
              >
                EXPAND SECTOR RADIUS
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCorridor("ALL");
                  setSelectedSubjectType("ALL");
                  setOnlyWithDetections(false);
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-950/40"
              >
                RESET CCTV FILTERS
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCameras.map(({ cam, distanceMiles, direction }) => (
              <div
                key={cam.id}
                className="bg-black/80 rounded-xl border border-cyan-500/30 overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:border-cyan-400 transition-all flex flex-col justify-between"
              >
                {/* Card Top: Proximity & Direction Header */}
                <div className="p-3 border-b border-cyan-500/20 flex items-center justify-between text-xs bg-black/60">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span className="font-mono text-cyan-400">#{cam.camNumber}</span>
                    <span className="text-cyan-800">•</span>
                    <span className="truncate max-w-[150px] text-stone-200">{cam.corridor}</span>
                  </div>

                  <div
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono"
                    title={`Approximately ${distanceMiles} miles from your location`}
                  >
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{formatDistance(distanceMiles)}</span>
                    <span className="text-stone-400 font-normal">({direction})</span>
                  </div>
                </div>

                {/* Interactive Snapshot Player */}
                <div className="p-3 bg-black">
                  <CCTVSnapshotThumbnail
                    camera={cam}
                    isAnimating={isGlobalAnimationActive}
                    showScanHud={true}
                    highlightSubjectType={selectedSubjectType}
                    onOpenDetails={onInspectCamera}
                  />
                </div>

                {/* Card Bottom: Quick Actions */}
                <div className="p-3 border-t border-cyan-500/20 flex items-center justify-between gap-2 bg-black/60 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => onFilterCommunityByCamera(cam)}
                    className="text-stone-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 text-[11px]"
                    title="Search social posts near this camera"
                  >
                    <Compass className="w-3 h-3 text-cyan-500/60" />
                    <span>POSTS NEARBY</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {cam.frames?.[0]?.detectedSubjects && cam.frames[0].detectedSubjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const sub = cam.frames[0].detectedSubjects[0];
                          handleLogTargetOfInterest(cam, sub);
                        }}
                        className="px-2 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-semibold text-[11px] transition-colors"
                        title="Log first detected subject to Target of Interest registry"
                      >
                        LOG TARGET
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onCreateAlertFromCamera(cam)}
                      className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-semibold text-[11px] transition-colors"
                    >
                      + ALERT
                    </button>
                    <button
                      type="button"
                      onClick={() => onInspectCamera(cam)}
                      className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] transition-colors shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                    >
                      INSPECT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
