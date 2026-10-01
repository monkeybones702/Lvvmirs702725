import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Info,
  Radio
} from "lucide-react";
import { AISummaryResponse, SocialPost, UserLocationSettings } from "../types";

interface AIBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationSettings: UserLocationSettings;
  currentSearchQuery: string;
  filteredPosts: SocialPost[];
}

export const AIBriefingModal: React.FC<AIBriefingModalProps> = ({
  isOpen,
  onClose,
  locationSettings,
  currentSearchQuery,
  filteredPosts
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lasvegas/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: currentSearchQuery,
          locationName: locationSettings.name,
          radiusMiles: locationSettings.radiusMiles,
          posts: filteredPosts.slice(0, 12)
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSummaryData({
          query: currentSearchQuery,
          locationContext: locationSettings.name,
          radiusMiles: locationSettings.radiusMiles,
          totalMatchingPosts: filteredPosts.length,
          ...data.data
        });
      } else {
        throw new Error("Unable to synthesize briefing");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating briefing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBriefing();
    }
  }, [isOpen, locationSettings.name, locationSettings.radiusMiles, currentSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
      <div
        id="modal-ai-briefing"
        className="bg-black/95 text-cyan-100 rounded-xl max-w-2xl w-full border border-cyan-500/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 flex items-center justify-between bg-cyan-950/40 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  JARVIS SECTOR INTELLIGENCE BRIEFING
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                  <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                  GEMINI_FLASH
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Synthesizing multi-platform signals within {locationSettings.radiusMiles} mi of{" "}
                {locationSettings.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-black/80 border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                SYNTHESIZING LOCAL SIGNALS & CORRIDOR ACTIVITY...
              </div>
              <p className="text-xs text-stone-400 max-w-sm">
                Parsing Nextdoor, Ring Neighbors, Reddit, Citizen 911, and CCTV detections.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-950/80 border border-red-500/50 text-xs text-red-200">
              {error}
            </div>
          ) : summaryData ? (
            <div className="space-y-4">
              {/* Situation Summary */}
              <div className="p-4 rounded-lg bg-black/80 border border-cyan-500/40 text-stone-200 space-y-1 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  SECTOR SITUATION OVERVIEW
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-stone-100 font-medium">
                  {summaryData.briefing}
                </p>
              </div>

              {/* Actionable Insights */}
              {summaryData.actionableInsights && summaryData.actionableInsights.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    ACTIONABLE NEIGHBORHOOD INSIGHTS
                  </h3>
                  <div className="space-y-2">
                    {summaryData.actionableInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg border border-cyan-500/30 bg-black/60 text-xs text-stone-200 hover:border-cyan-400 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety & Road Advisories */}
              {summaryData.safetyAdvisories && summaryData.safetyAdvisories.length > 0 && (
                <div className="p-3.5 rounded-lg border border-red-500/50 bg-red-950/60 space-y-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    CRITICAL SAFETY & ROADWAY ADVISORIES
                  </div>
                  <ul className="text-xs text-red-200 space-y-1 list-disc pl-4">
                    {summaryData.safetyAdvisories.map((advisory, idx) => (
                      <li key={idx}>{advisory}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hotspot Locations */}
              {summaryData.keyLocationsMentioned && summaryData.keyLocationsMentioned.length > 0 && (
                <div className="text-xs text-stone-400 flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    ACTIVE SECTOR HUBS:
                  </span>
                  {summaryData.keyLocationsMentioned.map((loc) => (
                    <span
                      key={loc}
                      className="px-2 py-0.5 rounded bg-black border border-amber-500/40 text-amber-300 font-bold"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/30 bg-black/95 flex items-center justify-between">
          <button
            type="button"
            onClick={fetchBriefing}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/40 bg-black hover:bg-cyan-950 text-cyan-300 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>RE-RUN BRIEFING</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
