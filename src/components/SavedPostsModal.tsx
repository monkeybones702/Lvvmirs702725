import React from "react";
import { X, Bookmark, Trash2, ExternalLink, MapPin } from "lucide-react";
import { SocialPost, GeoCoordinate } from "../types";
import { calculateDistanceMiles, formatDistance } from "../lib/geoUtils";

interface SavedPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosts: SocialPost[];
  onRemoveSaved: (postId: string) => void;
  onSelectPost: (post: SocialPost) => void;
  userCoords: GeoCoordinate;
}

export const SavedPostsModal: React.FC<SavedPostsModalProps> = ({
  isOpen,
  onClose,
  savedPosts,
  onRemoveSaved,
  onSelectPost,
  userCoords
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div
        id="modal-saved-posts"
        className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Saved & Bookmarked Posts ({savedPosts.length})
              </h2>
              <p className="text-xs text-stone-500">
                Your monitored neighborhood alerts and community records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedPosts.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs italic">
              No saved posts yet. Click the bookmark icon on any post card to save it here for
              future reference.
            </div>
          ) : (
            savedPosts.map((p) => {
              const distance = calculateDistanceMiles(userCoords, p.coordinates);
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-stone-900 text-white">
                        {p.platform}
                      </span>
                      <span className="text-[11px] font-medium text-stone-500">
                        {p.neighborhood}
                      </span>
                      <span className="text-[11px] text-amber-700 font-semibold font-mono">
                        {formatDistance(distance)}
                      </span>
                    </div>

                    <h4
                      onClick={() => {
                        onSelectPost(p);
                        onClose();
                      }}
                      className="font-bold text-stone-900 truncate hover:text-amber-700 cursor-pointer text-sm"
                    >
                      {p.title}
                    </h4>

                    <p className="text-stone-600 line-clamp-2 leading-relaxed">{p.content}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveSaved(p.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
