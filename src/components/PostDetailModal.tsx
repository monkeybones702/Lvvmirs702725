import React, { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Compass,
  Send,
  CornerDownRight,
  Check,
  Crosshair
} from "lucide-react";
import { SocialPost, GeoCoordinate } from "../types";
import { formatDistance, getCompassDirection } from "../lib/geoUtils";

interface PostDetailModalProps {
  post: SocialPost | null;
  onClose: () => void;
  userCoords: GeoCoordinate;
  calculatedDistance: number;
  isSaved: boolean;
  onToggleSave: (post: SocialPost) => void;
  onAddComment: (postId: string, text: string) => void;
  onTrackVehiclePursuit?: (post: SocialPost) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  userCoords,
  calculatedDistance,
  isSaved,
  onToggleSave,
  onAddComment,
  onTrackVehiclePursuit
}) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!post) return null;

  const direction = getCompassDirection(userCoords, post.coordinates);
  const postDate = new Date(post.timestamp);

  const getSourceLink = (): string => {
    if (post.sourceUrl) return post.sourceUrl;
    switch (post.platform) {
      case "Nextdoor":
        return `https://nextdoor.com/city/las-vegas--nv/`;
      case "Neighbors":
        return `https://ring.com/neighbors`;
      case "Reddit":
        return `https://www.reddit.com/r/vegas/`;
      case "X":
        return post.author?.handle
          ? `https://x.com/${post.author.handle.replace("@", "")}`
          : `https://x.com/search?q=las+vegas+traffic`;
      case "Facebook":
        return `https://www.facebook.com/search/groups/?q=las%20vegas%20community`;
      case "Citizen":
        return `https://citizen.com/explore/las-vegas-nv`;
      default:
        return "https://bugatti.nvfast.org";
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div
        id="modal-post-detail"
        className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-start justify-between gap-3 bg-stone-50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-stone-900 text-white">
                {post.platform}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                <MapPin className="w-3 h-3 text-amber-700" />
                {formatDistance(calculatedDistance)} ({direction})
              </span>
              {post.urgency === "urgent" && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Urgent Notice
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug pt-1">
              {post.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Author info & timestamp */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-xs">
                {post.author.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900">{post.author.name}</span>
                  {post.author.handle && (
                    <span className="text-stone-400">{post.author.handle}</span>
                  )}
                  {post.author.isVerifiedNeighbor && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      Verified Resident
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-500">
                  {post.neighborhood} • {post.author.badge || "Community Member"}
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-stone-500 font-mono">
              <div>{postDate.toLocaleDateString()}</div>
              <div>{postDate.toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Full Content Text */}
          <div className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {/* Location & Map Snapshot Snippet */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                Las Vegas Physical Location Context
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${post.coordinates.lat},${post.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-xs text-stone-600 font-mono">
              Coordinates: {post.coordinates.lat.toFixed(5)}°N, {post.coordinates.lng.toFixed(5)}°W
              {post.addressSnippet && ` • ${post.addressSnippet}`}
            </div>
          </div>

          {/* Keywords Chips */}
          {post.keywords.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-stone-400">Tagged:</span>
              {post.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}

          {/* Neighborhood Comments Section */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              Neighbor Discussion ({post.comments?.length || 0})
            </h3>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-stone-200 bg-white text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{c.author}</span>
                        <span className="text-[11px] text-stone-400">• {c.neighborhood}</span>
                        {c.isVerifiedNeighbor && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{c.timestamp}</span>
                    </div>
                    <p className="text-stone-700 leading-normal">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic py-2">
                  No comments yet. Be the first local neighbor to respond.
                </p>
              )}
            </div>

            {/* Post a Comment Form */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add a verified neighbor comment or update..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href={getSourceLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950 text-cyan-200 hover:bg-cyan-900 text-xs font-semibold font-mono transition-colors"
              title={`Visit source on ${post.platform}`}
            >
              <span>Source ({post.platform})</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>

            {onTrackVehiclePursuit && (
              <button
                type="button"
                onClick={() => onTrackVehiclePursuit(post)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/50 bg-red-950 text-red-200 hover:bg-red-900 text-xs font-semibold font-mono shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-colors"
                title="Track suspect vehicle via 8-directional 5-mile camera search"
              >
                <Crosshair className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span>8-Dir Pursuit Scan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleSave(post)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isSaved
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Saved to Bookmarks</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmark Post</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
