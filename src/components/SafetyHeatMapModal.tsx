import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Layers,
  Shield,
  AlertTriangle,
  MapPin,
  Sliders,
  Camera,
  Info,
  Maximize2
} from "lucide-react";
import {
  SocialPost,
  CCTVCamera,
  GeoCoordinate,
  UserLocationSettings,
  PostCategory
} from "../types";

interface SafetyHeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: SocialPost[];
  cameras: CCTVCamera[];
  userLocation: UserLocationSettings;
  onSelectPost: (post: SocialPost) => void;
  onSelectCamera: (camera: CCTVCamera) => void;
}

// Bounding box for Las Vegas Valley coordinate projection
const LV_BOUNDS = {
  minLat: 35.98,
  maxLat: 36.32,
  minLng: -115.35,
  maxLng: -115.02
};

export const SafetyHeatMapModal: React.FC<SafetyHeatMapModalProps> = ({
  isOpen,
  onClose,
  posts,
  cameras,
  userLocation,
  onSelectPost,
  onSelectCamera
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [heatIntensity, setHeatIntensity] = useState<number>(0.7);
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);

  // Sector risk profiles
  const SECTOR_RISK_SCORES = [
    { name: "The Strip / Resort Corridor", risk: "Elevated", score: 74, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "Downtown Arts & Fremont", risk: "Elevated", score: 68, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "I-15 / Spaghetti Bowl Merge", risk: "High", score: 82, color: "text-red-600 bg-red-50 border-red-200" },
    { name: "Summerlin & Red Rock", risk: "Low", score: 18, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { name: "Henderson & Green Valley", risk: "Low", score: 22, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { name: "North Las Vegas", risk: "Moderate", score: 48, color: "text-stone-700 bg-stone-50 border-stone-200" }
  ];

  // Convert geo lat/lng to canvas x/y
  const geoToCanvas = (coords: GeoCoordinate, width: number, height: number) => {
    const x = ((coords.lng - LV_BOUNDS.minLng) / (LV_BOUNDS.maxLng - LV_BOUNDS.minLng)) * width;
    // Invert lat because canvas 0,0 is top-left
    const y = ((LV_BOUNDS.maxLat - coords.lat) / (LV_BOUNDS.maxLat - LV_BOUNDS.minLat)) * height;
    return { x, y };
  };

  // Render Heat Map on Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw Las Vegas Valley dark terrain grid
    ctx.fillStyle = "#1c1917"; // Stone-900
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Major Corridor Paths (Approximations for I-15, US-95, CC-215 loop)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    // I-15 curve (Southwest to Northeast)
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.95);
    ctx.quadraticCurveTo(width * 0.48, height * 0.55, width * 0.65, height * 0.15);
    ctx.stroke();

    // US-95 curve (Northwest through Spaghetti bowl to Southeast)
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.2);
    ctx.quadraticCurveTo(width * 0.52, height * 0.42, width * 0.8, height * 0.8);
    ctx.stroke();

    // 2. Draw Heat Map Blobs
    const filteredPosts = posts.filter((p) => {
      if (selectedCategoryFilter === "all") return true;
      return p.category === selectedCategoryFilter;
    });

    // Draw radial blur for each incident
    filteredPosts.forEach((post) => {
      const pt = geoToCanvas(post.coordinates, width, height);
      const isUrgent = post.urgency === "urgent" || post.urgency === "critical";

      const radius = isUrgent ? 45 * heatIntensity : 30 * heatIntensity;
      const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);

      if (post.category === "safety") {
        gradient.addColorStop(0, `rgba(239, 68, 68, ${0.85 * heatIntensity})`); // Red
        gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.35 * heatIntensity})`);
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
      } else if (post.category === "traffic") {
        gradient.addColorStop(0, `rgba(245, 158, 11, ${0.85 * heatIntensity})`); // Amber
        gradient.addColorStop(0.5, `rgba(245, 158, 11, ${0.35 * heatIntensity})`);
        gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
      } else if (post.category === "lost_pets") {
        gradient.addColorStop(0, `rgba(168, 85, 247, ${0.85 * heatIntensity})`); // Purple
        gradient.addColorStop(0.5, `rgba(168, 85, 247, ${0.35 * heatIntensity})`);
        gradient.addColorStop(1, "rgba(168, 85, 247, 0)");
      } else {
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.7 * heatIntensity})`); // Blue
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.25 * heatIntensity})`);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw CCTV Camera markers if enabled
    if (showCameras) {
      cameras.forEach((cam) => {
        const pt = geoToCanvas(cam.coordinates, width, height);
        const hasHazard = cam.congestionLevel === "gridlock" || cam.congestionLevel === "heavy";

        ctx.fillStyle = hasHazard ? "#ef4444" : "#10b981";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // 4. Draw User Location Anchor & Proximity Circle
    const userPt = geoToCanvas(userLocation.coordinates, width, height);
    // Draw user pulse ring
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(userPt.x, userPt.y, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(userPt.x, userPt.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Radius circle (approximated miles to canvas pixels)
    const milesInPixels = userLocation.radiusMiles * 12;
    ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(userPt.x, userPt.y, milesInPixels, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [isOpen, posts, cameras, selectedCategoryFilter, heatIntensity, showCameras, userLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
      <div
        id="modal-safety-heat-map"
        className="bg-stone-900 text-white rounded-2xl max-w-4xl w-full border border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Las Vegas Valley Safety & Incident Heat Map</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  LIVE SPATIAL DENSITY
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Spatial clusters of police reports, road hazards, traffic bottlenecks & FAST cameras
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="p-3 border-b border-stone-800 bg-stone-900 flex items-center justify-between gap-3 flex-wrap text-xs">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-400 font-semibold mr-1">Layer:</span>
            {[
              { id: "all", label: "All Incidents" },
              { id: "safety", label: "🚨 Police / 911" },
              { id: "traffic", label: "🛑 Traffic / Accidents" },
              { id: "lost_pets", label: "🐕 Lost Pets & Wildlife" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors ${
                  selectedCategoryFilter === cat.id
                    ? "bg-amber-500 text-stone-950 font-bold"
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Intensity & Cameras */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showCameras}
                onChange={(e) => setShowCameras(e.target.checked)}
                className="rounded border-stone-600 text-amber-500"
              />
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-emerald-400" />
                CCTV Nodes
              </span>
            </label>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <span>Heat:</span>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.1"
                value={heatIntensity}
                onChange={(e) => setHeatIntensity(Number(e.target.value))}
                className="w-16 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Main Canvas & Sector Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* Heat Map Canvas Viewport */}
          <div className="flex-1 relative bg-stone-950 flex items-center justify-center p-2">
            <canvas
              ref={canvasRef}
              width={640}
              height={440}
              className="w-full h-full max-h-[460px] object-contain rounded-xl border border-stone-800 shadow-2xl"
            />

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-stone-900/90 border border-stone-700 backdrop-blur-xs text-[10px] space-y-1">
              <div className="font-bold text-stone-300">Heat Intensity</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> High Safety
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Traffic Hazard
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Lost Pet
                </span>
              </div>
            </div>
          </div>

          {/* Sector Risk Sidebar */}
          <div className="w-full md:w-64 p-3 border-t md:border-t-0 md:border-l border-stone-800 bg-stone-900/90 overflow-y-auto space-y-3 text-xs">
            <div className="font-bold text-stone-300 text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Sector Risk Ratings</span>
            </div>

            <div className="space-y-2">
              {SECTOR_RISK_SCORES.map((sector, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl border border-stone-800 bg-stone-950/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200 truncate">{sector.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sector.color}`}>
                      {sector.risk}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sector.score > 70
                            ? "bg-red-500"
                            : sector.score > 40
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${sector.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{sector.score}/100</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Valley Proximity Note</span>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-400">
                Heat density combines 911 police chatter, Citizen incident dispatches, and RTC FAST
                corridor camera optical slowdowns within your {userLocation.radiusMiles}-mile radius.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs">
          <div className="text-[11px] text-stone-400">
            Centered near <span className="text-white font-semibold">{userLocation.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs"
          >
            Close Heat Map
          </button>
        </div>
      </div>
    </div>
  );
};
