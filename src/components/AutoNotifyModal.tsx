import React, { useState } from "react";
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Play
} from "lucide-react";
import { AutoNotifyPreferences } from "../types";
import {
  requestBrowserPushPermission,
  sendPushNotification,
  playAlertChime
} from "../lib/notificationService";

interface AutoNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AutoNotifyPreferences;
  onSavePreferences: (updated: AutoNotifyPreferences) => void;
  locationName: string;
}

export const AutoNotifyModal: React.FC<AutoNotifyModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  locationName
}) => {
  const [prefs, setPrefs] = useState<AutoNotifyPreferences>(preferences);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    const perm = await requestBrowserPushPermission();
    setPermissionState(perm);
    if (perm === "granted") {
      setPrefs((prev) => ({ ...prev, browserPush: true }));
    }
  };

  const handleSendTestNotification = () => {
    // Play chime synthesizer
    if (prefs.audioChime) {
      playAlertChime("urgent");
    }

    // Send browser notification
    if (permissionState === "granted" && prefs.browserPush) {
      sendPushNotification("VegasPulse Alert: Test Notification", {
        body: `Auto-notify active within ${prefs.proximityRadiusMiles} miles of ${locationName}. Monitoring safety and traffic.`,
        tag: "vegas-test-alert"
      });
    }

    setTestSentMessage("✓ Test notification dispatched with audio chime!");
    setTimeout(() => setTestSentMessage(null), 4000);
  };

  const handleSave = () => {
    onSavePreferences(prefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div
        id="modal-auto-notify-prefs"
        className="bg-white text-stone-900 rounded-2xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Push Notifications & Auto-Notify
              </h2>
              <p className="text-xs text-stone-500">
                Proximity alerts for safety, CCTV hazards & local incidents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
          {/* Master Toggle */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Enable Real-Time Proximity Alerts</span>
                {prefs.enabled && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-stone-500 text-xs mt-0.5">
                Automatically alerts you when critical incidents occur near {locationName}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.enabled}
                onChange={(e) => setPrefs({ ...prefs, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Browser Push Permission Banner */}
          <div className="p-3.5 rounded-xl border border-stone-200 flex items-center justify-between gap-3 bg-white">
            <div className="space-y-0.5">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Web Push Notifications</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Permission status:{" "}
                <span
                  className={`font-semibold ${
                    permissionState === "granted"
                      ? "text-emerald-600"
                      : permissionState === "denied"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {permissionState.toUpperCase()}
                </span>
              </p>
            </div>

            {permissionState !== "granted" ? (
              <button
                type="button"
                onClick={handleRequestPush}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-2xs transition-colors"
              >
                Allow Notifications
              </button>
            ) : (
              <div className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Allowed</span>
              </div>
            )}
          </div>

          {/* Alert Channels: Audio Chime & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Audio Chime */}
            <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>Audio Alert Chime</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.audioChime}
                  onChange={(e) => setPrefs({ ...prefs, audioChime: e.target.checked })}
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Plays an acoustic frequency tone upon critical incident detection.
              </p>
              <button
                type="button"
                onClick={() => playAlertChime("cctv")}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Test Sound Tone
              </button>
            </div>

            {/* Proximity Radius */}
            <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Alert Distance Radius</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Only notify if within:{" "}
                <span className="font-bold text-stone-900">{prefs.proximityRadiusMiles} miles</span>
              </p>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={prefs.proximityRadiusMiles}
                onChange={(e) =>
                  setPrefs({ ...prefs, proximityRadiusMiles: Number(e.target.value) })
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Urgency Threshold */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 text-xs block">
              Incident Urgency Threshold
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "urgent_only", label: "Critical & Urgent Only", desc: "Crimes, Police, Big Crashes" },
                { id: "elevated_and_urgent", label: "Elevated & Critical", desc: "Recommended Default" },
                { id: "all", label: "All Incidents", desc: "Including Lost Pets & Traffic" }
              ].map((thresh) => (
                <button
                  key={thresh.id}
                  type="button"
                  onClick={() =>
                    setPrefs({ ...prefs, urgencyThreshold: thresh.id as any })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    prefs.urgencyThreshold === thresh.id
                      ? "border-stone-900 bg-stone-900 text-white shadow-2xs font-semibold"
                      : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className="text-xs font-bold">{thresh.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      prefs.urgencyThreshold === thresh.id ? "text-stone-300" : "text-stone-400"
                    }`}
                  >
                    {thresh.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Categories Subscribed */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 text-xs block">
              Auto-Notification Triggers:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: "safetyAlerts", label: "🚨 Police / Safety / 911 Citizen" },
                { key: "cctvHazards", label: "🎥 NV FAST CCTV Optical Hazards" },
                { key: "trafficBackups", label: "🛑 Major Freeway Backups & Delays" },
                { key: "stalledVehicles", label: "🚗 Stalled Vehicles on Corridors" },
                { key: "lostPets", label: "🐕 Lost Pet & Coyote Advisories" },
                { key: "predictiveRisk", label: "🔮 AI Predictive Event Forecasts" }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer bg-white"
                >
                  <input
                    type="checkbox"
                    checked={(prefs.notifyOn as any)[item.key]}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        notifyOn: {
                          ...prefs.notifyOn,
                          [item.key]: e.target.checked
                        }
                      })
                    }
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-medium text-stone-800 text-[11px] truncate">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Quiet Hours</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.quietHoursEnabled}
                onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Silence non-critical notification chimes during sleep or work hours.
            </p>

            {prefs.quietHoursEnabled && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span>From</span>
                <input
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                  className="p-1 border border-stone-300 rounded bg-white"
                />
                <span>To</span>
                <input
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                  className="p-1 border border-stone-300 rounded bg-white"
                />
              </div>
            )}
          </div>

          {/* Test Trigger Button */}
          <div className="pt-1 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>Send Test Push Notification</span>
            </button>

            {testSentMessage && (
              <span className="text-[11px] text-emerald-700 font-semibold animate-in fade-in">
                {testSentMessage}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors shadow-2xs"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
