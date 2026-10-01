// Master registry of all public feeds, agencies, camera networks, and social platforms used across Vegas Pulse 702
export interface SourceRegistryItem {
  id: string;
  name: string;
  category: "cctv_network" | "social_community" | "public_safety" | "transit_agency" | "weather_seismic";
  description: string;
  officialUrl: string;
  endpointOrPortal: string;
  status: "active" | "live_feed" | "periodic_sync";
  iconType: "cctv" | "nextdoor" | "ring" | "reddit" | "x" | "facebook" | "citizen" | "radio" | "shield";
  accentColor: string;
  dataTypesProvided: string[];
  refreshRate: string;
  coverage: string;
  isOfficialAgency: boolean;
}

export const VEGAS_DATA_SOURCES: SourceRegistryItem[] = [
  {
    id: "nvfast-bugatti",
    name: "Nevada FAST (Freeway & Arterial System of Transportation)",
    category: "cctv_network",
    description: "Official real-time closed-circuit traffic cameras across Clark County, I-15 Strip corridor, US-95, CC-215, and major arterial intersections.",
    officialUrl: "https://bugatti.nvfast.org",
    endpointOrPortal: "https://bugatti.nvfast.org/camera",
    status: "live_feed",
    iconType: "cctv",
    accentColor: "#00f0ff",
    dataTypesProvided: ["Live Still Snapshots", "5-Second Animation Loops", "Speed MPH Telemetry", "Congestion Ratings", "Lane Block Alerts"],
    refreshRate: "3 - 5 seconds",
    coverage: "Entire Las Vegas Valley (I-15, US-95, CC-215, Strip, Airport)",
    isOfficialAgency: true
  },
  {
    id: "rtc-southern-nevada",
    name: "RTC of Southern Nevada (Regional Transportation Commission)",
    category: "transit_agency",
    description: "Regional transit alerts, active construction work zones, bus route delays, and traffic incident advisories.",
    officialUrl: "https://www.rtcsnv.com",
    endpointOrPortal: "https://www.rtcsnv.com/traffic-cams/",
    status: "active",
    iconType: "shield",
    accentColor: "#38bdf8",
    dataTypesProvided: ["Traffic Advisories", "Roadwork Closures", "Transit Detours", "Bus Rapid Transit Status"],
    refreshRate: "Real-time updates",
    coverage: "Clark County, Henderson, North Las Vegas, Downtown",
    isOfficialAgency: true
  },
  {
    id: "nhp-southern-command",
    name: "Nevada State Police Highway Patrol (NHP Southern Command)",
    category: "public_safety",
    description: "State trooper highway incident dispatches, freeway rollover investigations, and road closure announcements.",
    officialUrl: "https://nhp.nv.gov",
    endpointOrPortal: "https://nhp.nv.gov/Traffic_Incidents/",
    status: "active",
    iconType: "shield",
    accentColor: "#f59e0b",
    dataTypesProvided: ["Freeway Crash Reports", "BOLO Bulletins", "Extreme Weather Advisories", "Hazardous Material Alerts"],
    refreshRate: "Incident triggered",
    coverage: "I-15, US-95, I-215, SR-160 Pahrump Pass, I-11",
    isOfficialAgency: true
  },
  {
    id: "lvmpd-dispatch",
    name: "LVMPD (Las Vegas Metropolitan Police Department)",
    category: "public_safety",
    description: "Metropolitan crime incident logs, active area perimeters, community alerts, and neighborhood watch notifications.",
    officialUrl: "https://www.lvmpd.com",
    endpointOrPortal: "https://www.lvmpd.com/en-us/Pages/CommunityAlerts.aspx",
    status: "active",
    iconType: "shield",
    accentColor: "#ef4444",
    dataTypesProvided: ["Police Activity Dispatches", "Neighborhood Watch Alerts", "Prowler Reports", "Public Safety Warnings"],
    refreshRate: "Hourly / Active incidents",
    coverage: "Las Vegas City, Paradise, Spring Valley, Summerlin, Enterprise",
    isOfficialAgency: true
  },
  {
    id: "nextdoor-las-vegas",
    name: "Nextdoor Las Vegas Neighborhood Hubs",
    category: "social_community",
    description: "Hyper-local resident posts, missing pet broadcasts, verified neighbor safety alerts, contractor recommendations, and garage sales.",
    officialUrl: "https://nextdoor.com/city/las-vegas--nv/",
    endpointOrPortal: "https://nextdoor.com",
    status: "active",
    iconType: "nextdoor",
    accentColor: "#10b981",
    dataTypesProvided: ["Lost & Found Pets", "Coyote & Wildlife Sightings", "Plumber & Contractor Reviews", "HOA Announcements"],
    refreshRate: "Continuous community posts",
    coverage: "Over 80 verified Las Vegas & Henderson neighborhood zones",
    isOfficialAgency: false
  },
  {
    id: "neighbors-by-ring-vegas",
    name: "Neighbors by Ring (Las Vegas & Henderson Sector)",
    category: "social_community",
    description: "Community video shares from Ring and Blink smart doorbells capturing porch package thefts, suspicious vehicles, and midnight prowlers.",
    officialUrl: "https://ring.com/neighbors",
    endpointOrPortal: "https://ring.com/neighbors",
    status: "active",
    iconType: "ring",
    accentColor: "#0284c7",
    dataTypesProvided: ["Doorbell Motion Captures", "Package Theft Videos", "Suspicious Vehicle Descriptions", "Gunfire / Firework Audio"],
    refreshRate: "Immediate post broadcast",
    coverage: "Residential communities across 89138, 89117, 89146, 89052, 89178",
    isOfficialAgency: false
  },
  {
    id: "reddit-r-vegas",
    name: "Reddit Communities: r/vegas & r/VegasLocals",
    category: "social_community",
    description: "Grassroots Las Vegas local discussions, utility bill rate alerts, community watch parties, weather warnings, and local politics.",
    officialUrl: "https://www.reddit.com/r/vegas/",
    endpointOrPortal: "https://www.reddit.com/r/VegasLocals/",
    status: "active",
    iconType: "reddit",
    accentColor: "#ff4500",
    dataTypesProvided: ["NV Energy Utility Spikes", "Vegas Golden Knights Watch Parties", "Local Restaurant Trends", "Tenant & HOA Discussions"],
    refreshRate: "Real-time thread updates",
    coverage: "Greater Las Vegas Valley & Clark County residents",
    isOfficialAgency: false
  },
  {
    id: "x-vegas-alerts",
    name: "X (Twitter) Official Emergency Dispatches",
    category: "social_community",
    description: "Rapid micro-updates from @RTCSNV, @NevadaDOT, @LVMPD, @ClarkCountyNV, and @NWSVegas regarding live emergencies.",
    officialUrl: "https://x.com/rtcsnv",
    endpointOrPortal: "https://x.com/search?q=las+vegas+traffic+OR+accident",
    status: "active",
    iconType: "x",
    accentColor: "#ffffff",
    dataTypesProvided: ["Breaking Freeway Closures", "Flash Flood Warnings", "Flash Incident Advisories", "Severe Weather Warnings"],
    refreshRate: "Real-time breaking dispatches",
    coverage: "Clark County, Red Rock Canyon, Strip Resort Corridor",
    isOfficialAgency: false
  },
  {
    id: "facebook-vegas-community",
    name: "Facebook Community Groups & City Pages",
    category: "social_community",
    description: "First Friday Arts District bulletins, multi-family neighborhood garage sales, lost dog reunion groups, and community center events.",
    officialUrl: "https://www.facebook.com/search/groups/?q=las%20vegas%20community",
    endpointOrPortal: "https://www.facebook.com/groups/LasVegasArtsDistrict",
    status: "active",
    iconType: "facebook",
    accentColor: "#1877f2",
    dataTypesProvided: ["First Friday Block Party Schedules", "Neighborhood Yard Sales", "Pet Rescue Groups", "Community Cleanups"],
    refreshRate: "Daily updates",
    coverage: "Arts District (18b), Mountain's Edge, Anthem, Downtown",
    isOfficialAgency: false
  },
  {
    id: "citizen-vegas",
    name: "Citizen App 911 Scanner & Emergency Broadcasts",
    category: "public_safety",
    description: "Police radio 911 dispatch alerts, shot spotter detections, active fire department responses, and emergency perimeter maps.",
    officialUrl: "https://citizen.com",
    endpointOrPortal: "https://citizen.com/explore/las-vegas-nv",
    status: "active",
    iconType: "citizen",
    accentColor: "#f43f5e",
    dataTypesProvided: ["Police Radio Scanners", "Fire Department Responses", "Hazmat Calls", "Crowd-Sourced Video Feeds"],
    refreshRate: "Seconds after 911 dispatch",
    coverage: "Metro Las Vegas, North Las Vegas, Henderson",
    isOfficialAgency: false
  },
  {
    id: "lvvwd-water-district",
    name: "Las Vegas Valley Water District (LVVWD)",
    category: "public_safety",
    description: "Water main rupture notices, mandatory seasonal watering restrictions, emergency main repairs, and street flooding advisories.",
    officialUrl: "https://www.lvvwd.com",
    endpointOrPortal: "https://www.lvvwd.com/conservation/watering-schedule.html",
    status: "active",
    iconType: "shield",
    accentColor: "#0ea5e9",
    dataTypesProvided: ["Water Main Rupture Notices", "Street Flooding Alerts", "Watering Restrictions", "Repair Schedules"],
    refreshRate: "Service advisory triggered",
    coverage: "Entire Las Vegas Valley culinary water grid",
    isOfficialAgency: true
  },
  {
    id: "nv-energy-outages",
    name: "NV Energy Outage Center & Grid Status",
    category: "public_safety",
    description: "Live electrical power outages, transformer explosions, extreme summer peak-hour Flex Alerts, and restoration ETA tracking.",
    officialUrl: "https://www.nvenergy.com",
    endpointOrPortal: "https://www.nvenergy.com/outages-and-emergencies/view-or-report-outage",
    status: "active",
    iconType: "radio",
    accentColor: "#eab308",
    dataTypesProvided: ["Power Outage Maps", "Grid Stress Advisories", "Substation Fire Advisories", "Restoration ETAs"],
    refreshRate: "10-minute intervals",
    coverage: "Southern Nevada service territory",
    isOfficialAgency: true
  },
  {
    id: "google-people-api",
    name: "Google People API & Workspace OAuth",
    category: "social_community",
    description: "Official Google Workspace People API integrating real-time live location beacons, Google contacts, profile telemetry, and geocoded residential locations.",
    officialUrl: "https://developers.google.com/people",
    endpointOrPortal: "https://people.googleapis.com/v1/people/me/connections",
    status: "live_feed",
    iconType: "shield",
    accentColor: "#6366f1",
    dataTypesProvided: ["User Contacts", "Live GPS Presence Beacons", "Physical Addresses", "Battery & Speed Telemetry"],
    refreshRate: "Real-time & On-demand Sync",
    coverage: "Authenticated User Contact Network (Las Vegas Valley & Global)",
    isOfficialAgency: false
  }
];
