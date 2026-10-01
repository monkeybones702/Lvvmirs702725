import React, { useState } from "react";
import {
  X,
  PlusCircle,
  MapPin,
  Tag,
  AlertTriangle,
  ShieldCheck,
  Send
} from "lucide-react";
import { SocialPost, Platform, PostCategory, UrgencyLevel, UserLocationSettings } from "../types";
import { LAS_VEGAS_NEIGHBORHOODS } from "../data/lasVegasData";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationSettings: UserLocationSettings;
  onSubmitPost: (newPost: SocialPost) => void;
  prefillData?: {
    title?: string;
    content?: string;
    category?: PostCategory;
    addressSnippet?: string;
    keywords?: string[];
  } | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  locationSettings,
  onSubmitPost,
  prefillData
}) => {
  const [platform, setPlatform] = useState<Platform>("Nextdoor");
  const [category, setCategory] = useState<PostCategory>("safety");
  const [urgency, setUrgency] = useState<UrgencyLevel>("normal");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    locationSettings.selectedNeighborhoodId || "summerlin-west"
  );
  const [addressSnippet, setAddressSnippet] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [authorName, setAuthorName] = useState("Vegas Resident");

  React.useEffect(() => {
    if (isOpen && prefillData) {
      if (prefillData.title) setTitle(prefillData.title);
      if (prefillData.content) setContent(prefillData.content);
      if (prefillData.category) setCategory(prefillData.category);
      if (prefillData.addressSnippet) setAddressSnippet(prefillData.addressSnippet);
      if (prefillData.keywords) setKeywordsText(prefillData.keywords.join(", "));
    }
  }, [isOpen, prefillData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const neighborhoodObj =
      LAS_VEGAS_NEIGHBORHOODS.find((n) => n.id === selectedNeighborhoodId) ||
      LAS_VEGAS_NEIGHBORHOODS[0];

    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    // Auto-derive keywords from title if none supplied
    if (keywords.length === 0) {
      keywords.push(category, neighborhoodObj.name.toLowerCase());
    }

    const newPost: SocialPost = {
      id: `post-user-${Date.now()}`,
      platform,
      category,
      urgency,
      title: title.trim(),
      content: content.trim(),
      author: {
        name: authorName.trim() || "Verified Neighbor",
        neighborhood: neighborhoodObj.name,
        isVerifiedNeighbor: true,
        badge: "Active Las Vegas Resident"
      },
      neighborhood: neighborhoodObj.name,
      coordinates: neighborhoodObj.coordinates,
      addressSnippet: addressSnippet.trim() || `${neighborhoodObj.name}, Las Vegas NV`,
      timestamp: new Date().toISOString(),
      keywords,
      engagement: {
        upvotes: 1,
        commentsCount: 0,
        shares: 0,
        helpfulVotes: 1
      },
      comments: []
    };

    onSubmitPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div
        id="modal-create-post"
        className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Post Local Alert or Update</h2>
              <p className="text-xs text-stone-500">
                Broadcast across Las Vegas neighborhood apps and social channels
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

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target App / Platform */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1.5">
              Publishing Channel / App Format:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["Nextdoor", "Neighbors", "Reddit", "X", "Facebook", "Citizen"] as Platform[]).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                      platform === p
                        ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full text-xs rounded-xl border border-stone-300 p-2 bg-white text-stone-800"
              >
                <option value="safety">🚨 Safety & Crime</option>
                <option value="lost_pets">🐾 Lost & Found Pets</option>
                <option value="traffic">🚗 Traffic & Roadwork</option>
                <option value="events">🎉 Events & Meetups</option>
                <option value="recommendations">⭐ Recommendations</option>
                <option value="general">💬 General Neighborhood</option>
                <option value="for_sale">🏷️ For Sale & Free</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Urgency Tier:
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full text-xs rounded-xl border border-stone-300 p-2 bg-white text-stone-800"
              >
                <option value="normal">Normal Discussion</option>
                <option value="elevated">Notice / Advisory</option>
                <option value="urgent">🚨 Urgent Neighborhood Alert</option>
              </select>
            </div>
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Las Vegas Location / Neighborhood:
            </label>
            <select
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-300 p-2 bg-white text-stone-800"
            >
              {LAS_VEGAS_NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.zipCode}) - {n.area}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Title / Headline: *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lost friendly golden retriever near Sunset Park..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 p-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Post Description / Details: *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide exact cross streets, physical descriptions, or important time details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 p-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Cross Streets & Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-900 mb-1">
                Cross Streets / Address:
              </label>
              <input
                type="text"
                placeholder="e.g. Desert Inn & Fort Apache"
                value={addressSnippet}
                onChange={(e) => setAddressSnippet(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2 text-stone-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-900 mb-1">
                Keywords (comma separated):
              </label>
              <input
                type="text"
                placeholder="dog, lost, pet, summerlin"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2 text-stone-800"
              />
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>Publish Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};
