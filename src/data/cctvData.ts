import { CCTVCamera, CCTVSubjectType, CCTVCorridorRoute, TargetOfInterestLog } from "../types";

const nowMs = Date.now();
const formatIso = (secAgo: number) => new Date(nowMs - secAgo * 1000).toISOString();

export const CCTV_CAMERAS: CCTVCamera[] = [
  {
    id: "fast-cam-104",
    camNumber: 104,
    name: "I-15 at Tropicana Ave (Exit 37)",
    corridor: "I-15",
    mileMarker: "MP 36.8",
    direction: "NB",
    coordinates: { lat: 36.1015, lng: -115.178 },
    neighborhood: "Paradise, UNLV & The Strip",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/104",
    lastUpdated: "Just now",
    fps: 0.2, // updates every 5 sec
    trafficFlowSpeedMph: 14,
    congestionLevel: "gridlock",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "stalled_vehicle",
        detectedSubjects: [
          {
            id: "det-104-1",
            subjectType: "stalled_vehicle",
            label: "Overturned Box Truck & Lane Block",
            confidence: 0.96,
            boundingBox: { x: 44, y: 38, width: 28, height: 32 },
            details: "Commercial box truck blocking 2 right travel lanes. Tow truck staging.",
            severity: "critical"
          },
          {
            id: "det-104-2",
            subjectType: "emergency_vehicle",
            label: "NHP Highway Patrol Units (2)",
            confidence: 0.94,
            boundingBox: { x: 74, y: 46, width: 20, height: 26 },
            details: "Trooper vehicles with active emergency flashers directing traffic to shoulder.",
            severity: "high"
          },
          {
            id: "det-104-3",
            subjectType: "vehicle_congestion",
            label: "Severe Traffic Backup (14 mph)",
            confidence: 0.98,
            boundingBox: { x: 10, y: 22, width: 78, height: 50 },
            details: "Queue extending over 2.4 miles south toward 215 interchange.",
            severity: "high"
          }
        ]
      },
      {
        frameIndex: 1,
        timestamp: formatIso(15),
        relativeSecAgo: 15,
        simulatedSceneType: "stalled_vehicle",
        detectedSubjects: [
          {
            id: "det-104-1b",
            subjectType: "stalled_vehicle",
            label: "Overturned Box Truck",
            confidence: 0.95,
            boundingBox: { x: 43, y: 38, width: 29, height: 32 },
            details: "Debris field visible on right shoulder.",
            severity: "critical"
          },
          {
            id: "det-104-2b",
            subjectType: "emergency_vehicle",
            label: "NHP Emergency Flashing",
            confidence: 0.93,
            boundingBox: { x: 73, y: 46, width: 21, height: 26 },
            details: "Active flare deployment.",
            severity: "high"
          }
        ]
      },
      {
        frameIndex: 2,
        timestamp: formatIso(30),
        relativeSecAgo: 30,
        simulatedSceneType: "stalled_vehicle",
        detectedSubjects: [
          {
            id: "det-104-1c",
            subjectType: "stalled_vehicle",
            label: "Disabled Commercial Truck",
            confidence: 0.94,
            boundingBox: { x: 44, y: 39, width: 28, height: 31 },
            details: "Heavy wrecker winching vehicle.",
            severity: "critical"
          }
        ]
      },
      {
        frameIndex: 3,
        timestamp: formatIso(45),
        relativeSecAgo: 45,
        simulatedSceneType: "traffic_heavy",
        detectedSubjects: [
          {
            id: "det-104-1d",
            subjectType: "vehicle_congestion",
            label: "Gridlock Condition",
            confidence: 0.97,
            boundingBox: { x: 15, y: 25, width: 70, height: 45 },
            details: "Stop and go queue.",
            severity: "high"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-108",
    camNumber: 108,
    name: "I-15 at Flamingo Rd (Exit 38)",
    corridor: "I-15",
    mileMarker: "MP 38.2",
    direction: "SB",
    coordinates: { lat: 36.115, lng: -115.1785 },
    neighborhood: "Paradise, UNLV & The Strip",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/108",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 24,
    congestionLevel: "heavy",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "traffic_heavy",
        detectedSubjects: [
          {
            id: "det-108-1",
            subjectType: "vehicle_congestion",
            label: "Heavy Traffic Congestion",
            confidence: 0.93,
            boundingBox: { x: 18, y: 30, width: 64, height: 40 },
            details: "Corridor queue due to downstream Tropicana incident.",
            severity: "medium"
          }
        ]
      },
      {
        frameIndex: 1,
        timestamp: formatIso(15),
        relativeSecAgo: 15,
        simulatedSceneType: "traffic_heavy",
        detectedSubjects: [
          {
            id: "det-108-1b",
            subjectType: "vehicle_congestion",
            label: "Heavy Traffic Slowdown",
            confidence: 0.91,
            boundingBox: { x: 19, y: 31, width: 62, height: 39 },
            details: "Average corridor velocity 22 mph.",
            severity: "medium"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-220",
    camNumber: 220,
    name: "US-95 at Summerlin Pkwy (Exit 81A)",
    corridor: "US-95",
    mileMarker: "MP 81.1",
    direction: "WB",
    coordinates: { lat: 36.198, lng: -115.241 },
    neighborhood: "Summerlin North & Trails",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/220",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 62,
    congestionLevel: "clear",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "traffic_freeflow",
        detectedSubjects: [
          {
            id: "det-220-1",
            subjectType: "wildlife_pet",
            label: "Canine / Wildlife on Embankment",
            confidence: 0.88,
            boundingBox: { x: 78, y: 62, width: 14, height: 18 },
            details: "Coyote or stray dog moving along the concrete drainage culvert near guardrail.",
            severity: "medium"
          }
        ]
      },
      {
        frameIndex: 1,
        timestamp: formatIso(15),
        relativeSecAgo: 15,
        simulatedSceneType: "traffic_freeflow",
        detectedSubjects: [
          {
            id: "det-220-1b",
            subjectType: "wildlife_pet",
            label: "Wildlife Embankment Traversal",
            confidence: 0.89,
            boundingBox: { x: 80, y: 60, width: 13, height: 17 },
            details: "Subject moved 15 feet west into desert scrub.",
            severity: "low"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-312",
    camNumber: 312,
    name: "CC-215 Beltway at Town Center Dr",
    corridor: "CC-215",
    mileMarker: "MP 21.4",
    direction: "WB",
    coordinates: { lat: 36.142, lng: -115.311 },
    neighborhood: "Summerlin South & The Ridges",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/312",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 58,
    congestionLevel: "clear",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "road_hazard",
        detectedSubjects: [
          {
            id: "det-312-1",
            subjectType: "road_hazard",
            label: "NDOT Construction Barrels & Arrow Board",
            confidence: 0.95,
            boundingBox: { x: 68, y: 44, width: 22, height: 28 },
            details: "Right auxiliary lane closed for soundwall maintenance.",
            severity: "low"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-401",
    camNumber: 401,
    name: "Las Vegas Blvd at Fremont St (Downtown)",
    corridor: "Downtown",
    direction: "ALL",
    coordinates: { lat: 36.17, lng: -115.141 },
    neighborhood: "Fremont & Downtown Historic",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/401",
    lastUpdated: "Just now",
    fps: 0.25,
    trafficFlowSpeedMph: 22,
    congestionLevel: "moderate",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "pedestrian_cross",
        detectedSubjects: [
          {
            id: "det-401-1",
            subjectType: "pedestrian",
            label: "Pedestrians Outside Crosswalk",
            confidence: 0.91,
            boundingBox: { x: 36, y: 52, width: 16, height: 26 },
            details: "3 pedestrians mid-block near Fremont East entrance.",
            severity: "medium"
          }
        ]
      },
      {
        frameIndex: 1,
        timestamp: formatIso(10),
        relativeSecAgo: 10,
        simulatedSceneType: "pedestrian_cross",
        detectedSubjects: [
          {
            id: "det-401-1b",
            subjectType: "pedestrian",
            label: "Pedestrians on Sidewalk",
            confidence: 0.93,
            boundingBox: { x: 28, y: 55, width: 18, height: 28 },
            details: "Group reached the north sidewalk curb safely.",
            severity: "low"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-410",
    camNumber: 410,
    name: "Las Vegas Blvd at Tropicana Ave (The Strip)",
    corridor: "The Strip",
    direction: "ALL",
    coordinates: { lat: 36.101, lng: -115.1725 },
    neighborhood: "Paradise, UNLV & The Strip",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/410",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 16,
    congestionLevel: "heavy",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "traffic_heavy",
        detectedSubjects: [
          {
            id: "det-410-1",
            subjectType: "vehicle_congestion",
            label: "Taxi & Rideshare Congestion",
            confidence: 0.92,
            boundingBox: { x: 22, y: 38, width: 58, height: 36 },
            details: "Long queue for casino drop-off loop; RTC Deuce bus navigating.",
            severity: "medium"
          },
          {
            id: "det-410-2",
            subjectType: "pedestrian",
            label: "Heavy Pedestrian Volume (Bridge Escalators)",
            confidence: 0.89,
            boundingBox: { x: 74, y: 20, width: 22, height: 42 },
            details: "High pedestrian density on overhead pedestrian walkways.",
            severity: "low"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-214",
    camNumber: 214,
    name: "US-95 at Charleston Blvd (Exit 72)",
    corridor: "US-95",
    mileMarker: "MP 72.4",
    direction: "SB",
    coordinates: { lat: 36.159, lng: -115.195 },
    neighborhood: "Downtown Arts District (18b)",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/214",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 45,
    congestionLevel: "moderate",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "stalled_vehicle",
        detectedSubjects: [
          {
            id: "det-214-1",
            subjectType: "stalled_vehicle",
            label: "Disabled Passenger Sedan on Right Shoulder",
            confidence: 0.94,
            boundingBox: { x: 72, y: 52, width: 22, height: 25 },
            details: "White sedan with hazard lights activated. Driver standing behind barrier.",
            severity: "medium"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-345",
    camNumber: 345,
    name: "CC-215 at Green Valley Pkwy",
    corridor: "CC-215",
    mileMarker: "MP 7.8",
    direction: "EB",
    coordinates: { lat: 36.027, lng: -115.0805 },
    neighborhood: "Green Valley Ranch & District",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/345",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 68,
    congestionLevel: "clear",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "traffic_freeflow",
        detectedSubjects: [
          {
            id: "det-345-1",
            subjectType: "weather_visibility",
            label: "Clear Mountain Visibility (68 mph Free Flow)",
            confidence: 0.97,
            boundingBox: { x: 5, y: 5, width: 90, height: 50 },
            details: "Optimal driving conditions along Henderson corridor.",
            severity: "low"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-508",
    camNumber: 508,
    name: "Spring Mountain Rd & Rainbow Blvd",
    corridor: "Arterials",
    direction: "ALL",
    coordinates: { lat: 36.126, lng: -115.242 },
    neighborhood: "Spring Valley & Chinatown",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/508",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 31,
    congestionLevel: "moderate",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "road_hazard",
        detectedSubjects: [
          {
            id: "det-508-1",
            subjectType: "road_hazard",
            label: "Left-Turn Lane Spill / Water pooling",
            confidence: 0.86,
            boundingBox: { x: 42, y: 58, width: 24, height: 20 },
            details: "Irrigation runoff pooling across turn pocket near commercial strip.",
            severity: "low"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-602",
    camNumber: 602,
    name: "Blue Diamond Rd & Buffalo Dr",
    corridor: "Arterials",
    direction: "WB",
    coordinates: { lat: 36.015, lng: -115.241 },
    neighborhood: "Mountain's Edge & Enterprise",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/602",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 48,
    congestionLevel: "clear",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "traffic_freeflow",
        detectedSubjects: []
      }
    ]
  },
  {
    id: "fast-cam-705",
    camNumber: 705,
    name: "Craig Rd & Simmons St (North Las Vegas)",
    corridor: "Arterials",
    direction: "EB",
    coordinates: { lat: 36.241, lng: -115.176 },
    neighborhood: "Aliante & Craig Ranch",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/705",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 28,
    congestionLevel: "moderate",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "stalled_vehicle",
        detectedSubjects: [
          {
            id: "det-705-1",
            subjectType: "emergency_vehicle",
            label: "LVMPD North Command Unit on Shoulder",
            confidence: 0.95,
            boundingBox: { x: 12, y: 48, width: 22, height: 28 },
            details: "Officer conducting traffic stop / perimeter check near park entrance.",
            severity: "medium"
          }
        ]
      }
    ]
  },
  {
    id: "fast-cam-115",
    camNumber: 115,
    name: "I-15 at Sahara Ave (Exit 40)",
    corridor: "I-15",
    mileMarker: "MP 40.2",
    direction: "NB",
    coordinates: { lat: 36.144, lng: -115.165 },
    neighborhood: "Downtown & Urban Core",
    status: "online",
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/115",
    lastUpdated: "Just now",
    fps: 0.2,
    trafficFlowSpeedMph: 52,
    congestionLevel: "clear",
    frames: [
      {
        frameIndex: 0,
        timestamp: formatIso(0),
        relativeSecAgo: 0,
        simulatedSceneType: "traffic_freeflow",
        detectedSubjects: []
      }
    ]
  }
];

export const CCTV_CORRIDOR_ROUTES: CCTVCorridorRoute[] = [
  {
    id: "route-i15-central",
    name: "I-15 Strip Corridor (Tropicana to Sahara)",
    corridor: "I-15",
    direction: "NB",
    description: "Main resort corridor carrying transit between South Strip, Arena district, and Sahara.",
    cameraIds: ["fast-cam-104", "fast-cam-108", "fast-cam-105", "fast-cam-106", "fast-cam-115"],
    activeIncidentsCount: 3
  },
  {
    id: "route-i15-bowl",
    name: "I-15 Spaghetti Bowl & Downtown Gateway",
    corridor: "I-15",
    direction: "NB",
    description: "Crucial intersection interchange connecting I-15 to US-95 and Downtown Las Vegas.",
    cameraIds: ["fast-cam-101", "fast-cam-115"],
    activeIncidentsCount: 2
  },
  {
    id: "route-us95-summerlin",
    name: "US-95 Northwest Corridor to Summerlin",
    corridor: "US-95",
    direction: "WB",
    description: "High-speed western arterial linking Downtown to Summerlin Parkway and Centennial Hills.",
    cameraIds: ["fast-cam-220"],
    activeIncidentsCount: 1
  },
  {
    id: "route-cc215-west",
    name: "CC-215 Beltway West (Town Center to Red Rock)",
    corridor: "CC-215",
    direction: "WB",
    description: "Arterial orbital beltway connecting South Summerlin, Town Center, and Southwest communities.",
    cameraIds: ["fast-cam-312"],
    activeIncidentsCount: 1
  }
];

export const INITIAL_TARGETS_OF_INTEREST: TargetOfInterestLog[] = [
  {
    id: "toi-104-1",
    timestamp: formatIso(30),
    cameraId: "fast-cam-104",
    cameraNumber: 104,
    cameraName: "I-15 at Tropicana Ave (Exit 37)",
    corridor: "I-15",
    direction: "NB",
    subjectType: "stalled_vehicle",
    label: "Overturned Commercial Box Truck",
    confidence: 0.96,
    details: "Overturned truck blocking right lanes with active NHP traffic flare perimeter.",
    severity: "critical",
    frameIndex: 0,
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/104",
    routeKey: "I-15 Strip Corridor",
    notes: "Tow crane dispatched via NDOT FAST dispatch."
  },
  {
    id: "toi-101-1",
    timestamp: formatIso(120),
    cameraId: "fast-cam-101",
    cameraNumber: 101,
    cameraName: "I-15 at US-95 Interchange (Spaghetti Bowl)",
    corridor: "I-15",
    direction: "NB",
    subjectType: "road_hazard",
    label: "Construction Ladder & Metal Scrap Debris",
    confidence: 0.91,
    details: "Metal framing debris in center transition flyover lane creating sudden motorist lane shifts.",
    severity: "high",
    frameIndex: 0,
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/101",
    routeKey: "I-15 Spaghetti Bowl",
    notes: "Incident flagged for NDOT highway maintenance sweep."
  },
  {
    id: "toi-220-1",
    timestamp: formatIso(240),
    cameraId: "fast-cam-220",
    cameraNumber: 220,
    cameraName: "US-95 at Summerlin Pkwy (Exit 81A)",
    corridor: "US-95",
    direction: "WB",
    subjectType: "wildlife_pet",
    label: "Canine / Wildlife Embankment Hazard",
    confidence: 0.88,
    details: "Animal traversing concrete drainage gulley near westbound travel lanes.",
    severity: "medium",
    frameIndex: 0,
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/220",
    routeKey: "US-95 Northwest Corridor",
    notes: "Cross-referenced with Nextdoor Summerlin lost pet alert."
  },
  {
    id: "toi-312-1",
    timestamp: formatIso(360),
    cameraId: "fast-cam-312",
    cameraNumber: 312,
    cameraName: "CC-215 Beltway at Town Center Dr",
    corridor: "CC-215",
    direction: "WB",
    subjectType: "road_hazard",
    label: "Blown Commercial Semi-Truck Tread (Alligator)",
    confidence: 0.89,
    details: "Heavy retread tire rubber resting on shoulder-to-lane line.",
    severity: "medium",
    frameIndex: 0,
    sourceSite: "bugatti.nvfast.org",
    sourceUrl: "https://bugatti.nvfast.org/camera/312",
    routeKey: "CC-215 Beltway West",
    notes: "Maintenance ticket opened."
  }
];

