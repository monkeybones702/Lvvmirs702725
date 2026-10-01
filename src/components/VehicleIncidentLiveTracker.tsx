import React, { useState, useEffect } from "react";
import {
  Car,
  Radio,
  AlertTriangle,
  Flame,
  Shield,
  Clock,
  Compass,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Maximize2,
  Crosshair
} from "lucide-react";
import { CCTVCamera } from "../types";
import { calculateDistanceMiles, formatDistance } from "../lib/geoUtils";

export interface LiveVehicleIncident {
  id: string;
  type: "collision" | "stalled" | "debris" | "enforcement" | "closure";
  title: string;
  corridor: string;
  locationName: string;
  mileMarker?: string;
  coordinates: { lat: number; lng: number };
  reportedMinutesAgo: number;
  lanesBlocked: string;
  severity: "critical" | "high" | "elevated" | "normal";
  status: "active" | "clearing" | "investigating";
  speedMph: number;
  nearestCamId: string;
  agencyAssisting: string;
}

export const MOCK_LIVE_INCIDENTS: LiveVehicleIncident[] = [
  {
    id: "inc-fast-01",
    type: "collision",
    title: "Multi-Vehicle Collision with Overturned Box Truck",
    corridor: "I-15",
    locationName: "I-15 NB at Tropicana Ave (Exit 37)",
    mileMarker: "MP 36.8",
    coordinates: { lat: 36.1015, lng: -115.178 },
    reportedMinutesAgo: 14,
    lanesBlocked: "Right 2 Travel Lanes Blocked",
    severity: "critical",
    status: "active",
    speedMph: 14,
    nearestCamId: "fast-cam-104",
    agencyAssisting: "NHP Troop B & Clark County Fire"
  },
  {
    id: "inc-fast-02",
    type: "stalled",
    title: "Stalled Commercial Flatbed Truck with Hazard Lights",
    corridor: "US-95",
    locationName: "US-95 NB at Eastern Ave (Exit 73)",
    mileMarker: "MP 73.1",
    coordinates: { lat: 36.161, lng: -115.118 },
    reportedMinutesAgo: 22,
    lanesBlocked: "Right Shoulder & Aux Lane Constricted",
    severity: "elevated",
    status: "clearing",
    speedMph: 38,
    nearestCamId: "fast-cam-101",
    agencyAssisting: "NDOT Freeway Service Patrol"
  },
  {
    id: "inc-fast-03",
    type: "collision",
    title: "Rear-end Shunt in Construction Merge Sector",
    corridor: "CC-215",
    locationName: "CC-215 Westbound at Flamingo Rd",
    mileMarker: "MP 19.4",
    coordinates: { lat: 36.115, lng: -115.298 },
    reportedMinutesAgo: 8,
    lanesBlocked: "Center Lane Obstructed",
    severity: "high",
    status: "active",
    speedMph: 24,
    nearestCamId: "fast-cam-105",
    agencyAssisting: "LVMPD Traffic Bureau"
  },
  {
    id: "inc-fast-04",
    type: "debris",
    title: "Ladder & Construction Materials Fallen in Lane #2",
    corridor: "I-15",
    locationName: "I-15 SB at Sahara Ave (Exit 40)",
    mileMarker: "MP 39.5",
    coordinates: { lat: 36.144, lng: -115.168 },
    reportedMinutesAgo: 31,
    lanesBlocked: "Lane 2 Avoidance Pattern",
    severity: "elevated",
    status: "investigating",
    speedMph: 42,
    nearestCamId: "fast-cam-106",
    agencyAssisting: "NDOT Maintenance Unit"
  }
];

interface VehicleIncidentLiveTrackerProps {
  userCoordinates: { lat: number; lng: number };
  onSelectCamera: (camera: CCTVCamera) => void;
  onOpenPursuitScan?: () => void;
  allCameras: CCTVCamera[];
}

