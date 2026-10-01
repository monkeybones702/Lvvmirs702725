export type Platform = "Nextdoor" | "Neighbors" | "Reddit" | "X" | "Facebook" | "Citizen";

export type PostCategory =
  | "safety"
  | "lost_pets"
  | "traffic"
  | "events"
  | "recommendations"
  | "general"
  | "for_sale";

export type UrgencyLevel = "normal" | "elevated" | "urgent" | "critical";

export type TimeRangeFilter = "1h" | "24h" | "3d" | "7d" | "30d" | "all";

export type SortByOption = "newest" | "oldest" | "closest" | "relevance" | "most_discussed";

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface LasVegasNeighborhood {
  id: string;
  name: string;
  area: string; // e.g., "West Valley", "Henderson", "Downtown", "North Vegas", "Southwest"
  coordinates: GeoCoordinate;
  zipCode: string;
  description: string;
}

export interface UserLocationSettings {
  name: string;
  coordinates: GeoCoordinate;
  radiusMiles: number;
  isLiveGps: boolean;
  zipCode?: string;
  selectedNeighborhoodId?: string;
}

export interface PostComment {
  id: string;
  author: string;
  neighborhood: string;
  text: string;
  timestamp: string;
  isVerifiedNeighbor: boolean;
}

export interface SocialPost {
  id: string;
  platform: Platform;
  category: PostCategory;
  urgency: UrgencyLevel;
  title: string;
  content: string;
  author: {
    name: string;
    handle?: string;
    neighborhood: string;
    isVerifiedNeighbor: boolean;
    badge?: string;
  };
  neighborhood: string;
  coordinates: GeoCoordinate;
  addressSnippet?: string;
  timestamp: string; // ISO 8601
  keywords: string[];
  engagement: {
    upvotes: number;
    commentsCount: number;
    shares: number;
    helpfulVotes?: number;
  };
  comments?: PostComment[];
  sourceUrl?: string;
  mediaType?: "photo" | "alert_icon" | "map_snapshot" | "video_clip";
  mediaUrl?: string;
  incidentVerified?: boolean;
}

export interface FilterState {
  searchQuery: string;
  activeKeywords: string[];
  keywordMatchMode: "any" | "all";
  selectedPlatforms: Platform[];
  selectedCategories: PostCategory[];
  timeRange: TimeRangeFilter;
  customStartDate?: string;
  customEndDate?: string;
  sortBy: SortByOption;
  maxDistanceMiles: number;
  urgencyFilter: "all" | "urgent_only";
  verifiedNeighborsOnly: boolean;
}

export interface AISummaryResponse {
  query: string;
  locationContext: string;
  radiusMiles: number;
  totalMatchingPosts: number;
  briefing: string;
  actionableInsights: string[];
  safetyAdvisories?: string[];
  keyLocationsMentioned: string[];
}

export type CCTVCorridor = "I-15" | "US-95" | "CC-215" | "The Strip" | "Downtown" | "Arterials";

export type CCTVSubjectType =
  | "vehicle_congestion"
  | "stalled_vehicle"
  | "pedestrian"
  | "road_hazard"
  | "emergency_vehicle"
  | "wildlife_pet"
  | "weather_visibility";

