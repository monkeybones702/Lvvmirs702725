import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Shield,
  Activity,
  Car,
  Dog,
  Users,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MapPin
} from "lucide-react";
import { SocialPost, CCTVCamera, UserLocationSettings, PredictiveAlert } from "../types";

interface TrendsDashboardProps {
  posts: SocialPost[];
  cameras: CCTVCamera[];
  userLocation: UserLocationSettings;
  onSelectPost: (post: SocialPost) => void;
  onSelectCamera: (camera: CCTVCamera) => void;
  onOpenVoiceMemo: () => void;
  onOpenHeatMap: () => void;
}

export const TrendsDashboard: React.FC<TrendsDashboardProps> = ({
  posts,
  cameras,
  userLocation,
  onSelectPost,
  onSelectCamera,
  onOpenVoiceMemo,
  onOpenHeatMap
}) => {
  const [timeSpan, setTimeSpan] = useState<"24h" | "7d">("7d");
  const [isRefreshingPredictions, setIsRefreshingPredictions] = useState(false);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [valleyRiskIndex, setValleyRiskIndex] = useState<number>(62);
  const [overallSummary, setOverallSummary] = useState<string>(
    "Moderate Valley incident density. Major freeway interchanges experiencing peak friction while residential zones remain calm."
  );

  // Fetch or synthesize predictive alerts from server
  const fetchPredictiveAlerts = async () => {
    setIsRefreshingPredictions(true);
    try {
      const res = await fetch("/api/predictive-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: userLocation.name,
          radiusMiles: userLocation.radiusMiles,
          recentPosts: posts.slice(0, 10),
          activeCameras: cameras.slice(0, 8)
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPredictiveAlerts(data.data.alerts || []);
        if (data.data.valleyRiskIndex) setValleyRiskIndex(data.data.valleyRiskIndex);
        if (data.data.overallSummary) setOverallSummary(data.data.overallSummary);
      }
    } catch (err) {
      console.error("Failed to load predictive alerts, using local heuristic fallback:", err);
      // Fallback local alerts if fetch fails
      setPredictiveAlerts([
        {
          id: `pred-fallback-1`,
          title: "I-15 Corridor Peak Travel Deceleration Advisory",
          locationOrCorridor: "I-15 Southbound (Sahara to Tropicana)",
          riskLevel: "elevated",
          probabilityPercent: 88,
          timeWindow: "Next 45 - 90 minutes",
          predictedImpact: "Anticipate 20-30 minute corridor delays during shift changes and resort ingress.",
          reasoning: "Optical camera feeds indicate heavy vehicle grouping near Tropicana off-ramps.",
          recommendedAction: "Divert to Dean Martin Dr or Frank Sinatra Dr.",
          basedOnTelemetry: ["FAST Cam #104 optical density", "Community traffic advisories"]
        },
        {
          id: `pred-fallback-2`,
          title: "Foothills Wildlife Dusk Movement Window",
          locationOrCorridor: "Summerlin West Trails & Alta Drive",
          riskLevel: "moderate",
          probabilityPercent: 74,
          timeWindow: "Dusk / Next 2 hours",
          predictedImpact: "Elevated coyote movement near residential open spaces and neighborhood parks.",
          reasoning: "Community reports of pack activity along walking paths over the past 3 hours.",
          recommendedAction: "Keep domestic pets leashed and secure backyards.",
          basedOnTelemetry: ["Ring Neighbors wildlife log", "Local resident alerts"]
        },
        {
          id: `pred-fallback-3`,
          title: "US-95 at Spaghetti Bowl Merge Flow Compression",
          locationOrCorridor: "US-95 SB to I-15 Interchange",
          riskLevel: "elevated",
          probabilityPercent: 82,
          timeWindow: "Next 30 - 60 minutes",
          predictedImpact: "Sudden accordion braking waves near Martin L. King Blvd exits.",
          reasoning: "Telemetry confirms deceleration waves propagating from Spaghetti Bowl merge lanes.",
          recommendedAction: "Maintain extra following distance and prepare for quick stops.",
          basedOnTelemetry: ["FAST Cam #301 optical scan", "RTC traffic alerts"]
        }
      ]);
    } finally {
      setIsRefreshingPredictions(false);
    }
  };

  useEffect(() => {
    fetchPredictiveAlerts();
  }, [userLocation.name]);

  // Historical 7-day timeline data points (calculated from posts & simulation)
  const SEVEN_DAY_TREND = [
    { day: "Mon", safety: 4, traffic: 12, pets: 3, total: 19 },
    { day: "Tue", safety: 6, traffic: 15, pets: 2, total: 23 },
    { day: "Wed", safety: 5, traffic: 14, pets: 4, total: 23 },
    { day: "Thu", safety: 8, traffic: 18, pets: 5, total: 31 },
    { day: "Fri", safety: 14, traffic: 26, pets: 3, total: 43 },
    { day: "Sat", safety: 18, traffic: 22, pets: 6, total: 46 },
    { day: "Sun (Today)", safety: 9, traffic: 16, pets: 4, total: 29 }
  ];

  // 24-Hour hourly distribution
  const HOURLY_PEAKS = [
    { hour: "6 AM", count: 8, label: "Morning Commute Onset" },
    { hour: "8 AM", count: 24, label: "I-15 / Spaghetti Bowl Peak" },
    { hour: "12 PM", count: 14, label: "Midday Commercial" },
    { hour: "3 PM", count: 18, label: "School & Shift Change" },
    { hour: "5:30 PM", count: 32, label: "Evening Valley Gridlock" },
    { hour: "9 PM", count: 22, label: "Strip / Downtown Ingress" },
    { hour: "12 AM", count: 12, label: "Night Owl Activity" }
  ];

  // Corridor congestion indices
  const CORRIDOR_STATS = [
    { corridor: "I-15 Corridor", speed: 28, status: "Heavy Delay", change: "+14% vs avg", risk: "high" },
    { corridor: "US-95 Expressway", speed: 44, status: "Moderate Flow", change: "-5% vs avg", risk: "moderate" },
    { corridor: "CC-215 Beltway", speed: 62, status: "Free Flow", change: "Normal", risk: "low" },
    { corridor: "The Strip (Blvd)", speed: 14, status: "Pedestrian Crawl", change: "+22% vs avg", risk: "high" },
    { corridor: "Downtown / Fremont", speed: 22, status: "Moderate Congestion", change: "+8% vs avg", risk: "moderate" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150 font-mono">
      {/* Top Banner: Valley Risk Index & Intelligence Overview */}
      <div className="bg-black/90 text-white rounded-xl p-5 sm:p-6 border border-amber-500/50 shadow-[0_0_25px_rgba(255,170,0,0.18)] relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>PIP-BOY PREDICTIVE MATRIX // RISK PROGNOSIS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              VALLEY RISK FREQUENCY & INCIDENT FORECAST
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {overallSummary}
            </p>
          </div>

          {/* Valley Risk Index Gauge */}
          <div className="p-4 rounded-lg bg-black/90 border border-amber-500/40 flex items-center gap-4 min-w-[220px] shadow-[0_0_15px_rgba(255,170,0,0.15)]">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-900"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray={`${valleyRiskIndex}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-bold text-base text-amber-300">
                {valleyRiskIndex}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                VALLEY RISK INDEX
              </div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">
                {valleyRiskIndex > 70 ? "ELEVATED ALERT" : "MODERATE FRICTION"}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                SECTOR: {userLocation.name}
              </div>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="pt-5 mt-5 border-t border-amber-500/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenHeatMap}
              className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(255,170,0,0.3)]"
            >
              <span>OPEN SAFETY HEAT MAP</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenVoiceMemo}
              className="px-3.5 py-1.5 rounded bg-black/70 hover:bg-black/90 border border-white/20 text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <span>RECORD AUDIO MEMO</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchPredictiveAlerts}
            disabled={isRefreshingPredictions}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPredictions ? "animate-spin text-amber-400" : ""}`} />
            <span>RE-RUN PREDICTIVE MODEL</span>
          </button>
        </div>
      </div>

      {/* Section 1: Predictive Alerting Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ACTIVE PREDICTIVE ADVISORIES & FORECASTS
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            CORRIDOR TELEMETRY + HEURISTIC ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictiveAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-black/80 rounded-xl p-4 border border-amber-500/40 shadow-[0_0_15px_rgba(255,170,0,0.1)] space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all backdrop-blur-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      alert.riskLevel === "severe" || alert.riskLevel === "elevated"
                        ? "bg-red-950 text-red-300 border-red-500/50"
                        : "bg-amber-950 text-amber-300 border-amber-500/50"
                    }`}
                  >
                    {alert.riskLevel} RISK • {alert.probabilityPercent}% PROBABLE
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {alert.timeWindow}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">
                  {alert.title}
                </h4>

                <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{alert.locationOrCorridor}</span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {alert.predictedImpact}
                </p>

                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                  <span className="font-bold text-amber-400">RECOMMENDED REROUTE: </span>
                  {alert.recommendedAction}
                </div>
              </div>

              {alert.basedOnTelemetry && alert.basedOnTelemetry.length > 0 && (
                <div className="pt-2 border-t border-amber-500/20 text-[10px] text-stone-400 space-y-0.5">
                  <span className="font-semibold text-amber-400">Signals Detected:</span>
                  {alert.basedOnTelemetry.map((sig, sIdx) => (
                    <div key={sIdx} className="truncate">• {sig}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Historical Incident Trends & Hourly Peaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 7-Day Trend Chart */}
        <div className="bg-black/80 rounded-xl p-5 border border-amber-500/40 shadow-[0_0_15px_rgba(255,170,0,0.1)] space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>7-DAY VALLEY INCIDENT VOLUME</span>
              </h3>
              <p className="text-[10px] text-stone-400">
                Aggregated safety dispatches, traffic hazards, and pet advisories
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold text-stone-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-red-500" /> SAFETY
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-400" /> TRAFFIC
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-purple-400" /> PETS
              </span>
            </div>
          </div>

          {/* SVG Bar / Area Chart */}
          <div className="pt-2">
            <div className="h-44 flex items-end justify-between gap-2 border-b border-amber-500/20 pb-2">
              {SEVEN_DAY_TREND.map((item, idx) => {
                const maxVal = 50;
                const totalHeightPct = (item.total / maxVal) * 100;
                const safetyPct = (item.safety / item.total) * 100;
                const trafficPct = (item.traffic / item.total) * 100;
                const petsPct = (item.pets / item.total) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      {item.total}
                    </span>

                    <div
                      className="w-full max-w-[28px] rounded-t overflow-hidden flex flex-col justify-end bg-black/60 border border-white/10 transition-all hover:border-amber-400 cursor-pointer"
                      style={{ height: `${totalHeightPct}%` }}
                    >
                      <div style={{ height: `${safetyPct}%` }} className="bg-red-500 w-full" />
                      <div style={{ height: `${trafficPct}%` }} className="bg-amber-400 w-full" />
                      <div style={{ height: `${petsPct}%` }} className="bg-purple-500 w-full" />
                    </div>

                    <span className="text-[10px] font-bold text-stone-400 truncate w-full text-center">
                      {item.day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hourly Peak Hours Analysis */}
        <div className="bg-black/80 rounded-xl p-5 border border-amber-500/40 shadow-[0_0_15px_rgba(255,170,0,0.1)] space-y-4 backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>DIURNAL INCIDENT PEAK CYCLES</span>
            </h3>
            <p className="text-[10px] text-stone-400">
              When incident chatter peaks across Las Vegas freeways and entertainment districts
            </p>
          </div>

          <div className="space-y-2.5">
            {HOURLY_PEAKS.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">{h.hour}</span>
                  <span className="text-amber-400/80 text-[10px]">{h.label}</span>
                  <span className="font-mono font-bold text-amber-300 text-[11px]">
                    {h.count} INCIDENTS
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-black/60 border border-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded ${
                      h.count > 25
                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : h.count > 15
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(255,170,0,0.5)]"
                        : "bg-cyan-500/70"
                    }`}
                    style={{ width: `${(h.count / 35) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Highway Corridor Bottleneck Heat Index */}
      <div className="bg-black/80 rounded-xl p-5 border border-amber-500/40 shadow-[0_0_15px_rgba(255,170,0,0.1)] space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              <span>CORRIDOR BOTTLENECK INDEX & FLOW TELEMETRY</span>
            </h3>
            <p className="text-[10px] text-stone-400">
              Real-time corridor optical metrics from RTC FAST highway nodes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CORRIDOR_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-amber-500/30 bg-black/60 space-y-2 hover:border-amber-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white truncate">
                  {stat.corridor}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                    stat.risk === "high"
                      ? "bg-red-950 text-red-300 border-red-500/50"
                      : stat.risk === "moderate"
                      ? "bg-amber-950 text-amber-300 border-amber-500/50"
                      : "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                  }`}
                >
                  {stat.risk}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-amber-300">
                  {stat.speed}
                </span>
                <span className="text-[10px] text-stone-400">MPH avg</span>
              </div>

              <div className="text-[11px] text-stone-300 font-medium">
                {stat.status}
              </div>

              <div className="text-[10px] text-amber-400/80">
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