export const VehicleIncidentLiveTracker: React.FC<VehicleIncidentLiveTrackerProps> = ({
  userCoordinates,
  onSelectCamera,
  onOpenPursuitScan,
  allCameras
}) => {
  const [incidents, setIncidents] = useState<LiveVehicleIncident[]>(MOCK_LIVE_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(MOCK_LIVE_INCIDENTS[0].id);
  const [pulseTick, setPulseTick] = useState<number>(0);

  // Periodic heartbeat animation & minute progression
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((t) => (t + 1) % 60);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const matchingCamera = allCameras.find((c) => c.id === activeIncident?.nearestCamId);

  return (
    <div className="relative bg-black/90 rounded-xl border border-cyan-500/40 p-4 shadow-[0_0_25px_rgba(0,240,255,0.15)] font-mono backdrop-blur-md overflow-hidden space-y-4">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-red-950/80 text-red-400 border border-red-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <Car className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                VEHICLE INCIDENT LIVE TRACKER
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                <Radio className="w-2.5 h-2.5 text-red-400 animate-ping" />
                <span>{incidents.length} DISPATCHES ACTIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-cyan-400/70">
              REAL-TIME VEGAS HIGHWAY INCIDENT TELEMETRY // NDOT & NHP DISPATCH
            </p>
          </div>
        </div>

        <div className="text-right text-[10px] text-cyan-300/70 flex items-center gap-2">
          <span className="bg-black/80 px-2 py-1 rounded border border-cyan-500/30">
            AUTO-SYNC: 4S
          </span>
          <span className="text-cyan-400 font-bold">
            BEARING ARC: 360°
          </span>
        </div>
      </div>

      {/* Incident Selection Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {incidents.map((inc) => {
          const isSelected = inc.id === selectedIncidentId;
          const dist = calculateDistanceMiles(userCoordinates, inc.coordinates);
          return (
            <button
              key={inc.id}
              type="button"
              onClick={() => setSelectedIncidentId(inc.id)}
              className={`px-3 py-1.5 rounded shrink-0 flex items-center gap-2 border transition-all text-left ${
                isSelected
                  ? "bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  : "bg-black/60 text-stone-300 border-cyan-500/30 hover:border-cyan-400/60 hover:text-white"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  inc.severity === "critical"
                    ? "bg-red-500 animate-ping"
                    : inc.severity === "high"
                    ? "bg-amber-400"
                    : "bg-cyan-400"
                }`}
              />
              <span className="font-mono text-xs">{inc.corridor}</span>
              <span className="text-[10px] opacity-80 truncate max-w-[120px] sm:max-w-[160px]">
                {inc.locationName.split(" at ")[1] || inc.locationName}
              </span>
              <span className="text-[9px] font-mono opacity-70">
                {formatDistance(dist)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Incident Telemetry & Direct CCTV Link */}
      {activeIncident && (
        <div className="bg-black/95 rounded-lg border border-cyan-500/30 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 font-bold uppercase">
                {activeIncident.severity.toUpperCase()} HAZARD
              </span>
              <span className="text-cyan-400 font-bold">
                {activeIncident.lanesBlocked}
              </span>
              <span className="text-cyan-600">•</span>
              <span className="text-stone-400">
                REPORTED {activeIncident.reportedMinutesAgo} MIN AGO
              </span>
            </div>

            <h4 className="text-sm font-bold text-white tracking-wide">
              {activeIncident.title}
            </h4>

            <div className="text-xs text-stone-300 flex items-center gap-2 flex-wrap">
              <span className="text-cyan-300 font-semibold">{activeIncident.locationName}</span>
              {activeIncident.mileMarker && (
                <span className="text-amber-400 font-mono">[{activeIncident.mileMarker}]</span>
              )}
              <span className="text-stone-500">•</span>
              <span className="text-stone-400">{activeIncident.agencyAssisting}</span>
            </div>
          </div>

          {/* Quick Metrics & Direct Optical Link */}
          <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-2 shrink-0 md:border-l md:border-cyan-500/20 md:pl-4">
            <div className="flex items-center justify-between text-xs bg-cyan-950/40 p-2 rounded border border-cyan-500/30">
              <span className="text-stone-400">TRAFFIC PACE:</span>
              <span
                className={`font-bold ${
                  activeIncident.speedMph < 20
                    ? "text-red-400"
                    : activeIncident.speedMph < 40
                    ? "text-amber-400"
                    : "text-cyan-300"
                }`}
              >
                {activeIncident.speedMph} MPH
              </span>
            </div>

            {matchingCamera ? (
              <button
                type="button"
                onClick={() => onSelectCamera(matchingCamera)}
                className="w-full px-3 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>CONNECT TO LIVE CCTV #{matchingCamera.camNumber}</span>
              </button>
            ) : (
              <div className="text-[11px] text-stone-400 italic text-center">
                Optical feed nearby calibrating...
              </div>
            )}

            {onOpenPursuitScan && (
              <button
                type="button"
                onClick={onOpenPursuitScan}
                className="w-full px-3 py-2 rounded bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all"
              >
                <Crosshair className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span>8-DIR 5-MILE PURSUIT SCAN (FAST CAMS)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
