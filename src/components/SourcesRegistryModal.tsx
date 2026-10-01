import React, { useState } from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  Radio,
  Video,
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  Share2,
  Copy,
  Info,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { VEGAS_DATA_SOURCES, SourceRegistryItem } from "../data/sourcesData";

interface SourcesRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthForSync?: () => void;
}

export const SourcesRegistryModal: React.FC<SourcesRegistryModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthForSync
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: "ALL", label: "ALL SOURCES" },
    { id: "cctv_network", label: "CCTV CAMERAS" },
    { id: "social_community", label: "NEIGHBORHOOD HUBS" },
    { id: "public_safety", label: "POLICE & UTILITIES" },
    { id: "transit_agency", label: "TRANSIT & ROADS" }
  ];

  const filteredSources = VEGAS_DATA_SOURCES.filter((src) => {
    if (selectedCategory !== "ALL" && src.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        src.name.toLowerCase().includes(q) ||
        src.description.toLowerCase().includes(q) ||
        src.coverage.toLowerCase().includes(q) ||
        src.officialUrl.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-mono">
      <div className="bg-black/95 text-cyan-100 rounded-xl max-w-4xl w-full border border-cyan-500/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 flex items-start justify-between gap-3 bg-cyan-950/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-mono shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                VEGAS_PULSE_702 // DATA_PROVENANCE
              </span>
              <span className="font-semibold px-2 py-0.5 rounded bg-black/80 text-emerald-300 border border-emerald-500/30">
                12 ACTIVE FEEDS
              </span>
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                OFFICIAL REPOSITORIES
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
              Verified Data Sources & Agency Links
            </h2>
            <p className="text-xs text-stone-400">
              Direct hyperlinks to Nevada State agencies, Bugatti FAST cameras, RTC Southern Nevada, and hyper-local community networks.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-red-400 rounded-lg hover:bg-black/80 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-white/10 bg-black/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search source name, agency, URL, or coverage area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cyan-500/40 bg-black/90 text-white placeholder:text-stone-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Account Connect Prompt */}
            {onOpenAuthForSync && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthForSync();
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.35)] shrink-0"
              >
                <span>INTERLINK ACCOUNTS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded border text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                    : "bg-black/50 text-stone-400 border-white/10 hover:border-white/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredSources.map((source) => {
            return (
              <div
                key={source.id}
                className="bg-black/80 rounded-xl border border-cyan-500/30 p-4 hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{
                        borderColor: `${source.accentColor}60`,
                        backgroundColor: `${source.accentColor}18`,
                        color: source.accentColor
                      }}
                    >
                      {source.category.toUpperCase().replace("_", " ")}
                    </span>

                    {source.isOfficialAgency && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        OFFICIAL AGENCY
                      </span>
                    )}

                    <span className="text-[10px] text-stone-500">
                      REFRESH: {source.refreshRate}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{source.name}</span>
                  </h3>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    {source.description}
                  </p>

                  {/* Coverage & Provided Data Pills */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] text-cyan-400 font-mono">
                      <span className="text-stone-500">COVERAGE:</span> {source.coverage}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-500">PAYLOADS:</span>
                      {source.dataTypesProvided.map((dt, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-stone-300"
                        >
                          {dt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Direct Links & Actions */}
                <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                  >
                    <span>VISIT SOURCE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {source.endpointOrPortal !== source.officialUrl && (
                    <a
                      href={source.endpointOrPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-3 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/20 text-cyan-300 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>FEED PORTAL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(source.officialUrl, source.id)}
                    className="p-1.5 rounded border border-white/10 bg-black/40 text-stone-400 hover:text-white text-xs transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === source.id ? (
                      <span className="text-[10px] text-emerald-400">COPIED</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-cyan-500/30 bg-black/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>All sources are verified for public safety, real-time arterial CCTV, and local Clark County telemetry.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors w-full sm:w-auto text-center"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
