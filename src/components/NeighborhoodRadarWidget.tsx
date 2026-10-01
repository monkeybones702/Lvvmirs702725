import React from "react";
import { Compass, MapPin, Radio, ShieldAlert, ChevronRight, Navigation } from "lucide-react";
import { UserLocationSettings, SocialPost } from "../types";
import { LAS_VEGAS_NEIGHBORHOODS } from "../data/lasVegasData";
import { calculateDistanceMiles, formatDistance, getCompassDirection } from "../lib/geoUtils";

interface NeighborhoodRadarWidgetProps {
  locationSettings: UserLocationSettings;
  posts: SocialPost[];
  onSelectNeighborhoodCenter: (neighborhoodId: string) => void;
  onOpenLocationModal: () => void;
}

export const NeighborhoodRadarWidget: React.FC<NeighborhoodRadarWidgetProps> = ({
  locationSettings,
  posts,
  onSelectNeighborhoodCenter,
  onOpenLocationModal
}) => {
  // Compute breakdown by distance rings
  const ring1 = posts.filter(
    (p) => calculateDistanceMiles(locationSettings.coordinates, p.coordinates) <= 2
  ).length;
  const ring2 = posts.filter((p) => {
    const d = calculateDistanceMiles(locationSettings.coordinates, p.coordinates);
    return d > 2 && d <= 6;
  }).length;
  const ring3 = posts.filter((p) => {
    const d = calculateDistanceMiles(locationSettings.coordinates, p.coordinates);
    return d > 6 && d <= locationSettings.radiusMiles;
  }).length;

  return (
    <div className="relative bg-black/80 rounded-xl border border-cyan-500/40 p-4 sm:p-5 shadow-[0_0_20px_rgba(0,240,255,0.12)] space-y-4 backdrop-blur-md overflow-hidden">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]">
            <Compass className="w-4 h-4 animate-spin text-cyan-400" style={{ animationDuration: "20s" }} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>VEGAS SPATIAL RADAR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </h3>
            <p className="text-[11px] font-mono text-cyan-300/60 truncate max-w-[200px]">
              ARC MATRIX // {locationSettings.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLocationModal}
          className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 underline"
        >
          [CALIBRATE]
        </button>
      </div>

      {/* Proximity Ring Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
          <div className="text-base font-bold text-cyan-300 font-mono">{ring1}</div>
          <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            &lt; 2 MILES
          </div>
          <div className="text-[9px] font-mono text-cyan-200/50">ARC INNER</div>
        </div>

        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10">
          <div className="text-base font-bold text-white font-mono">{ring2}</div>
          <div className="text-[10px] font-mono font-bold text-stone-300 uppercase tracking-wider">
            2 - 6 MILES
          </div>
          <div className="text-[9px] font-mono text-stone-400">DISTRICT</div>
        </div>

        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10">
          <div className="text-base font-bold text-white font-mono">{ring3}</div>
          <div className="text-[10px] font-mono font-bold text-stone-300 uppercase tracking-wider">
            6 - {locationSettings.radiusMiles} MI
          </div>
          <div className="text-[9px] font-mono text-stone-400">VALLEY RANGE</div>
        </div>
      </div>

      {/* Nearby Neighborhoods Table / Quick Jump */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
          TARGET SECTORS & PROXIMITY:
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {LAS_VEGAS_NEIGHBORHOODS.map((nh) => {
            const distance = calculateDistanceMiles(locationSettings.coordinates, nh.coordinates);
            const direction = getCompassDirection(locationSettings.coordinates, nh.coordinates);
            const isCenter =
              locationSettings.selectedNeighborhoodId === nh.id && !locationSettings.isLiveGps;
            const postCount = posts.filter(
              (p) => p.neighborhood.toLowerCase().includes(nh.name.toLowerCase().split(" ")[0])
            ).length;

            return (
              <button
                key={nh.id}
                type="button"
                onClick={() => onSelectNeighborhoodCenter(nh.id)}
                className={`w-full text-left p-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all border ${
                  isCenter
                    ? "bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "bg-black/40 border-white/10 text-stone-300 hover:border-cyan-500/40 hover:text-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{nh.name}</div>
                  <div className="text-[10px] text-stone-400">
                    {distance.toFixed(1)} mi • [{direction}]
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-stone-300 font-mono">
                    {postCount} logs
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

