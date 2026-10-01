import React, { useState } from "react";
import {
  History,
  Target,
  AlertTriangle,
  Clock,
  ExternalLink,
  MapPin,
  Trash2,
  Filter,
  CheckCircle2,
  Maximize2,
  Calendar,
  Layers
} from "lucide-react";
import { TargetOfInterestLog, CCTVCamera } from "../types";
import { CCTV_CAMERAS } from "../data/cctvData";

interface TargetOfInterestLogViewProps {
  logs: TargetOfInterestLog[];
  onClearLogs: () => void;
  onInspectCamera: (camera: CCTVCamera) => void;
}

export const TargetOfInterestLogView: React.FC<TargetOfInterestLogViewProps> = ({
  logs,
  onClearLogs,
  onInspectCamera
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterCorridor, setFilterCorridor] = useState<string>("ALL");

  const filteredLogs = logs.filter((log) => {
    if (filterSeverity !== "ALL" && log.severity !== filterSeverity) return false;
    if (filterCorridor !== "ALL" && log.corridor !== filterCorridor) return false;
    return true;
  });

  const corridors = Array.from(new Set(logs.map((l) => l.corridor)));

  const handleInspectByLog = (log: TargetOfInterestLog) => {
    const cam = CCTV_CAMERAS.find((c) => c.id === log.cameraId || c.camNumber === log.cameraNumber);
    if (cam) {
      onInspectCamera(cam);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="bg-black/90 rounded-xl border border-red-500/40 p-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-950 text-red-400 border border-red-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.3)]">
              <History className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">TARGETS OF INTEREST LOG</span>
              <span className="text-xs text-stone-400 font-normal">// HISTORIC_INCIDENT_AUDIT</span>
            </h3>
          </div>
          <p className="text-xs text-stone-300">
            Historical audit log of vehicle anomalies, debris hazards, and stalled vehicles captured across NV FAST cameras.
          </p>
        </div>

        {/* Clear Log Button */}
        <div className="flex items-center gap-2">
          <a
            href="https://bugatti.nvfast.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-black/80 hover:bg-black border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,170,0,0.2)]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>BUGATTI.NVFAST.ORG</span>
          </a>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={onClearLogs}
              className="px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR LOGS</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="bg-black/80 rounded-xl border border-cyan-500/30 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">SEVERITY:</span>
          {["ALL", "critical", "high", "medium", "low"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all uppercase ${
                filterSeverity === sev
                  ? "bg-red-950 text-red-200 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                  : "bg-black/50 text-stone-400 border-white/10 hover:border-white/20"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">CORRIDOR:</span>
          <button
            type="button"
            onClick={() => setFilterCorridor("ALL")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
              filterCorridor === "ALL"
                ? "bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                : "bg-black/50 text-stone-400 border-white/10 hover:border-white/20"
            }`}
          >
            ALL
          </button>
          {corridors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCorridor(c)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                filterCorridor === c
                  ? "bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                  : "bg-black/50 text-stone-400 border-white/10 hover:border-white/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-black/70 rounded-xl border border-white/10 p-12 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
          <h4 className="text-sm font-bold text-white uppercase">No targets of interest logged</h4>
          <p className="text-xs text-stone-400">Target detections logged during optical sweeps or manually flagged will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-black/80 rounded-xl border border-cyan-500/30 p-4 hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      log.severity === "critical" || log.severity === "high"
                        ? "bg-red-950 text-red-300 border-red-500/50"
                        : log.severity === "medium"
                        ? "bg-amber-950 text-amber-300 border-amber-500/50"
                        : "bg-cyan-950 text-cyan-300 border-cyan-500/50"
                    }`}
                  >
                    {log.severity}
                  </span>

                  <span className="text-xs font-bold text-white">{log.label}</span>

                  <span className="text-[11px] text-cyan-400 font-mono">
                    ({Math.round(log.confidence * 100)}% CONF)
                  </span>

                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </span>
                </div>

                <div className="text-xs text-stone-300 flex items-center gap-2 flex-wrap">
                  <span className="text-cyan-300 font-bold">Cam #{log.cameraNumber}</span>
                  <span className="text-stone-500">•</span>
                  <span>{log.cameraName}</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-amber-400">{log.corridor}</span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">{log.details}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={log.sourceUrl || `https://bugatti.nvfast.org/camera/${log.cameraNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded bg-black border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-950/40 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>NVFAST FEED</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleInspectByLog(log)}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>INSPECT HUD</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
