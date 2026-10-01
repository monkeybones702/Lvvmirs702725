import React from "react";
import {
  X,
  Bell,
  Trash2,
  CheckCheck,
  Video,
  AlertTriangle,
  MapPin,
  Sparkles,
  Clock,
  ChevronRight
} from "lucide-react";
import { AppNotificationItem } from "../types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (item: AppNotificationItem) => void;
  onOpenSettings: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
  onOpenSettings
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-2xs animate-in fade-in duration-100">
      <div
        id="notification-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900">Incident Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 text-xs transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="p-1.5 text-stone-500 hover:text-red-600 rounded-lg hover:bg-stone-200 text-xs transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="p-10 text-center space-y-2 text-stone-400">
              <Bell className="w-8 h-8 mx-auto text-stone-300" />
              <div className="text-xs font-semibold text-stone-600">No Notifications</div>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                Real-time alerts for safety incidents, optical CCTV detections, and traffic events
                will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onMarkAsRead(item.id);
                  onSelectNotification(item);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                  !item.read
                    ? "bg-amber-50/50 border-amber-200 hover:bg-amber-50"
                    : "bg-white border-transparent hover:bg-stone-50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {item.type === "safety" ? (
                      <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                        🚨
                      </span>
                    ) : item.type === "cctv" ? (
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        🎥
                      </span>
                    ) : item.type === "prediction" ? (
                      <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        🔮
                      </span>
                    ) : item.type === "pet" ? (
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        🐕
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        ⚠️
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          !item.read ? "font-bold text-stone-900" : "font-semibold text-stone-700"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span>{item.timestamp}</span>
                      {item.distanceMiles !== undefined && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {item.distanceMiles.toFixed(1)} mi
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-stone-300 self-center shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-500">Auto-Notify active</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-amber-700 hover:text-amber-900 font-semibold text-xs"
          >
            Configure Notification Preferences →
          </button>
        </div>
      </div>
    </div>
  );
};
