import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Sparkles,
  Download,
  AlertTriangle,
  Radio,
  PlusCircle,
  RefreshCw,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Info,
  Globe
} from "lucide-react";
import {
  SocialPost,
  UserLocationSettings,
  FilterState,
  Platform,
  PostCategory,
  SortByOption,
  CCTVCamera,
  CCTVDetectedSubject,
  AutoNotifyPreferences,
  AppNotificationItem,
  VoiceMemo
} from "./types";
import {
  LAS_VEGAS_NEIGHBORHOODS,
  DEFAULT_USER_LOCATION,
  INITIAL_POSTS
} from "./data/lasVegasData";
import { CCTV_CAMERAS } from "./data/cctvData";
import { calculateDistanceMiles } from "./lib/geoUtils";
import {
  DEFAULT_AUTO_NOTIFY_PREFS,
  playAlertChime,
  sendPushNotification,
  shouldTriggerNotification
} from "./lib/notificationService";
import { VegasHeader } from "./components/VegasHeader";
import { SearchAndFilterToolbar } from "./components/SearchAndFilterToolbar";
import { PostCard } from "./components/PostCard";
import { PostDetailModal } from "./components/PostDetailModal";
import { LocationSettingsModal } from "./components/LocationSettingsModal";
import { CreatePostModal } from "./components/CreatePostModal";
import { SavedPostsModal } from "./components/SavedPostsModal";
import { AIBriefingModal } from "./components/AIBriefingModal";
import { NeighborhoodRadarWidget } from "./components/NeighborhoodRadarWidget";
import { CCTVScannerDashboard } from "./components/CCTVScannerDashboard";
import { CCTVScannerModal } from "./components/CCTVScannerModal";
import { AuthModal } from "./components/AuthModal";
import { SourcesRegistryModal } from "./components/SourcesRegistryModal";
import { AutoNotifyModal } from "./components/AutoNotifyModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { VoiceMemoModal } from "./components/VoiceMemoModal";
import { SafetyHeatMapModal } from "./components/SafetyHeatMapModal";
import { TrendsDashboard } from "./components/TrendsDashboard";
import { GooglePeopleLiveTracker } from "./components/GooglePeopleLiveTracker";
import { MatrixRainCanvas } from "./components/hud/MatrixRainCanvas";
import { IronManHudOverlay } from "./components/hud/IronManHudOverlay";
import { HudWindow, THEME_CONFIG, HudTheme } from "./components/hud/HudWindow";
import { motion, AnimatePresence } from "motion/react";
import { exportPostsToText, downloadTextFile } from "./lib/exportPosts";
import {
  auth,
  onAuthStateChanged,
  signOut,
  savePostToFirestore,
  removeSavedPostFromFirestore,
  fetchSavedPostsFromFirestore,
  createCommunityPostInFirestore,
  fetchCommunityPostsFromFirestore,
  saveUserLocationToFirestore,
  fetchUserLocationFromFirestore
} from "./lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: "",
  activeKeywords: [],
  keywordMatchMode: "any",
  selectedPlatforms: ["Nextdoor", "Neighbors", "Reddit", "X", "Facebook", "Citizen"],
  selectedCategories: [
    "safety",
    "lost_pets",
    "traffic",
    "events",
    "recommendations",
    "general",
    "for_sale"
  ],
  timeRange: "all",
  sortBy: "newest",
  maxDistanceMiles: 10,
  urgencyFilter: "all",
  verifiedNeighborsOnly: false
};

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Location Settings
  const [locationSettings, setLocationSettings] =
    useState<UserLocationSettings>(DEFAULT_USER_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);

  // Post Data & Bookmarks
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const cached = localStorage.getItem("vegas_posts_cache");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return INITIAL_POSTS;
  });

  const [savedPosts, setSavedPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem("vegas_saved_posts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Filters and UI State
  const [activeTab, setActiveTab] = useState<"social" | "cctv" | "trends" | "people">("social");
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<CCTVCamera | null>(null);
  const [createPostPrefill, setCreatePostPrefill] = useState<any | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAIBriefingOpen, setIsAIBriefingOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-Notify & Push Notification State
  const [autoNotifyPrefs, setAutoNotifyPrefs] = useState<AutoNotifyPreferences>(() => {
    const cached = localStorage.getItem("vegas_autonotify_prefs");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_AUTO_NOTIFY_PREFS;
  });

  const [notifications, setNotifications] = useState<AppNotificationItem[]>([
    {
      id: "notif-init-1",
      title: "🚨 Active Safety Notice: Metro Incident",
      message: "Police and emergency units responding near Spring Mountain Rd. Residents advised to avoid intersection.",
      timestamp: "8m ago",
      type: "safety",
      read: false,
      sourcePostId: "post-1",
      distanceMiles: 1.4,
      severity: "urgent"
    },
    {
      id: "notif-init-2",
      title: "🎥 NV FAST CCTV Hazard: Overturned Box Truck",
      message: "I-15 at Tropicana Ave (Exit 37): Optical detection verifies 2 travel lanes blocked. Traffic slowed to 14 MPH.",
      timestamp: "18m ago",
      type: "cctv",
      read: false,
      sourceCameraId: "fast-cam-104",
      distanceMiles: 2.1,
      severity: "urgent"
    },
    {
      id: "notif-init-3",
      title: "🔮 AI Predictive Advisory: Spaghetti Bowl Merge Wave",
      message: "US-95 to I-15 interchange decelerating rapidly. 20-min delays projected over the next 45 minutes.",
      timestamp: "35m ago",
      type: "prediction",
      read: true,
      distanceMiles: 3.2,
      severity: "elevated"
    }
  ]);

  const [isAutoNotifyModalOpen, setIsAutoNotifyModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isVoiceMemoModalOpen, setIsVoiceMemoModalOpen] = useState(false);
  const [isHeatMapModalOpen, setIsHeatMapModalOpen] = useState(false);
  const [isSourcesRegistryOpen, setIsSourcesRegistryOpen] = useState(false);

  const handleSaveAutoNotifyPrefs = (updated: AutoNotifyPreferences) => {
    setAutoNotifyPrefs(updated);
    localStorage.setItem("vegas_autonotify_prefs", JSON.stringify(updated));
  };

  const handleSelectNotification = (item: AppNotificationItem) => {
    setIsNotificationDrawerOpen(false);
    if (item.sourcePostId) {
      const found = posts.find((p) => p.id === item.sourcePostId);
      if (found) {
        setSelectedPost(found);
        return;
      }
    }
    if (item.sourceCameraId) {
      const foundCam = CCTV_CAMERAS.find((c) => c.id === item.sourceCameraId);
      if (foundCam) {
        setSelectedCameraForModal(foundCam);
        return;
      }
    }
    if (item.type === "prediction") {
      setActiveTab("trends");
    }
  };

  const handlePublishVoicePost = (newPost: SocialPost) => {
    handleCreatePost(newPost);
    // Evaluate notification trigger
    if (
      shouldTriggerNotification(autoNotifyPrefs, {
        category: newPost.category,
        urgency: newPost.urgency,
        distanceMiles: 0
      })
    ) {
      if (autoNotifyPrefs.audioChime) playAlertChime("urgent");
      if (autoNotifyPrefs.browserPush) {
        sendPushNotification(`VegasPulse Alert: ${newPost.title}`, {
          body: newPost.content.slice(0, 100)
        });
      }
      setNotifications((prev) => [
        {
          id: `notif-voice-${Date.now()}`,
          title: `Field Voice Alert: ${newPost.title}`,
          message: newPost.content.slice(0, 120),
          timestamp: "Just now",
          type: newPost.category === "safety" ? "safety" : "traffic",
          read: false,
          sourcePostId: newPost.id,
          distanceMiles: 0,
          severity: newPost.urgency === "urgent" ? "urgent" : "normal"
        },
        ...prev
      ]);
    }
  };

  const handleSaveVoiceMemo = (memo: VoiceMemo) => {
    const existing = JSON.parse(localStorage.getItem("vegas_voice_memos") || "[]");
    localStorage.setItem("vegas_voice_memos", JSON.stringify([memo, ...existing]));
  };

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch saved posts and location from Firestore
        const remoteSaved = await fetchSavedPostsFromFirestore(user.uid);
        if (remoteSaved.length > 0) {
          setSavedPosts(remoteSaved);
        }
        const remoteLoc = await fetchUserLocationFromFirestore(user.uid);
        if (remoteLoc) {
          setLocationSettings(remoteLoc);
        }
      }
    });

    // Also fetch any community posts
    fetchCommunityPostsFromFirestore().then((communityPosts) => {
      if (communityPosts.length > 0) {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const newAdditions = communityPosts.filter((cp) => !ids.has(cp.id));
          return [...newAdditions, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("vegas_posts_cache", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("vegas_saved_posts", JSON.stringify(savedPosts));
  }, [savedPosts]);

  // Keep filter radius in sync with locationSettings
  useEffect(() => {
    setFilterState((prev) => ({
      ...prev,
      maxDistanceMiles: locationSettings.radiusMiles
    }));
  }, [locationSettings.radiusMiles]);

  // Geolocation Handler
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    setGpsNotification("Detecting your GPS coordinates in the Las Vegas Valley...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        // Find closest neighborhood to give it a descriptive name
        let closestNh = LAS_VEGAS_NEIGHBORHOODS[0];
        let minDist = 99999;
        LAS_VEGAS_NEIGHBORHOODS.forEach((nh) => {
          const d = calculateDistanceMiles(coords, nh.coordinates);
          if (d < minDist) {
            minDist = d;
            closestNh = nh;
          }
        });

        const newSettings: UserLocationSettings = {
          name: `My Location (~${closestNh.name})`,
          coordinates: coords,
          radiusMiles: locationSettings.radiusMiles,
          isLiveGps: true,
          zipCode: closestNh.zipCode,
          selectedNeighborhoodId: closestNh.id
        };

        setLocationSettings(newSettings);
        setIsDetectingGps(false);
        setGpsNotification(`📍 GPS Location Locked: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°W (~${minDist} mi to ${closestNh.name})`);

        if (currentUser) {
          saveUserLocationToFirestore(currentUser.uid, newSettings);
        }

        setTimeout(() => setGpsNotification(null), 5000);
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("Geolocation denied or unavailable:", err.message);
        setGpsNotification("GPS permission prompt declined or unavailable. Using default Las Vegas neighborhood.");
        setTimeout(() => setGpsNotification(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveLocation = (settings: UserLocationSettings) => {
    setLocationSettings(settings);
    if (currentUser) {
      saveUserLocationToFirestore(currentUser.uid, settings);
    }
  };

  const handleToggleSavePost = (post: SocialPost) => {
    const isAlreadySaved = savedPosts.some((p) => p.id === post.id);
    if (isAlreadySaved) {
      setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
      if (currentUser) {
        removeSavedPostFromFirestore(currentUser.uid, post.id);
      }
    } else {
      setSavedPosts((prev) => [post, ...prev]);
      if (currentUser) {
        savePostToFirestore(currentUser.uid, post);
      }
    }
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser?.email ? currentUser.email.split("@")[0] : "Local Resident",
      neighborhood: locationSettings.name.replace("My Location (~", "").replace(")", ""),
      text,
      timestamp: "Just now",
      isVerifiedNeighbor: true
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updated = {
            ...p,
            engagement: {
              ...p.engagement,
              commentsCount: p.engagement.commentsCount + 1
            },
            comments: [...(p.comments || []), newComment]
          };
          if (selectedPost?.id === postId) {
            setSelectedPost(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const handleCreateAlertFromCamera = (camera: CCTVCamera, subject?: CCTVDetectedSubject) => {
    const dist = calculateDistanceMiles(locationSettings.coordinates, camera.coordinates).toFixed(1);
    const prefill = {
      title: subject
        ? `[CCTV Alert] ${subject.label} at ${camera.name}`
        : `[FAST Traffic Advisory] Live Optical Alert at ${camera.name}`,
      content: subject
        ? `Optical snapshot analysis via NV FAST (bugatti.nvfast.org Cam #${camera.camNumber}) identified: ${subject.details}\n\nDirection: ${camera.direction} travel lanes at ${camera.name} (~${dist} mi from ${locationSettings.name}). Road speed: ${camera.trafficFlowSpeedMph} MPH (${camera.congestionLevel} flow).`
        : `Live roadway telemetry alert at ${camera.name} (${camera.corridor}) observed on NV FAST camera #${camera.camNumber}. Average speed: ${camera.trafficFlowSpeedMph} MPH with ${camera.congestionLevel} corridor density.`,
      category: (subject?.subjectType === "wildlife_pet"
        ? "lost_pets"
        : subject?.subjectType === "stalled_vehicle" || subject?.subjectType === "road_hazard"
        ? "safety"
        : "traffic") as PostCategory,
      addressSnippet: `${camera.name}, ${camera.neighborhood}`,
      keywords: [camera.corridor.toLowerCase(), "cctv", "traffic", "fast-nv"]
    };
    setCreatePostPrefill(prefill);
    setIsCreatePostOpen(true);
  };

  const handleFilterCommunityByCamera = (camera: CCTVCamera) => {
    setActiveTab("social");
    const queryTerm =
      camera.corridor === "I-15"
        ? "I-15"
        : camera.corridor === "US-95"
        ? "US-95"
        : camera.corridor === "CC-215"
        ? "215"
        : camera.neighborhood.split(" ")[0];

    setFilterState((prev) => ({
      ...prev,
      searchQuery: queryTerm
    }));
  };

  const handleCreatePost = (newPost: SocialPost) => {
    setPosts((prev) => [newPost, ...prev]);
    if (currentUser) {
      createCommunityPostInFirestore(newPost);
    }
  };

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleExportText = () => {
    const text = exportPostsToText(
      filteredAndSortedPosts.map((f) => f.post),
      locationSettings,
      filterState.searchQuery
    );
    downloadTextFile(`VegasPulse_Audit_${Date.now()}.txt`, text);
  };

  // Filter & Sort Calculation
  const filteredAndSortedPosts = useMemo(() => {
    const now = Date.now();

    return posts
      .map((post) => {
        const distanceMiles = calculateDistanceMiles(locationSettings.coordinates, post.coordinates);
        return { post, distanceMiles };
      })
      .filter(({ post, distanceMiles }) => {
        // 1. Distance Radius Filter
        if (distanceMiles > locationSettings.radiusMiles) {
          return false;
        }

        // 2. Platform Filter
        if (!filterState.selectedPlatforms.includes(post.platform)) {
          return false;
        }

        // 3. Category Filter
        if (!filterState.selectedCategories.includes(post.category)) {
          return false;
        }

        // 4. Urgency Filter
        if (filterState.urgencyFilter === "urgent_only") {
          if (post.urgency !== "urgent" && post.urgency !== "elevated") {
            return false;
          }
        }

        // 5. Verified Neighbors Filter
        if (filterState.verifiedNeighborsOnly && !post.author.isVerifiedNeighbor) {
          return false;
        }

        // 6. Time & Date Range Filter
        if (filterState.timeRange !== "all") {
          const postTime = new Date(post.timestamp).getTime();
          const ageMs = now - postTime;
          if (filterState.timeRange === "1h" && ageMs > 60 * 60 * 1000) return false;
          if (filterState.timeRange === "24h" && ageMs > 24 * 60 * 60 * 1000) return false;
          if (filterState.timeRange === "3d" && ageMs > 3 * 24 * 60 * 60 * 1000) return false;
          if (filterState.timeRange === "7d" && ageMs > 7 * 24 * 60 * 60 * 1000) return false;
          if (filterState.timeRange === "30d" && ageMs > 30 * 24 * 60 * 60 * 1000) return false;
        }

        // 7. Search Keywords Filter
        const searchableText = `${post.title} ${post.content} ${post.neighborhood} ${post.keywords.join(" ")} ${post.addressSnippet || ""}`.toLowerCase();

        // Search Query check
        if (filterState.searchQuery.trim()) {
          const queryWords = filterState.searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
          const hasQueryMatch = queryWords.some((w) => searchableText.includes(w));
          if (!hasQueryMatch) return false;
        }

        // Active Keywords Chips check
        if (filterState.activeKeywords.length > 0) {
          if (filterState.keywordMatchMode === "all") {
            const allMatch = filterState.activeKeywords.every((kw) =>
              searchableText.includes(kw.toLowerCase())
            );
            if (!allMatch) return false;
          } else {
            const anyMatch = filterState.activeKeywords.some((kw) =>
              searchableText.includes(kw.toLowerCase())
            );
            if (!anyMatch) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === "newest") {
          return new Date(b.post.timestamp).getTime() - new Date(a.post.timestamp).getTime();
        }
        if (filterState.sortBy === "oldest") {
          return new Date(a.post.timestamp).getTime() - new Date(b.post.timestamp).getTime();
        }
        if (filterState.sortBy === "closest") {
          return a.distanceMiles - b.distanceMiles;
        }
        if (filterState.sortBy === "most_discussed") {
          return b.post.engagement.commentsCount - a.post.engagement.commentsCount;
        }
        if (filterState.sortBy === "relevance") {
          // Compute score by keyword matches
          const textA = `${a.post.title} ${a.post.content}`.toLowerCase();
          const textB = `${b.post.title} ${b.post.content}`.toLowerCase();
          const countA = filterState.activeKeywords.reduce(
            (acc, k) => acc + (textA.includes(k.toLowerCase()) ? 1 : 0),
            0
          );
          const countB = filterState.activeKeywords.reduce(
            (acc, k) => acc + (textB.includes(k.toLowerCase()) ? 1 : 0),
            0
          );
          return countB - countA;
        }
        return 0;
      });
  }, [posts, locationSettings, filterState]);

  const totalInRadiusCount = useMemo(() => {
    return posts.filter(
      (p) => calculateDistanceMiles(locationSettings.coordinates, p.coordinates) <= locationSettings.radiusMiles
    ).length;
  }, [posts, locationSettings]);

  return (
    <div className="relative min-h-screen bg-[#020508] text-stone-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Matrix Rain Simulation */}
      <MatrixRainCanvas
        color={activeTab === "cctv" ? "#00f0ff" : activeTab === "trends" ? "#ffaa00" : activeTab === "people" ? "#818cf8" : "#00ff66"}
        opacity={0.16}
        fontSize={14}
        speed={1.1}
      />

      {/* Futuristic Iron Man / Stark HUD AR Overlay */}
      <IronManHudOverlay
        activeTab={activeTab}
        locationName={locationSettings.name}
        gpsActive={locationSettings.isLiveGps}
        unreadAlerts={notifications.filter((n) => !n.read).length}
        savedCount={savedPosts.length}
      />

      {/* App Header */}
      <VegasHeader
        locationSettings={locationSettings}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onRequestGps={handleRequestGps}
        isDetectingGps={isDetectingGps}
        savedCount={savedPosts.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenCreatePost={() => {
          setCreatePostPrefill(null);
          setIsCreatePostOpen(true);
        }}
        onOpenAIBriefing={() => setIsAIBriefingOpen(true)}
        onRefreshFeed={handleRefreshFeed}
        isRefreshing={isRefreshing}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => signOut(auth)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenVoiceMemo={() => setIsVoiceMemoModalOpen(true)}
        onOpenHeatMap={() => setIsHeatMapModalOpen(true)}
        onOpenAutoNotifyPrefs={() => setIsAutoNotifyModalOpen(true)}
        onOpenSourcesRegistry={() => setIsSourcesRegistryOpen(true)}
      />

      {/* GPS Notification Banner if active */}
      {gpsNotification && (
        <div className="bg-cyan-950/80 border-y border-cyan-500/40 text-cyan-200 text-xs py-2 px-4 text-center font-mono font-medium shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2 animate-in fade-in duration-200 z-20">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>[SYSTEM_TELEMETRY] {gpsNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "cctv" ? (
            <motion.div
              key="cctv-window"
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <HudWindow
                id="hud-window-cctv"
                title="NV FAST HIGHWAY SURVEILLANCE & OPTICAL TELEMETRY"
                code="STARK_FAST_SYS//NV01"
                theme="ironman"
                statusBadge="LIVE_4X_GRID_READY"
                telemetryText="FEED: BUGATTI.NVFAST.ORG // ENCRYPTION: ARC-256"
              >
                <CCTVScannerDashboard
                  locationSettings={locationSettings}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                  onInspectCamera={(cam) => setSelectedCameraForModal(cam)}
                  onCreateAlertFromCamera={handleCreateAlertFromCamera}
                  onFilterCommunityByCamera={handleFilterCommunityByCamera}
                />
              </HudWindow>
            </motion.div>
          ) : activeTab === "trends" ? (
            <motion.div
              key="trends-window"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <HudWindow
                id="hud-window-trends"
                title="VALLEY FORECAST MATRIX & PREDICTIVE ALERT HEURISTICS"
                code="PIP-BOY_3000//VEGAS_VALLEY"
                theme="fallout"
                statusBadge="NEURAL_FORECAST_ACTIVE"
                telemetryText="PREDICTION CORE: GEMINI_FLASH // CORRIDOR: I-15 & US-95"
              >
                <TrendsDashboard
                  posts={posts}
                  cameras={CCTV_CAMERAS}
                  userLocation={locationSettings}
                  onSelectPost={(post) => setSelectedPost(post)}
                  onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
                  onOpenVoiceMemo={() => setIsVoiceMemoModalOpen(true)}
                  onOpenHeatMap={() => setIsHeatMapModalOpen(true)}
                />
              </HudWindow>
            </motion.div>
          ) : activeTab === "people" ? (
            <motion.div
              key="people-window"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <HudWindow
                id="hud-window-people"
                title="GOOGLE CONTACTS & LIVE VALLEY RADAR TELEMETRY"
                code="GOOGLE_PEOPLE_API//WORKSPACE_V1"
                theme="ironman"
                statusBadge="LIVE_BEACON_ACTIVE"
                telemetryText="AUTH: GOOGLE ACCOUNT OAUTH // FIRESTORE: LIVE_LOCATIONS"
              >
                <GooglePeopleLiveTracker
                  currentUser={currentUser}
                  userCoordinates={locationSettings.coordinates}
                  onInspectCamera={(cam) => setSelectedCameraForModal(cam)}
                  onNavigateToPost={(postId) => {
                    const found = posts.find((p) => p.id === postId);
                    if (found) setSelectedPost(found);
                  }}
                />
              </HudWindow>
            </motion.div>
          ) : (
            <motion.div
              key="feed-window"
              initial={{ opacity: 0, x: -40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <HudWindow
                id="hud-window-social-feed"
                title="NEBUCHADNEZZAR DISPATCH // SOCIAL INCIDENT MATRIX"
                code="MATRIX_FEED_702//SIMULATION"
                theme="matrix"
                statusBadge="LIVE_STREAMING"
                telemetryText="SOURCES: NEXTDOOR, NEIGHBORS, REDDIT, X, CITIZEN 911"
              >
                <div className="space-y-6">
                  {/* Search, Keyword Toolbar & Sorting */}
                  <SearchAndFilterToolbar
              filterState={filterState}
              onUpdateFilter={(updates) => setFilterState((prev) => ({ ...prev, ...updates }))}
              locationSettings={locationSettings}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              totalMatchingCount={filteredAndSortedPosts.length}
              totalInRadiusCount={totalInRadiusCount}
              onResetFilters={() => setFilterState(INITIAL_FILTER_STATE)}
            />

            {/* Dual-Column Layout: Feed & Spatial Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Feed Column */}
              <div className="lg:col-span-8 space-y-4">
                {/* Feed Control Bar */}
                <div className="flex items-center justify-between gap-2 px-1 text-xs text-stone-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                      LOCAL MATRIX STREAM
                    </span>
                    <span className="text-emerald-500/40">•</span>
                    <span className="font-mono text-stone-300">
                      {filteredAndSortedPosts.length} post
                      {filteredAndSortedPosts.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSourcesRegistryOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-300 hover:text-white bg-black/80 border border-cyan-500/40 hover:bg-cyan-950/60 px-2.5 py-1 rounded shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all"
                      title="Inspect all official agency feeds and live camera source links"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SOURCES_REGISTRY</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportText}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-300 hover:text-white bg-black/80 border border-emerald-500/40 hover:bg-emerald-950/60 px-2.5 py-1 rounded shadow-[0_0_10px_rgba(0,255,102,0.15)] transition-all"
                      title="Export current posts as plain text report"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>EXPORT_LOG</span>
                    </button>
                  </div>
                </div>

                {/* Posts Grid / List */}
                {filteredAndSortedPosts.length === 0 ? (
                  <div className="bg-black/80 rounded-xl border border-emerald-500/40 p-10 text-center space-y-3 shadow-[0_0_20px_rgba(0,255,102,0.1)] font-mono">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      NO TELEMETRY MATCHED CURRENT FILTERS
                    </h3>
                    <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                      Expand radar search radius beyond {locationSettings.radiusMiles} miles, reset keywords, or recalibrate anchor sector.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleSaveLocation({
                            ...locationSettings,
                            radiusMiles: Math.min(35, locationSettings.radiusMiles + 10)
                          })
                        }
                        className="px-3.5 py-1.5 rounded bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 shadow-[0_0_10px_rgba(0,255,102,0.3)] transition-all"
                      >
                        EXPAND TO {Math.min(35, locationSettings.radiusMiles + 10)} MILES
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterState(INITIAL_FILTER_STATE)}
                        className="px-3.5 py-1.5 rounded border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-950/60"
                      >
                        PURGE FILTERS
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredAndSortedPosts.map(({ post, distanceMiles }) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        userCoords={locationSettings.coordinates}
                        calculatedDistance={distanceMiles}
                        isSaved={savedPosts.some((s) => s.id === post.id)}
                        onToggleSave={handleToggleSavePost}
                        onSelectPost={(p) => setSelectedPost(p)}
                        activeKeywords={filterState.activeKeywords}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Column: Vegas Valley Spatial Radar & Local Hubs */}
              <div className="lg:col-span-4 space-y-4">
                <NeighborhoodRadarWidget
                  locationSettings={locationSettings}
                  posts={posts}
                  onSelectNeighborhoodCenter={(nhId) => {
                    const nh = LAS_VEGAS_NEIGHBORHOODS.find((n) => n.id === nhId);
                    if (nh) {
                      handleSaveLocation({
                        name: nh.name,
                        coordinates: nh.coordinates,
                        radiusMiles: locationSettings.radiusMiles,
                        isLiveGps: false,
                        zipCode: nh.zipCode,
                        selectedNeighborhoodId: nh.id
                      });
                    }
                  }}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                />

                {/* Quick Actions Panel */}
                <div className="relative bg-black/80 rounded-xl border border-emerald-500/40 p-4 shadow-[0_0_20px_rgba(0,255,102,0.1)] space-y-3 text-xs font-mono backdrop-blur-md overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-400" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-400" />

                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block flex items-center justify-between">
                    <span>INCIDENT STATIONS & RELAYS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsHeatMapModalOpen(true)}
                      className="w-full p-2.5 rounded-lg border border-amber-500/40 hover:border-amber-400 bg-amber-950/30 text-left flex items-center justify-between font-semibold text-amber-200 transition-all hover:shadow-[0_0_12px_rgba(255,170,0,0.2)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🗺️</span>
                        <span>Safety Heat Map Overlay</span>
                      </div>
                      <span className="text-[10px] text-black bg-amber-400 px-1.5 py-0.2 rounded font-mono font-bold">
                        SPATIAL
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsVoiceMemoModalOpen(true)}
                      className="w-full p-2.5 rounded-lg border border-red-500/40 hover:border-red-400 bg-red-950/30 text-left flex items-center justify-between font-semibold text-red-200 transition-all hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎙️</span>
                        <span>Voice Memo Incident Log</span>
                      </div>
                      <span className="text-[10px] text-red-300 bg-red-950 border border-red-500/40 px-1.5 py-0.2 rounded font-mono">
                        MIC
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("trends")}
                      className="w-full p-2.5 rounded-lg border border-amber-500/40 hover:border-amber-400 bg-amber-950/30 text-left flex items-center justify-between font-semibold text-amber-200 transition-all hover:shadow-[0_0_12px_rgba(255,170,0,0.2)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔮</span>
                        <span>Predictive Alerting & Trends</span>
                      </div>
                      <span className="text-[10px] text-black bg-amber-400 px-1.5 py-0.2 rounded font-mono font-bold">
                        AI
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("cctv")}
                      className="w-full p-2.5 rounded-lg border border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/30 text-left flex items-center justify-between font-semibold text-cyan-200 transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>NV FAST CCTV Scanner</span>
                      </div>
                      <span className="text-[10px] text-cyan-300 bg-cyan-950 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono">
                        LIVE
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAutoNotifyModalOpen(true)}
                      className="w-full p-2.5 rounded-lg border border-stone-700 hover:border-stone-500 bg-black/60 text-left flex items-center justify-between font-semibold text-stone-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔔</span>
                        <span>Auto-Notify Preferences</span>
                      </div>
                      <span className="text-[10px] text-stone-400 bg-white/10 px-1.5 py-0.2 rounded font-mono">
                        PUSH
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAIBriefingOpen(true)}
                      className="w-full p-2.5 rounded-lg border border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/40 text-left flex items-center justify-between font-semibold text-cyan-200 transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Run AI Pulse Briefing</span>
                      </div>
                      <span className="text-[10px] text-cyan-300 bg-cyan-900/80 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                        GEMINI
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreatePostPrefill(null);
                        setIsCreatePostOpen(true);
                      }}
                      className="w-full p-2.5 rounded-lg border border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/50 text-left flex items-center justify-between font-bold text-emerald-200 transition-all hover:shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                    >
                      <div className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Post Alert / Lost Pet Notice</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-mono">+ NEW</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSavedModalOpen(true)}
                      className="w-full p-2.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400 bg-black/60 text-left flex items-center justify-between font-semibold text-cyan-200 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>View Monitored Bookmarks</span>
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono">
                        {savedPosts.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HudWindow>
      </motion.div>
    )}
  </AnimatePresence>
</main>

      {/* Persistent Page Footer: Data Intelligence Sources & Generation Links */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-3 px-4 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500">OUTSIDE INTEL SOURCES:</span>
            <a
              href="https://bugatti.nvfast.org"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              NV FAST Cameras
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://developers.google.com/people"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Google People API
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://www.rtcsnv.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline"
            >
              RTC NV
            </a>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setIsSourcesRegistryOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              All 13 Sources
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">PAGE GENERATION:</span>
            <span className="text-slate-300 text-[11px]">/src/App.tsx & /src/components/GooglePeopleLiveTracker.tsx</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LocationSettingsModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentSettings={locationSettings}
        onSaveLocation={handleSaveLocation}
        onRequestGps={handleRequestGps}
        isDetectingGps={isDetectingGps}
      />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          userCoords={locationSettings.coordinates}
          calculatedDistance={calculateDistanceMiles(locationSettings.coordinates, selectedPost.coordinates)}
          isSaved={savedPosts.some((s) => s.id === selectedPost.id)}
          onToggleSave={handleToggleSavePost}
          onAddComment={handleAddComment}
          onTrackVehiclePursuit={(post) => {
            setSelectedPost(null);
            setActiveTab("cctv");
          }}
        />
      )}

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => {
          setIsCreatePostOpen(false);
          setCreatePostPrefill(null);
        }}
        locationSettings={locationSettings}
        onSubmitPost={handleCreatePost}
        prefillData={createPostPrefill}
      />

      <SavedPostsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPosts={savedPosts}
        onRemoveSaved={(id) => setSavedPosts((prev) => prev.filter((p) => p.id !== id))}
        onSelectPost={(post) => setSelectedPost(post)}
        userCoords={locationSettings.coordinates}
      />

      <AIBriefingModal
        isOpen={isAIBriefingOpen}
        onClose={() => setIsAIBriefingOpen(false)}
        locationSettings={locationSettings}
        currentSearchQuery={filterState.searchQuery || filterState.activeKeywords.join(", ")}
        filteredPosts={filteredAndSortedPosts.map((f) => f.post)}
      />

      {selectedCameraForModal && (
        <CCTVScannerModal
          camera={selectedCameraForModal}
          onClose={() => setSelectedCameraForModal(null)}
          userCoords={locationSettings.coordinates}
          onCreateAlertFromCamera={handleCreateAlertFromCamera}
          onFilterCommunityByCamera={handleFilterCommunityByCamera}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onOpenSourcesRegistry={() => setIsSourcesRegistryOpen(true)}
      />

      <SourcesRegistryModal
        isOpen={isSourcesRegistryOpen}
        onClose={() => setIsSourcesRegistryOpen(false)}
        onOpenAuthForSync={() => setIsAuthModalOpen(true)}
      />

      <AutoNotifyModal
        isOpen={isAutoNotifyModalOpen}
        onClose={() => setIsAutoNotifyModalOpen(false)}
        preferences={autoNotifyPrefs}
        onSavePreferences={handleSaveAutoNotifyPrefs}
        locationName={locationSettings.name}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onSelectNotification={handleSelectNotification}
        onMarkAsRead={(id) =>
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          )
        }
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => setNotifications([])}
        onOpenSettings={() => setIsAutoNotifyModalOpen(true)}
      />

      <VoiceMemoModal
        isOpen={isVoiceMemoModalOpen}
        onClose={() => setIsVoiceMemoModalOpen(false)}
        locationSettings={locationSettings}
        onPublishAsPost={handlePublishVoicePost}
        onSaveVoiceMemo={handleSaveVoiceMemo}
      />

      <SafetyHeatMapModal
        isOpen={isHeatMapModalOpen}
        onClose={() => setIsHeatMapModalOpen(false)}
        userLocation={locationSettings}
        posts={posts}
        cameras={CCTV_CAMERAS}
        onSelectPost={(post) => setSelectedPost(post)}
        onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
      />
    </div>
  );
};

export default App;
