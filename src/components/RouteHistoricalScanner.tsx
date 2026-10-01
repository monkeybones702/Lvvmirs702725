import React from "react";
import {
  Navigation,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock,
  Radio,
  Sliders,
  CheckCircle,
  Eye,
  Maximize2
} from "lucide-react";
import { CCTVCamera, CCTVCorridorRoute } from "../types";
import { CCTV_CAMERAS } from "../data/cctvData";
import { CCTVSnapshotThumbnail } from "./CCTVSnapshotThumbnail";

interface RouteHistoricalScannerProps {
  routes: CCTVCorridorRoute[];
  selectedRouteId: string;
  isScanning: boolean;
  activeStepIndex: number;
  onSelectRoute: (routeId: string) => void;
  onStartRouteScan: (route: CCTVCorridorRoute) => void;
  onStopRouteScan: () => void;
  onInspectCamera: (camera: CCTVCamera) => void;
}

export const RouteHistoricalScanner: React.FC<RouteHistoricalScannerProps> = ({
  routes,
  selectedRouteId,
  isScanning,
  activeStepIndex,
  onSelectRoute,
  onStartRouteScan,
  onStopRouteScan,
  onInspectCamera
}) => {
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Map route camera IDs to full CCTVCamera objects
  const routeCameras: CCTVCamera[] = React.useMemo(() => {
    if (!currentRoute) return [];
    return currentRoute.cameraIds
      .map((id) => CCTV_CAMERAS.find((c) => c.id === id))
      .filter((c): c is CCTVCamera => c !== undefined);
  }, [currentRoute]);

  const activeCamera = routeCameras[activeStepIndex] || routeCameras[0];

  return (
    <div className="space-y-4 font-mono">
      {/* Route Selector Header */}
      <div className="bg-black/90 rounded-xl border border-cyan-500/40 p-4 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Navigation className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">CORRIDOR ROUTE SCANNER</span>
              <span className="text-xs text-stone-400 font-normal">// HISTORICAL_SNAPSHOT_PATH</span>
            </h3>
          </div>
          <p className="text-xs text-stone-300">
            Scan and synchronize historical camera snapshot sequences along continuous Valley transit routes (bugatti.nvfast.org).
          </p>
        </div>

        {/* Scan Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isScanning ? (
            <button
              type="button"
              id="btn-stop-route-scan"
              onClick={onStopRouteScan}
              className="px-4 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all animate-pulse"
            >
              <Pause className="w-4 h-4 text-red-400" />
              <span>HALT ROUTE SCAN</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-start-route-scan"
              onClick={() => onStartRouteScan(currentRoute)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
            >
              <Play className="w-4 h-4" />
              <span>SCAN ENTIRE ROUTE</span>
            </button>
          )}

          <a
            href="https://bugatti.nvfast.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-black/80 hover:bg-black border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,170,0,0.2)]"
            title="Open NV FAST snapshot portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>BUGATTI.NVFAST.ORG</span>
          </a>
        </div>
      </div>

      {/* Route Switcher Pills */}
      <div className="bg-black/80 rounded-xl border border-cyan-500/30 p-3 space-y-2">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
          SELECT ARTERIAL CORRIDOR ROUTE:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => onSelectRoute(route.id)}
                className={`px-3 py-2 rounded-lg border text-left whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-cyan-950 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "bg-black/60 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-200"
                }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-stone-500"}`} />
                <div>
                  <div className="font-bold text-xs">{route.name}</div>
                  <div className="text-[10px] text-stone-400 opacity-80">{route.direction} • {route.cameraIds.length} Cams</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Route Waypoint Step Progress */}
      <div className="bg-black/80 rounded-xl border border-cyan-500/30 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold uppercase">{currentRoute.name}</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">{currentRoute.corridor} ({currentRoute.direction})</span>
          </div>
          <div className="text-cyan-300 font-bold">
            STEP {activeStepIndex + 1} OF {routeCameras.length}
          </div>
        </div>

        {/* Step dots */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
          {routeCameras.map((cam, idx) => {
            const isActive = idx === activeStepIndex;
            const isPast = idx < activeStepIndex;
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => onInspectCamera(cam)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isActive
                    ? "bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-105"
                    : isPast
                    ? "bg-black/90 border-cyan-500/30 text-stone-300"
                    : "bg-black/50 border-white/10 text-stone-500 hover:border-white/20"
                }`}
              >
                <div className="text-[10px] font-bold truncate">#{cam.camNumber}</div>
                <div className="text-[9px] text-stone-400 truncate">{cam.neighborhood.split(" ")[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Inspection Screen along Route */}
      {activeCamera && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-black/90 rounded-xl border border-cyan-500/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="font-bold text-white">CURRENT ROUTE WAYPOINT: #{activeCamera.camNumber} {activeCamera.name}</span>
              </div>
              <span className="text-amber-400 font-bold">{activeCamera.mileMarker || "MILEPOST SYNC"}</span>
            </div>

            <CCTVSnapshotThumbnail
              camera={activeCamera}
              isAnimating={true}
              showScanHud={true}
              onOpenDetails={onInspectCamera}
            />
          </div>

          <div className="bg-black/90 rounded-xl border border-cyan-500/40 p-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>WAYPOINT TELEMETRY</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-black/60 border border-cyan-500/20 flex justify-between">
                  <span className="text-stone-400">Corridor:</span>
                  <span className="text-white font-bold">{activeCamera.corridor}</span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-cyan-500/20 flex justify-between">
                  <span className="text-stone-400">Traffic Speed:</span>
                  <span className="text-cyan-300 font-bold">{activeCamera.trafficFlowSpeedMph} MPH</span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-cyan-500/20 flex justify-between">
                  <span className="text-stone-400">Direction:</span>
                  <span className="text-white font-bold">{activeCamera.direction}</span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-cyan-500/20 flex justify-between">
                  <span className="text-stone-400">Source:</span>
                  <a
                    href={activeCamera.sourceUrl || "https://bugatti.nvfast.org"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <span>bugatti.nvfast.org</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onInspectCamera(activeCamera)}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
            >
              <Maximize2 className="w-4 h-4" />
              <span>FULL COMPUTER VISION HUD</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