export interface CCTVDetectedSubject {
  id: string;
  subjectType: CCTVSubjectType;
  label: string;
  confidence: number; // 0.0 to 1.0
  boundingBox: {
    x: number; // percentage (0 - 100)
    y: number;
    width: number;
    height: number;
  };
  details: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface CCTVSnapshotFrame {
  frameIndex: number;
  timestamp: string;
  relativeSecAgo: number;
  simulatedSceneType:
    | "traffic_heavy"
    | "traffic_freeflow"
    | "stalled_vehicle"
    | "pedestrian_cross"
    | "road_hazard"
    | "weather_glare"
    | "night_patrol";
  imageUrl?: string;
  detectedSubjects: CCTVDetectedSubject[];
}

export interface CCTVCamera {
  id: string;
  camNumber: number;
  name: string;
  corridor: CCTVCorridor;
  mileMarker?: string;
  direction: "NB" | "SB" | "EB" | "WB" | "ALL";
  coordinates: GeoCoordinate;
  neighborhood: string;
  status: "online" | "intermittent" | "maintenance";
  sourceSite: "bugatti.nvfast.org" | "RTC_FAST";
  sourceUrl: string;
  lastUpdated: string;
  fps: number;
  frames: CCTVSnapshotFrame[];
  trafficFlowSpeedMph: number;
  congestionLevel: "clear" | "moderate" | "heavy" | "gridlock";
}

export interface CCTVScanFilter {
  targetSubjects: CCTVSubjectType[];
  selectedCorridors: CCTVCorridor[];
  maxDistanceMiles: number;
  minConfidence: number;
  onlyWithDetections: boolean;
  searchQuery: string;
}

// ----------------------------------------
// CCTV Target of Interest & Historical Audit Log
// ----------------------------------------
export interface TargetOfInterestLog {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraNumber: number;
  cameraName: string;
  corridor: CCTVCorridor;
  direction: string;
  subjectType: CCTVSubjectType;
  label: string;
  confidence: number;
  details: string;
  severity: "low" | "medium" | "high" | "critical";
  frameIndex: number;
  sourceSite: string;
  sourceUrl: string;
  routeKey: string; // e.g. "I-15 NB Corridor"
  notes?: string;
}

export interface CCTVCorridorRoute {
  id: string;
  name: string;
  corridor: CCTVCorridor;
  direction: "NB" | "SB" | "EB" | "WB" | "LOOP";
  description: string;
  cameraIds: string[];
  activeIncidentsCount: number;
}

// ----------------------------------------
// Auto-Notify Preferences & Push Notifications
// ----------------------------------------
export interface AutoNotifyPreferences {
  enabled: boolean;
  urgencyThreshold: "urgent_only" | "elevated_and_urgent" | "all";
  proximityRadiusMiles: number;
  browserPush: boolean;
  audioChime: boolean;
  notifyOn: {
    safetyAlerts: boolean;
    stalledVehicles: boolean;
    trafficBackups: boolean;
    lostPets: boolean;
    cctvHazards: boolean;
    predictiveRisk: boolean;
  };
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
}

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "safety" | "traffic" | "cctv" | "pet" | "prediction";
  read: boolean;
  sourcePostId?: string;
  sourceCameraId?: string;
  distanceMiles?: number;
  severity?: "normal" | "elevated" | "urgent";
}

// ----------------------------------------
// Predictive Alerting
// ----------------------------------------
export interface PredictiveAlert {
  id: string;
  title: string;
  locationOrCorridor: string;
  riskLevel: "low" | "moderate" | "elevated" | "severe";
  probabilityPercent: number;
  timeWindow: string; // e.g. "Next 30 - 60 minutes"
  predictedImpact: string;
  reasoning: string;
  recommendedAction: string;
  basedOnTelemetry: string[];
}

// ----------------------------------------
// Voice Memo Logging
// ----------------------------------------
export interface VoiceMemo {
  id: string;
  timestamp: string;
  durationSec: number;
  audioBlobUrl?: string;
  transcript: string;
  extractedDetails: {
    title: string;
    category: PostCategory;
    urgency: UrgencyLevel;
    suggestedNeighborhood: string;
    addressSnippet?: string;
    keywords: string[];
  };
  convertedToPostId?: string;
}

// ----------------------------------------
// Safety Heat Map Layer Options
// ----------------------------------------
export interface HeatMapLayerOptions {
  showHeatMap: boolean;
  intensity: number; // 0.2 to 1.0
  filterCategories: PostCategory[];
  includeCctvIncidents: boolean;
  selectedSector: "ALL" | "Summerlin" | "Henderson" | "The Strip" | "Downtown" | "North Las Vegas" | "Southwest";
}

// ----------------------------------------
// Google Account Contacts & Live People Location
// ----------------------------------------
export interface GooglePersonContact {
  resourceName: string;
  etag?: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  streetAddress?: string;
  city?: string;
  region?: string; // State or province
  country?: string;
  formattedAddress?: string;
  relationship?: string; // e.g. "Family", "Colleague", "Friend", "Neighbor"
  organization?: string;
  jobTitle?: string;
  coordinates?: GeoCoordinate;
  hasPhysicalLocation?: boolean;
}

export interface LiveUserLocation {
  userId: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  coordinates: GeoCoordinate;
  addressSnippet?: string;
  neighborhood?: string;
  status: "At Home" | "At Work" | "In Transit" | "On Foot / Jogging" | "Shopping / Errands" | "Out with Family" | "Active Beacon";
  speedMph: number;
  batteryLevel: number;
  isLive: boolean;
  lastSeen: string;
  relationshipTag?: "Family" | "Friend" | "Coworker" | "Neighbor" | "You";
  googleContactMatch?: boolean;
  headingCompass?: string;
  deviceType?: "Pixel" | "iPhone" | "Galaxy" | "Web Client";
  lastVerifiedCCTVCameraId?: string;
}


