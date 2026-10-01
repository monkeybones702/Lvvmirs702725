import React, { useState } from "react";
import {
  X,
  MapPin,
  Navigation,
  Check,
  Compass,
  Sliders,
  Building,
  CheckCircle2,
  Info
} from "lucide-react";
import { UserLocationSettings, LasVegasNeighborhood } from "../types";
import { LAS_VEGAS_NEIGHBORHOODS } from "../data/lasVegasData";

interface LocationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: UserLocationSettings;
  onSaveLocation: (settings: UserLocationSettings) => void;
  onRequestGps: () => void;
  isDetectingGps: boolean;
}

const RADIUS_PRESETS = [
  { miles: 1, label: "1 mi", desc: "Walking / Immediate Block" },
  { miles: 3, label: "3 mi", desc: "Immediate Neighborhood" },
  { miles: 5, label: "5 mi", desc: "Local Sector / Village" },
  { miles: 10, label: "10 mi", desc: "Sub-District" },
  { miles: 15, label: "15 mi", desc: "Valley Quadrant" },
  { miles: 25, label: "25 mi", desc: "Entire Las Vegas Valley" }
];

export const LocationSettingsModal: React.FC<LocationSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveLocation,
  onRequestGps,
  isDetectingGps
}) => {
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(
    currentSettings.selectedNeighborhoodId || "summerlin-west"
  );
  const [radiusMiles, setRadiusMiles] = useState<number>(currentSettings.radiusMiles || 10);
  const [customName, setCustomName] = useState<string>(currentSettings.name);
  const [customZip, setCustomZip] = useState<string>(currentSettings.zipCode || "");

  if (!isOpen) return null;

  const handleSelectNeighborhood = (nh: LasVegasNeighborhood) => {
    setSelectedNeighborhoodId(nh.id);
    setCustomName(nh.name);
    setCustomZip(nh.zipCode);
  };

  const handleApply = () => {
    let coords = currentSettings.coordinates;
    let name = customName;
    let isLiveGps = currentSettings.isLiveGps;

    const matched = LAS_VEGAS_NEIGHBORHOODS.find((n) => n.id === selectedNeighborhoodId);
    if (matched && !isLiveGps) {
      coords = matched.coordinates;
      name = matched.name;
    }

    onSaveLocation({
      name,
      coordinates: coords,
      radiusMiles,
      isLiveGps,
      zipCode: customZip,
      selectedNeighborhoodId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div
        id="modal-location-settings"
        className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-2xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Las Vegas Location & Distance Settings
              </h2>
              <p className="text-xs text-stone-500">
                Filter social and neighborhood posts by physical distance to you
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Option 1: Live GPS Detection */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-blue-50/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  Exact GPS Geolocation
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Use your device's browser GPS to accurately measure distance to every post
                </p>
              </div>
              <button
                type="button"
                id="btn-modal-detect-gps"
                onClick={() => {
                  onRequestGps();
                }}
                disabled={isDetectingGps}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 shadow-2xs transition-colors disabled:opacity-60"
              >
                <Navigation className={`w-3 h-3 ${isDetectingGps ? "animate-spin" : ""}`} />
                {isDetectingGps ? "Detecting..." : "Detect Location"}
              </button>
            </div>

            {currentSettings.isLiveGps && (
              <div className="mt-2 text-[11px] font-mono text-blue-800 bg-blue-100/60 p-2 rounded-md flex items-center justify-between">
                <span>
                  Active Coordinates: {currentSettings.coordinates.lat.toFixed(4)}°N,{" "}
                  {currentSettings.coordinates.lng.toFixed(4)}°W
                </span>
                <span className="font-semibold uppercase tracking-wider text-[10px]">GPS Active</span>
              </div>
            )}
          </div>

          {/* Option 2: Choose Neighborhood Preset */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-2">
              Or Select Your Las Vegas Neighborhood / Sector
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {LAS_VEGAS_NEIGHBORHOODS.map((nh) => {
                const isSelected = selectedNeighborhoodId === nh.id && !currentSettings.isLiveGps;
                return (
                  <button
                    key={nh.id}
                    type="button"
                    onClick={() => handleSelectNeighborhood(nh)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/60 ring-1 ring-amber-600 shadow-2xs"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900">{nh.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                      <span>{nh.area}</span>
                      <span>•</span>
                      <span className="font-mono">{nh.zipCode}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 3: Distance Radius Slider & Presets */}
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="input-radius-slider" className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-stone-500" />
                Distance Filter Radius:
              </label>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-mono">
                Within {radiusMiles} Miles
              </span>
            </div>

            {/* Range Slider */}
            <input
              id="input-radius-slider"
              type="range"
              min="1"
              max="35"
              step="1"
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(Number(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />

            {/* Quick Presets Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.miles}
                  type="button"
                  onClick={() => setRadiusMiles(preset.miles)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    radiusMiles === preset.miles
                      ? "bg-stone-900 text-white shadow-2xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 text-stone-400" />
              Posts beyond {radiusMiles} miles will be excluded from search queries and feed streams.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-[11px] text-stone-500 font-medium">
            Active: <strong className="text-stone-800">{customName}</strong> (~{radiusMiles} mi radius)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-apply-location-settings"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              Apply Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
