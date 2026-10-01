import React, { useState } from "react";
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  MapPin,
  Tag,
  Flame,
  ShieldAlert,
  Dog,
  Car,
  Calendar,
  Sparkles,
  RotateCcw,
  Check
} from "lucide-react";
import {
  FilterState,
  Platform,
  PostCategory,
  SortByOption,
  TimeRangeFilter,
  UserLocationSettings
} from "../types";
import { POPULAR_KEYWORDS } from "../data/lasVegasData";

interface SearchAndFilterToolbarProps {
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  locationSettings: UserLocationSettings;
  onOpenLocationModal: () => void;
  totalMatchingCount: number;
  totalInRadiusCount: number;
  onResetFilters: () => void;
}

const ALL_PLATFORMS: { id: Platform; label: string; dotColor: string }[] = [
  { id: "Nextdoor", label: "Nextdoor", dotColor: "bg-emerald-500" },
  { id: "Neighbors", label: "Ring Neighbors", dotColor: "bg-blue-500" },
  { id: "Reddit", label: "Reddit (r/vegas)", dotColor: "bg-orange-500" },
  { id: "X", label: "X / Twitter", dotColor: "bg-stone-900" },
  { id: "Facebook", label: "Facebook Groups", dotColor: "bg-indigo-600" },
  { id: "Citizen", label: "Citizen 911", dotColor: "bg-red-500" }
];

const ALL_CATEGORIES: { id: PostCategory; label: string; icon: React.ReactNode }[] = [
  { id: "safety", label: "Safety & Police", icon: <ShieldAlert className="w-3 h-3 text-red-600" /> },
  { id: "lost_pets", label: "Lost Pets", icon: <Dog className="w-3 h-3 text-amber-600" /> },
  { id: "traffic", label: "Traffic & Roadwork", icon: <Car className="w-3 h-3 text-blue-600" /> },
  { id: "events", label: "Events & Meetups", icon: <Calendar className="w-3 h-3 text-purple-600" /> },
  { id: "recommendations", label: "Recommendations", icon: <Sparkles className="w-3 h-3 text-emerald-600" /> },
  { id: "general", label: "General Chat", icon: <Tag className="w-3 h-3 text-stone-500" /> },
  { id: "for_sale", label: "For Sale / Free", icon: <Flame className="w-3 h-3 text-pink-600" /> }
];

const TIME_RANGES: { id: TimeRangeFilter; label: string }[] = [
  { id: "1h", label: "Past 1 hr" },
  { id: "24h", label: "Past 24 hrs" },
  { id: "3d", label: "Past 3 days" },
  { id: "7d", label: "Past 7 days" },
  { id: "30d", label: "Past 30 days" },
  { id: "all", label: "All Time" }
];

