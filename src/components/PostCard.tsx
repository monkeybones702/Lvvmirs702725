import React from "react";
import {
  MapPin,
  Clock,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Compass
} from "lucide-react";
import { SocialPost, GeoCoordinate, Platform } from "../types";
import { formatDistance, getCompassDirection } from "../lib/geoUtils";

interface PostCardProps {
  post: SocialPost;
  userCoords: GeoCoordinate;
  calculatedDistance: number;
  isSaved: boolean;
  onToggleSave: (post: SocialPost) => void;
  onSelectPost: (post: SocialPost) => void;
  activeKeywords: string[];
}

const PLATFORM_STYLES: Record<
  Platform,
  { bg: string; text: string; border: string; label: string }
> = {
  Nextdoor: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    label: "Nextdoor"
  },
  Neighbors: {
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    label: "Ring Neighbors"
  },
  Reddit: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    label: "Reddit"
  },
  X: {
    bg: "bg-stone-100",
    text: "text-stone-900",
    border: "border-stone-300",
    label: "X / Local Pulse"
  },
  Facebook: {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    label: "Facebook Groups"
  },
  Citizen: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    label: "Citizen 911"
  }
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  userCoords,
  calculatedDistance,
  isSaved,
  onToggleSave,
  onSelectPost,
  activeKeywords
}) => {
  const platformMeta = PLATFORM_STYLES[post.platform] || {
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    label: post.platform
  };

  const direction = getCompassDirection(userCoords, post.coordinates);

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

  // Format relative timestamp
  const postDate = new Date(post.timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
  let timeAgoText = "";
  if (diffMinutes < 1) timeAgoText = "Just now";
  else if (diffMinutes < 60) timeAgoText = `${diffMinutes}m ago`;
  else if (diffMinutes < 1440) timeAgoText = `${Math.floor(diffMinutes / 60)}h ago`;
  else timeAgoText = `${Math.floor(diffMinutes / 1440)}d ago`;

  // Keyword highlighting helper
  const highlightText = (text: string) => {
    if (!activeKeywords.length) return text;
    const regex = new RegExp(`(${activeKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      activeKeywords.some((k) => k.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="bg-emerald-500/30 text-emerald-200 border border-emerald-400 font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <article
      id={`post-card-${post.id}`}
      className="relative bg-black/70 rounded-xl border border-emerald-500/30 hover:border-emerald-400/70 p-4 sm:p-5 shadow-[0_0_15px_rgba(0,255,102,0.06)] hover:shadow-[0_0_25px_rgba(0,255,102,0.2)] transition-all flex flex-col justify-between group backdrop-blur-md overflow-hidden"
    >
      {/* Corner Iron Man HUD brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Card Header: Platform, Distance, Urgency, Timestamp */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Platform Badge */}
            <span
              className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
            >
              {platformMeta.label}
            </span>

            {/* Distance Badge */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-500/40"
              title={`Approximately ${calculatedDistance} miles from your selected location (${direction})`}
            >
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{formatDistance(calculatedDistance)}</span>
              <span className="text-cyan-400/60 font-mono">[{direction}]</span>
            </span>

            {/* Urgency Badge */}
            {post.urgency === "urgent" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                <span>URGENT</span>
              </span>
            )}
            {post.urgency === "elevated" && (
              <span className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50">
                ELEVATED
              </span>
            )}

            {/* Verified Neighbor Badge */}
            {(post.author?.isVerifiedNeighbor || post.incidentVerified) && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30"
                title="Resident identity verified via address & neighborhood matching"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">VERIFIED</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-mono shrink-0">
            <Clock className="w-3 h-3 text-stone-500" />
            <span className="text-[11px] text-stone-400">{timeAgoText}</span>
          </div>
        </div>

        {/* Post Title */}
        <h4
          onClick={() => onSelectPost(post)}
          className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer line-clamp-1 mb-1 font-mono tracking-wide"
        >
          {highlightText(post.title)}
        </h4>

        {/* Post Content Snippet */}
        <p
          onClick={() => onSelectPost(post)}
          className="text-xs text-stone-300 font-sans leading-relaxed line-clamp-2 cursor-pointer mb-3"
        >
          {highlightText(post.content)}
        </p>

        {/* Metadata Footer: Author, Address Snippet, Keywords */}
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-3 pt-2 border-t border-white/10 gap-2 flex-wrap">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-emerald-400 truncate">
              @{typeof post.author === "string" ? post.author : post.author?.name || "resident"}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-stone-300 truncate max-w-[140px] sm:max-w-[200px]">
              {post.addressSnippet || post.neighborhood}
            </span>
          </div>

          {post.keywords.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {post.keywords.slice(0, 3).map((kw, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono bg-white/5 border border-white/10 text-stone-300 px-1.5 py-0.5 rounded"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Engagement & Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-stone-400">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onSelectPost(post)}
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
            title="Read comments and join neighborhood discussion"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            <span>{post.engagement.commentsCount}</span>
          </button>

          <div
            className="flex items-center gap-1 text-stone-400"
            title="Upvotes from verified neighbors"
          >
            <span>▲</span>
            <span>{post.engagement.upvotes}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Source Link */}
          <a
            href={getSourceLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 bg-black/40 text-stone-400 hover:text-cyan-300 transition-all flex items-center gap-1 text-[10px] font-mono"
            title={`Open original source link on ${post.platform}`}
          >
            <span className="hidden sm:inline">SRC</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => onToggleSave(post)}
            className={`p-1.5 rounded-lg border transition-all ${
              isSaved
                ? "bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(255,170,0,0.3)]"
                : "border-white/10 hover:border-emerald-400/40 text-stone-400 hover:text-emerald-300"
            }`}
            title={isSaved ? "Remove from saved incidents" : "Bookmark this incident"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Read Thread CTA */}
          <button
            type="button"
            onClick={() => onSelectPost(post)}
            className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 shadow-[0_0_10px_rgba(0,255,102,0.15)] transition-all"
          >
            <span>INTEL</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};

