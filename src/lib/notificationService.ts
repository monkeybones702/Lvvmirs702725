import { AutoNotifyPreferences, AppNotificationItem, SocialPost, CCTVCamera, CCTVDetectedSubject } from "../types";

// Default Preferences
export const DEFAULT_AUTO_NOTIFY_PREFS: AutoNotifyPreferences = {
  enabled: true,
  urgencyThreshold: "elevated_and_urgent",
  proximityRadiusMiles: 5,
  browserPush: true,
  audioChime: true,
  notifyOn: {
    safetyAlerts: true,
    stalledVehicles: true,
    trafficBackups: true,
    lostPets: true,
    cctvHazards: true,
    predictiveRisk: true
  },
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00"
};

// Web Audio synthesizer for customizable alert chimes
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAlertChime(type: "urgent" | "cctv" | "subtle" = "urgent") {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "urgent") {
      // Two-tone warning alert (e.g. 880Hz -> 1174Hz)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "cctv") {
      // High-tech radar blip
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Pleasant ping
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    console.warn("Audio chime playback ignored:", err);
  }
}

// Request Browser Push Notification Permission
export async function requestBrowserPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
}

// Dispatch a system push notification
export function sendPushNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options
      });
    } catch (err) {
      console.warn("Browser Notification could not be displayed:", err);
    }
  }
}

// Evaluate whether an incoming event should trigger an alert based on user preferences
export function shouldTriggerNotification(
  prefs: AutoNotifyPreferences,
  event: {
    category?: string;
    urgency?: string;
    distanceMiles?: number;
    isCctv?: boolean;
  }
): boolean {
  if (!prefs.enabled) return false;

  // Check Quiet Hours
  if (prefs.quietHoursEnabled) {
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTimeStr = `${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`;

    if (prefs.quietHoursStart > prefs.quietHoursEnd) {
      // Overnight (e.g. 22:00 to 07:00)
      if (currentTimeStr >= prefs.quietHoursStart || currentTimeStr <= prefs.quietHoursEnd) {
        return false;
      }
    } else {
      if (currentTimeStr >= prefs.quietHoursStart && currentTimeStr <= prefs.quietHoursEnd) {
        return false;
      }
    }
  }

  // Distance Check
  if (event.distanceMiles !== undefined && event.distanceMiles > prefs.proximityRadiusMiles) {
    return false;
  }

  // Urgency Check
  if (prefs.urgencyThreshold === "urgent_only") {
    if (event.urgency !== "urgent" && event.urgency !== "critical") {
      return false;
    }
  } else if (prefs.urgencyThreshold === "elevated_and_urgent") {
    if (event.urgency !== "urgent" && event.urgency !== "critical" && event.urgency !== "elevated") {
      return false;
    }
  }

  // Category toggles
  if (event.isCctv && !prefs.notifyOn.cctvHazards) return false;
  if (event.category === "safety" && !prefs.notifyOn.safetyAlerts) return false;
  if (event.category === "traffic" && !prefs.notifyOn.trafficBackups) return false;
  if (event.category === "lost_pets" && !prefs.notifyOn.lostPets) return false;

  return true;
}