export const SearchAndFilterToolbar: React.FC<SearchAndFilterToolbarProps> = ({
  filterState,
  onUpdateFilter,
  locationSettings,
  onOpenLocationModal,
  totalMatchingCount,
  totalInRadiusCount,
  onResetFilters
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    if (!filterState.activeKeywords.includes(trimmed)) {
      onUpdateFilter({
        activeKeywords: [...filterState.activeKeywords, trimmed]
      });
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    onUpdateFilter({
      activeKeywords: filterState.activeKeywords.filter((k) => k !== kw)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword(keywordInput);
    }
  };

  const togglePlatform = (p: Platform) => {
    const current = filterState.selectedPlatforms;
    const exists = current.includes(p);
    if (exists) {
      if (current.length === 1) return; // keep at least one
      onUpdateFilter({ selectedPlatforms: current.filter((x) => x !== p) });
    } else {
      onUpdateFilter({ selectedPlatforms: [...current, p] });
    }
  };

  const toggleCategory = (c: PostCategory) => {
    const current = filterState.selectedCategories;
    const exists = current.includes(c);
    if (exists) {
      if (current.length === 1) {
        // if clearing last one, reset to all
        onUpdateFilter({ selectedCategories: ALL_CATEGORIES.map((x) => x.id) });
      } else {
        onUpdateFilter({ selectedCategories: current.filter((x) => x !== c) });
      }
    } else {
      onUpdateFilter({ selectedCategories: [...current, c] });
    }
  };

  const hasActiveFilters =
    filterState.searchQuery.trim() !== "" ||
    filterState.activeKeywords.length > 0 ||
    filterState.timeRange !== "all" ||
    filterState.sortBy !== "newest" ||
    filterState.selectedPlatforms.length < ALL_PLATFORMS.length ||
    filterState.selectedCategories.length < ALL_CATEGORIES.length ||
    filterState.urgencyFilter !== "all" ||
    filterState.verifiedNeighborsOnly;

  return (
    <div className="relative bg-black/80 rounded-xl border border-emerald-500/40 p-4 sm:p-5 shadow-[0_0_20px_rgba(0,255,102,0.1)] space-y-4 backdrop-blur-md overflow-hidden">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

      {/* Top Search Input & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
          <input
            id="input-vegas-search"
            type="text"
            placeholder="SCAN MATRIX FEED (e.g. I-15 traffic, Metro police, lost pet, CC-215 hazard)..."
            value={filterState.searchQuery}
            onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filterState.searchQuery.trim()) {
                handleAddKeyword(filterState.searchQuery.trim());
              }
            }}
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-lg border border-emerald-500/40 bg-black/60 text-emerald-200 placeholder:text-emerald-400/40 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all shadow-[inset_0_0_10px_rgba(0,255,102,0.05)]"
          />
          {filterState.searchQuery && (
            <button
              type="button"
              onClick={() => onUpdateFilter({ searchQuery: "" })}
              className="absolute right-3 top-2.5 text-emerald-400/60 hover:text-emerald-300 p-0.5"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date & Time Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 font-mono bg-black/60 px-3 py-2 rounded-lg border border-emerald-500/40 shadow-[0_0_10px_rgba(0,255,102,0.08)]">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-bold whitespace-nowrap">SORT:</span>
            <select
              id="select-sort-options"
              value={filterState.sortBy}
              onChange={(e) => onUpdateFilter({ sortBy: e.target.value as SortByOption })}
              className="bg-black text-xs font-mono text-emerald-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">NEWEST_FIRST</option>
              <option value="closest">CLOSEST_DISTANCE</option>
              <option value="relevance">KEYWORD_MATCH</option>
              <option value="most_discussed">MOST_DISCUSSED</option>
              <option value="oldest">OLDEST_FIRST</option>
            </select>
          </div>

          {/* Location & Distance Radius Trigger */}
          <button
            type="button"
            id="btn-open-location-toolbar"
            onClick={onOpenLocationModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 rounded-lg transition-colors shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            title="Adjust your location and distance radius"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap font-mono">{locationSettings.radiusMiles} MI</span>
          </button>

          {/* Advanced toggle */}
          <button
            type="button"
            id="btn-toggle-advanced-filters"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded-lg border text-xs font-mono font-bold transition-all ${
              showAdvanced
                ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(0,255,102,0.6)]"
                : "bg-black/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/40"
            }`}
            title="Toggle advanced radar filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Keyword Chips and Popular Suggestions */}
      <div className="space-y-2 pt-1">
          {/* Active Keywords row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            KEYWORDS:
          </span>

          {filterState.activeKeywords.length === 0 ? (
            <span className="text-xs text-stone-500 italic">No specific keyword tags active</span>
          ) : (
            filterState.activeKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 shadow-[0_0_8px_rgba(0,255,102,0.2)]"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="p-0.5 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}

          {/* Inline add keyword input */}
          <div className="inline-flex items-center gap-1">
            <input
              id="input-inline-keyword"
              type="text"
              placeholder="+ Add keyword tag"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="px-2 py-0.5 text-xs rounded border border-emerald-500/40 bg-black text-emerald-200 placeholder:text-stone-500 focus:outline-none focus:border-emerald-400 w-32 font-mono"
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => handleAddKeyword(keywordInput)}
                className="p-1 rounded bg-emerald-950 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>

          {filterState.activeKeywords.length > 1 && (
            <div className="flex items-center gap-1 ml-auto text-[11px] font-mono font-medium text-stone-400 bg-black/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              <span>Match:</span>
              <button
                type="button"
                onClick={() => onUpdateFilter({ keywordMatchMode: "any" })}
                className={`px-1.5 py-0.2 rounded ${
                  filterState.keywordMatchMode === "any"
                    ? "bg-emerald-500 text-black font-bold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                ANY
              </button>
              <button
                type="button"
                onClick={() => onUpdateFilter({ keywordMatchMode: "all" })}
                className={`px-1.5 py-0.2 rounded ${
                  filterState.keywordMatchMode === "all"
                    ? "bg-emerald-500 text-black font-bold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                ALL
              </button>
            </div>
          )}
        </div>

        {/* Popular Keyword Suggestions Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-emerald-400/80 mr-1 font-mono uppercase">POPULAR TAGS:</span>
          {POPULAR_KEYWORDS.slice(0, 7).map((kw) => {
            const isActive = filterState.activeKeywords.includes(kw);
            return (
              <button
                key={kw}
                type="button"
                onClick={() => (isActive ? handleRemoveKeyword(kw) : handleAddKeyword(kw))}
                className={`px-2 py-0.5 text-[11px] rounded border transition-colors font-mono ${
                  isActive
                    ? "bg-emerald-500 text-black font-bold border-emerald-400 shadow-[0_0_8px_rgba(0,255,102,0.3)]"
                    : "bg-black/60 text-stone-300 border-white/10 hover:border-emerald-500/40 hover:text-emerald-300"
                }`}
              >
                {isActive ? `✓ ${kw}` : `+ ${kw}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Time Range Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/20 font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mr-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            TIME:
          </span>
          {TIME_RANGES.map((tr) => {
            const isSelected = filterState.timeRange === tr.id;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => onUpdateFilter({ timeRange: tr.id })}
                className={`px-2.5 py-1 text-xs rounded border transition-colors font-mono ${
                  isSelected
                    ? "bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_8px_rgba(0,255,102,0.3)]"
                    : "bg-black/60 text-stone-400 border-white/10 hover:border-emerald-500/30 hover:text-stone-200"
                }`}
              >
                {tr.label}
              </button>
            );
          })}
        </div>

        {/* Result Summary & Reset */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-mono">
            SYNCED: <strong className="text-emerald-300 font-mono">{totalMatchingCount}</strong> /{" "}
            <strong className="text-emerald-300 font-mono">{locationSettings.radiusMiles} MI</strong>
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              RESET
            </button>
          )}
        </div>
      </div>

      {/* Advanced Drawer: Platform & Category Checkboxes */}
      {showAdvanced && (
        <div className="pt-3 border-t border-emerald-500/20 space-y-3 bg-black/90 p-3.5 rounded-xl border border-emerald-500/30 animate-in fade-in duration-100 font-mono">
          {/* Platforms Row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-300 uppercase">
                COMMUNITY DATA FEEDS:
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateFilter({
                    selectedPlatforms: ALL_PLATFORMS.map((p) => p.id)
                  })
                }
                className="text-[11px] text-emerald-400/70 hover:text-emerald-300 underline"
              >
                SELECT ALL
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => {
                const isSelected = filterState.selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-emerald-950/80 text-emerald-200 border-emerald-400 shadow-[0_0_8px_rgba(0,255,102,0.2)]"
                        : "bg-black/60 text-stone-500 border-white/10 line-through"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.dotColor}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-300 uppercase">
                SIGNAL CATEGORIES:
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateFilter({
                    selectedCategories: ALL_CATEGORIES.map((c) => c.id)
                  })
                }
                className="text-[11px] text-emerald-400/70 hover:text-emerald-300 underline"
              >
                SELECT ALL
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = filterState.selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-emerald-950/80 text-emerald-200 border-emerald-400 shadow-[0_0_8px_rgba(0,255,102,0.2)]"
                        : "bg-black/60 text-stone-600 border-white/10 opacity-60"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra Flags: Urgent Only / Verified Neighbors */}
          <div className="flex items-center gap-4 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={filterState.urgencyFilter === "urgent_only"}
                onChange={(e) =>
                  onUpdateFilter({
                    urgencyFilter: e.target.checked ? "urgent_only" : "all"
                  })
                }
                className="rounded accent-red-500"
              />
              <span className="font-semibold text-red-400">🚨 CRITICAL ADVISORIES ONLY</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={filterState.verifiedNeighborsOnly}
                onChange={(e) =>
                  onUpdateFilter({ verifiedNeighborsOnly: e.target.checked })
                }
                className="rounded accent-emerald-500"
              />
              <span className="text-emerald-300">VERIFIED RESIDENTS ONLY</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
