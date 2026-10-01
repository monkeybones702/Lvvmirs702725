import { LasVegasNeighborhood, SocialPost, UserLocationSettings } from "../types";

export const LAS_VEGAS_NEIGHBORHOODS: LasVegasNeighborhood[] = [
  {
    id: "summerlin-west",
    name: "Summerlin West",
    area: "West Valley",
    coordinates: { lat: 36.1867, lng: -115.328 },
    zipCode: "89138",
    description: "Far west Master-planned community near Red Rock Canyon scenic loop and Far Hills Ave."
  },
  {
    id: "summerlin-north",
    name: "Summerlin North & Trails",
    area: "West Valley",
    coordinates: { lat: 36.195, lng: -115.295 },
    zipCode: "89134",
    description: "Pueblo, Hills, and Trails villages along Summerlin Parkway and Town Center Dr."
  },
  {
    id: "summerlin-south",
    name: "Summerlin South & The Ridges",
    area: "West Valley",
    coordinates: { lat: 36.136, lng: -115.312 },
    zipCode: "89135",
    description: "Downtown Summerlin, Red Rock Casino, The Ridges, and Mesa Park."
  },
  {
    id: "downtown-arts-district",
    name: "Downtown Arts District (18b)",
    area: "Downtown & Urban Core",
    coordinates: { lat: 36.1565, lng: -115.152 },
    zipCode: "89104",
    description: "Charleston Blvd, Main St, Casino Center, First Friday galleries, local cafes."
  },
  {
    id: "fremont-downtown",
    name: "Fremont & Downtown Historic",
    area: "Downtown & Urban Core",
    coordinates: { lat: 36.1699, lng: -115.1398 },
    zipCode: "89101",
    description: "Fremont East, Container Park, Huntridge, and Clark County Government center."
  },
  {
    id: "peccole-the-lakes",
    name: "Peccole Ranch & The Lakes",
    area: "West Central",
    coordinates: { lat: 36.148, lng: -115.286 },
    zipCode: "89117",
    description: "Lake Sahara, Fort Apache Rd, Desert Inn Rd greenbelts and paseos."
  },
  {
    id: "spring-valley-chinatown",
    name: "Spring Valley & Chinatown",
    area: "Southwest / Central",
    coordinates: { lat: 36.125, lng: -115.2421 },
    zipCode: "89146",
    description: "Spring Mountain Rd, Rainbow Blvd, Flamingo Rd, and Desert Breeze Park."
  },
  {
    id: "enterprise-mountains-edge",
    name: "Mountain's Edge & Enterprise",
    area: "Southwest Valley",
    coordinates: { lat: 36.015, lng: -115.241 },
    zipCode: "89178",
    description: "Blue Diamond Rd, Buffalo Dr, Exploration Peak Park, Southern Highlands border."
  },
  {
    id: "henderson-green-valley",
    name: "Green Valley Ranch & District",
    area: "Henderson",
    coordinates: { lat: 36.027, lng: -115.0805 },
    zipCode: "89052",
    description: "Paseo Verde, The District, Dollar Loan Center, Green Valley Pkwy."
  },
  {
    id: "henderson-anthem-seven-hills",
    name: "Anthem & Seven Hills",
    area: "Henderson",
    coordinates: { lat: 35.975, lng: -115.105 },
    zipCode: "89044",
    description: "Anthem Highlands, Inspirada, Sun City Anthem, St. Rose Pkwy corridor."
  },
  {
    id: "paradise-strip-unlv",
    name: "Paradise, UNLV & The Strip",
    area: "Central & Resort Corridor",
    coordinates: { lat: 36.1147, lng: -115.1728 },
    zipCode: "89119",
    description: "Maryland Pkwy, Tropicana Ave, UNLV campus, Las Vegas Blvd corridor."
  },
  {
    id: "centennial-hills-skye-canyon",
    name: "Centennial Hills & Skye Canyon",
    area: "Northwest Valley",
    coordinates: { lat: 36.2862, lng: -115.2634 },
    zipCode: "89149",
    description: "US-95 & 215 junction, Skye Canyon Park, Durango Dr, Tule Springs."
  },
  {
    id: "north-las-vegas-aliante",
    name: "Aliante & Craig Ranch",
    area: "North Las Vegas",
    coordinates: { lat: 36.27, lng: -115.18 },
    zipCode: "89084",
    description: "Craig Ranch Regional Park, Aliante Pkwy, Simmons St, Centennial Pkwy."
  },
  {
    id: "sunrise-manor-east-vegas",
    name: "Sunrise Manor & East Las Vegas",
    area: "East Valley",
    coordinates: { lat: 36.175, lng: -115.07 },
    zipCode: "89110",
    description: "Hollywood Blvd, Frenchman Mountain trails, Nellis AFB border, Lake Mead Blvd."
  }
];

export const DEFAULT_USER_LOCATION: UserLocationSettings = {
  name: "Summerlin West (Far Hills & 215)",
  coordinates: { lat: 36.1867, lng: -115.328 },
  radiusMiles: 10,
  isLiveGps: false,
  zipCode: "89138",
  selectedNeighborhoodId: "summerlin-west"
};

export const POPULAR_KEYWORDS: string[] = [
  "lost dog",
  "coyote sighting",
  "package theft",
  "car break-in",
  "NV Energy power outage",
  "Tropicana closure",
  "I-15 traffic accident",
  "First Friday",
  "yard sale",
  "plumber recommendation",
  "Golden Knights",
  "suspicious vehicle",
  "water leak",
  "fireworks noise"
];

// Reference timestamp generator to provide realistic relative timestamps
const nowMs = Date.now();
const minutesAgo = (mins: number) => new Date(nowMs - mins * 60 * 1000).toISOString();
const hoursAgo = (hrs: number) => new Date(nowMs - hrs * 3600 * 1000).toISOString();
const daysAgo = (days: number) => new Date(nowMs - days * 86400 * 1000).toISOString();

export const INITIAL_POSTS: SocialPost[] = [
  {
    id: "post-lv-101",
    platform: "Nextdoor",
    category: "lost_pets",
    urgency: "urgent",
    title: "LOST DOG: Friendly Husky mix escaped backyard near Fox Hill Park",
    content: "Our 3-year-old grey and white Siberian Husky mix named 'Ghost' slipped out through the side gate around 11:30 AM near Fox Hill Park and Antelope Ridge Dr. He is microchipped and wearing a turquoise collar with phone tags. Very friendly, loves treats. Please message or call if spotted!",
    author: {
      name: "Danielle Vance",
      neighborhood: "Summerlin West",
      isVerifiedNeighbor: true,
      badge: "Verified Resident (Fox Hill)"
    },
    neighborhood: "Summerlin West",
    coordinates: { lat: 36.1882, lng: -115.331 },
    addressSnippet: "Antelope Ridge Dr & Fox Hill Park, Las Vegas NV 89138",
    timestamp: minutesAgo(42),
    keywords: ["lost dog", "husky", "fox hill park", "summerlin", "pet"],
    engagement: {
      upvotes: 38,
      commentsCount: 14,
      shares: 9,
      helpfulVotes: 21
    },
    incidentVerified: true,
    comments: [
      {
        id: "c-101-1",
        author: "Marcus Brody",
        neighborhood: "Summerlin West",
        text: "Saw a dog matching this description running south toward Paseos trail about 20 mins ago! Alerted my kids to keep a lookout.",
        timestamp: minutesAgo(25),
        isVerifiedNeighbor: true
      },
      {
        id: "c-101-2",
        author: "Elena Rostova",
        neighborhood: "Summerlin North",
        text: "Sharing to the Red Rock Pets Facebook group right now!",
        timestamp: minutesAgo(12),
        isVerifiedNeighbor: true
      }
    ]
  },
  {
    id: "post-lv-102",
    platform: "Neighbors",
    category: "safety",
    urgency: "elevated",
    title: "Ring Camera Alert: Two individuals checking car door handles at 3:15 AM",
    content: "Doorbell footage captured two people in dark hoodies and face masks walking down Paseo Vista Dr systematically testing door handles on three parked trucks and SUVs. One vehicle was unlocked and rummaged through. LVMPD report filed (#26-0920-0418). Please double check your car locks and remove garage door openers!",
    author: {
      name: "Greg Thornton",
      neighborhood: "Peccole Ranch & The Lakes",
      isVerifiedNeighbor: true,
      badge: "Neighborhood Watch Lead"
    },
    neighborhood: "Peccole Ranch & The Lakes",
    coordinates: { lat: 36.147, lng: -115.285 },
    addressSnippet: "Paseo Vista Dr & Lake Sahara Dr, Las Vegas NV 89117",
    timestamp: hoursAgo(4),
    keywords: ["car break-in", "package theft", "suspicious vehicle", "peccole ranch", "police report"],
    engagement: {
      upvotes: 62,
      commentsCount: 28,
      shares: 19,
      helpfulVotes: 44
    },
    incidentVerified: true,
    comments: [
      {
        id: "c-102-1",
        author: "Sarah K.",
        neighborhood: "The Lakes",
        text: "They hit our cul-de-sac too off Crystal Water Dr. Got footage of a dark silver Nissan Altima with paper plates waiting down the street.",
        timestamp: hoursAgo(3),
        isVerifiedNeighbor: true
      }
    ]
  },
  {
    id: "post-lv-103",
    platform: "X",
    category: "traffic",
    urgency: "urgent",
    title: "TRAFFIC ADVISORY: Multi-vehicle crash on I-15 Northbound near Tropicana Ave",
    content: "RTC Alert / NHP: Major traffic backup on I-15 Northbound between Russell Rd and Tropicana Ave due to overturned box truck. 3 right lanes blocked. Delays of 40+ minutes reaching past 215 Beltway interchange. Seek alternate routes via Decatur Blvd or Frank Sinatra Dr.",
    author: {
      name: "RTCSNV Traffic Pulse",
      handle: "@RTCSNV_Alerts",
      neighborhood: "Paradise, UNLV & The Strip",
      isVerifiedNeighbor: false,
      badge: "Official Agency Account"
    },
    neighborhood: "Paradise, UNLV & The Strip",
    coordinates: { lat: 36.1015, lng: -115.178 },
    addressSnippet: "I-15 NB at Tropicana Ave Interchange",
    timestamp: minutesAgo(85),
    keywords: ["I-15 traffic accident", "tropicana closure", "rtc traffic", "highway", "commute"],
    engagement: {
      upvotes: 145,
      commentsCount: 52,
      shares: 88
    },
    incidentVerified: true
  },
  {
    id: "post-lv-104",
    platform: "Nextdoor",
    category: "safety",
    urgency: "elevated",
    title: "Coyote pack spotted along Cottonwood Canyon trail near Paseos park",
    content: "Heads up pet owners: Was walking my golden retriever this morning around 6:45 AM and spotted a pack of 3 healthy coyotes crossing the flood wash into the park grass near the children's play area. They did not seem scared by shouting. Please keep dogs on short 6ft leashes and watch small dogs closely in backyards.",
    author: {
      name: "Brian Mitchell",
      neighborhood: "Summerlin West",
      isVerifiedNeighbor: true,
      badge: "Trail Committee Member"
    },
    neighborhood: "Summerlin West",
    coordinates: { lat: 36.182, lng: -115.324 },
    addressSnippet: "Paseos Park & Desert Sunrise St, Las Vegas NV 89138",
    timestamp: hoursAgo(6),
    keywords: ["coyote sighting", "cottonwood canyon", "pet safety", "summerlin", "trail"],
    engagement: {
      upvotes: 74,
      commentsCount: 31,
      shares: 15,
      helpfulVotes: 58
    }
  },
  {
    id: "post-lv-105",
    platform: "Reddit",
    category: "general",
    urgency: "normal",
    title: "r/vegas: NV Energy high bill spikes and peak hour rate adjustments this month?",
    content: "Has anyone in Green Valley or Summerlin noticed a 20-25% jump in their power bills compared to this time last year despite keeping the thermostat at 78? Checking our smart meter intervals on the app and peak pricing hours seem to be kicking in harder. Any HVAC recommendations for duct sealing before the high heat returns?",
    author: {
      name: "u/DesertVegasRunner",
      handle: "r/vegas",
      neighborhood: "Green Valley Ranch & District",
      isVerifiedNeighbor: false,
      badge: "Top Contributor (r/vegas)"
    },
    neighborhood: "Green Valley Ranch & District",
    coordinates: { lat: 36.029, lng: -115.082 },
    addressSnippet: "Green Valley Pkwy & Paseo Verde, Henderson NV 89052",
    timestamp: hoursAgo(10),
    keywords: ["NV Energy power outage", "power bill", "hvac", "green valley", "summer electricity"],
    engagement: {
      upvotes: 189,
      commentsCount: 94,
      shares: 12
    }
  },
  {
    id: "post-lv-106",
    platform: "Facebook",
    category: "events",
    urgency: "normal",
    title: "Downtown Arts District: First Friday Block Party & Street Closures Map",
    content: "First Friday is back tonight in the 18b Arts District! Over 70 local artists, food trucks along Casino Center, live bands on the Charleston main stage. Casino Center Blvd will be closed between California Ave and Colorado Ave starting at 3 PM. Free parking available at the City Hall garage with shuttle running every 15 mins.",
    author: {
      name: "Arts District Neighborhood Alliance",
      handle: "Las Vegas Arts District FB",
      neighborhood: "Downtown Arts District (18b)",
      isVerifiedNeighbor: true,
      badge: "Community Organizer"
    },
    neighborhood: "Downtown Arts District (18b)",
    coordinates: { lat: 36.155, lng: -115.153 },
    addressSnippet: "1025 S 1st St, Arts District, Las Vegas NV 89104",
    timestamp: hoursAgo(14),
    keywords: ["First Friday", "downtown arts district", "street closure", "events", "food trucks"],
    engagement: {
      upvotes: 210,
      commentsCount: 43,
      shares: 67
    }
  },
  {
    id: "post-lv-107",
    platform: "Nextdoor",
    category: "recommendations",
    urgency: "normal",
    title: "Outstanding local plumber recommendation for main water line replacement",
    content: "Our copper main supply line developed a slab leak under the front courtyard lawn on Tuesday. We called 3 places and Silver State Plumbing (family-owned out of Henderson) showed up within 90 minutes, gave a fair transparent estimate, and had the trenchless pull completed by Wednesday afternoon without tearing up our desert landscaping. Highly recommend Mike and his crew!",
    author: {
      name: "Patricia Connelly",
      neighborhood: "Anthem & Seven Hills",
      isVerifiedNeighbor: true,
      badge: "Resident 12 Years"
    },
    neighborhood: "Anthem & Seven Hills",
    coordinates: { lat: 35.981, lng: -115.101 },
    addressSnippet: "Anthem Highlands & Bicentennial Pkwy, Henderson NV 89044",
    timestamp: daysAgo(1),
    keywords: ["plumber recommendation", "water leak", "contractor", "anthem", "henderson home"],
    engagement: {
      upvotes: 49,
      commentsCount: 16,
      shares: 4,
      helpfulVotes: 35
    }
  },
  {
    id: "post-lv-108",
    platform: "Citizen",
    category: "safety",
    urgency: "urgent",
    title: "POLICE ACTIVITY: 911 Report of shots heard near Craig Ranch Regional Park",
    content: "LVMPD North Command officers on scene investigating multiple reports of fireworks vs possible gunfire heard near the skate park section of Craig Ranch. Perimeter established along Lone Mountain Rd and Simmons St. No reported injuries at this time. Officers reviewing park security camera footage.",
    author: {
      name: "Citizen Incident Desk",
      neighborhood: "Aliante & Craig Ranch",
      isVerifiedNeighbor: false,
      badge: "Verified Police Dispatch"
    },
    neighborhood: "Aliante & Craig Ranch",
    coordinates: { lat: 36.241, lng: -115.176 },
    addressSnippet: "628 W Craig Rd, North Las Vegas NV 89032",
    timestamp: hoursAgo(2),
    keywords: ["police activity", "shots heard", "fireworks noise", "craig ranch", "north las vegas"],
    engagement: {
      upvotes: 118,
      commentsCount: 47,
      shares: 32
    },
    incidentVerified: true
  },
  {
    id: "post-lv-109",
    platform: "Nextdoor",
    category: "traffic",
    urgency: "elevated",
    title: "Water main break causing major flooding on West Charleston near Hualapai",
    content: "Las Vegas Valley Water District has West Charleston Blvd down to 1 lane heading East near Hualapai Way due to an 8-inch main failure. Water is pooling across two lanes. LVVWD crews are on scene excavating. Avoid Charleston eastbound this morning—use Desert Inn or Summerlin Parkway instead.",
    author: {
      name: "Tom Henderson",
      neighborhood: "Summerlin North & Trails",
      isVerifiedNeighbor: true,
      badge: "Summerlin Resident"
    },
    neighborhood: "Summerlin North & Trails",
    coordinates: { lat: 36.161, lng: -115.313 },
    addressSnippet: "W Charleston Blvd & S Hualapai Way, Las Vegas NV 89117",
    timestamp: hoursAgo(3),
    keywords: ["water leak", "traffic delay", "charleston blvd", "lvvwd", "summerlin roadwork"],
    engagement: {
      upvotes: 88,
      commentsCount: 22,
      shares: 31,
      helpfulVotes: 61
    }
  },
  {
    id: "post-lv-110",
    platform: "Facebook",
    category: "for_sale",
    urgency: "normal",
    title: "Multi-Family Neighborhood Garage & Yard Sale this Saturday 7 AM - 1 PM!",
    content: "5 homes participating in the cul-de-sac off Exploration Peak! Tools, baby gear, camping equipment, golf clubs (Callaway/TaylorMade), patio furniture, Golden Knights memorabilia, board games, and potted desert succulents. Everything priced to sell. Cash, Venmo, and Zelle accepted.",
    author: {
      name: "Jessica Morales",
      neighborhood: "Mountain's Edge & Enterprise",
      isVerifiedNeighbor: true,
      badge: "HOA Event Volunteer"
    },
    neighborhood: "Mountain's Edge & Enterprise",
    coordinates: { lat: 36.009, lng: -115.244 },
    addressSnippet: "Exploration Peak Park Cul-de-sac, Blue Diamond Rd, Las Vegas NV 89178",
    timestamp: daysAgo(2),
    keywords: ["yard sale", "garage sale", "mountains edge", "furniture", "golden knights"],
    engagement: {
      upvotes: 35,
      commentsCount: 9,
      shares: 11
    }
  },
  {
    id: "post-lv-111",
    platform: "Reddit",
    category: "events",
    urgency: "normal",
    title: "r/VegasLocals: Vegas Golden Knights official watch party on Water Street Henderson",
    content: "City of Henderson hosting official VGK watch party at the Water Street Plaza amphitheater! Huge outdoor LED screens, food trucks, mascot Chance appearance, and street hockey clinics for kids. Gates open at 5 PM, puck drop at 7 PM. Bring lawn chairs and blankets. Free admission.",
    author: {
      name: "u/VGK_PuckHound",
      handle: "r/VegasLocals",
      neighborhood: "Anthem & Seven Hills",
      isVerifiedNeighbor: false,
      badge: "Henderson Local"
    },
    neighborhood: "Anthem & Seven Hills",
    coordinates: { lat: 36.033, lng: -114.985 },
    addressSnippet: "240 S Water St, Henderson NV 89015",
    timestamp: daysAgo(1),
    keywords: ["Golden Knights", "water street", "henderson", "watch party", "events"],
    engagement: {
      upvotes: 240,
      commentsCount: 38,
      shares: 44
    }
  },
  {
    id: "post-lv-112",
    platform: "Nextdoor",
    category: "safety",
    urgency: "normal",
    title: "Suspicious vehicle idling in front of mailbox cluster on Grand Teton",
    content: "For the second night in a row, a dark green early-2000s Chevy Tahoe with tinted windows was parked next to our community cluster mailboxes between 1:30 AM and 2:15 AM with lights off. When a neighbor walked their dog with a flashlight, they drove off quickly toward Durango. Please keep an eye out and report any pry marks on the parcel lockers to US Postal Inspection.",
    author: {
      name: "Kenneth Miller",
      neighborhood: "Centennial Hills & Skye Canyon",
      isVerifiedNeighbor: true,
      badge: "Block Captain"
    },
    neighborhood: "Centennial Hills & Skye Canyon",
    coordinates: { lat: 36.291, lng: -115.265 },
    addressSnippet: "W Grand Teton Dr & N Durango Dr, Las Vegas NV 89149",
    timestamp: daysAgo(1),
    keywords: ["suspicious vehicle", "mailbox theft", "centennial hills", "usps", "safety"],
    engagement: {
      upvotes: 56,
      commentsCount: 19,
      shares: 14,
      helpfulVotes: 40
    }
  },
  {
    id: "post-lv-113",
    platform: "Neighbors",
    category: "safety",
    urgency: "urgent",
    title: "Porch Pirate video: Woman in red sedan taking FedEx packages on Desert Breeze",
    content: "Delivered package stolen from front doorstep at 2:40 PM within 12 minutes of drop-off. Video shows female suspect wearing dark sunglasses and beige baseball cap getting out of passenger side of red Honda Civic (partial plate NV #78B...). Police dispatch notified. If anyone on Desert Breeze or Spring Mountain has camera angles of the plate, please DM!",
    author: {
      name: "Arthur Chen",
      neighborhood: "Spring Valley & Chinatown",
      isVerifiedNeighbor: true,
      badge: "Verified Resident"
    },
    neighborhood: "Spring Valley & Chinatown",
    coordinates: { lat: 36.126, lng: -115.253 },
    addressSnippet: "Desert Breeze Park area, Spring Mountain Rd, Las Vegas NV 89146",
    timestamp: hoursAgo(5),
    keywords: ["package theft", "porch pirate", "spring valley", "chinatown", "ring camera"],
    engagement: {
      upvotes: 82,
      commentsCount: 26,
      shares: 20,
      helpfulVotes: 51
    },
    incidentVerified: true
  },
  {
    id: "post-lv-114",
    platform: "X",
    category: "traffic",
    urgency: "normal",
    title: "NDOT Project Neon / 215 Beltway lane restrictions this weekend near Flamingo",
    content: "Nevada DOT reminder: Nightly lane restrictions on 215 Beltway westbound between Flamingo Rd and Tropicana Ave starting 9 PM tonight for bridge deck rehabilitation. One travel lane maintained. Expect delays of 15-20 minutes. Commuters are urged to use Russell Rd or Sahara Ave as alternate east-west corridors.",
    author: {
      name: "Nevada DOT Southern",
      handle: "@NevadaDOT",
      neighborhood: "Spring Valley & Chinatown",
      isVerifiedNeighbor: false,
      badge: "State Agency"
    },
    neighborhood: "Spring Valley & Chinatown",
    coordinates: { lat: 36.115, lng: -115.295 },
    addressSnippet: "215 Beltway & W Flamingo Rd, Las Vegas NV",
    timestamp: daysAgo(2),
    keywords: ["tropicana closure", "215 beltway", "ndot roadwork", "traffic delay", "flamingo"],
    engagement: {
      upvotes: 93,
      commentsCount: 17,
      shares: 34
    }
  },
  {
    id: "post-lv-115",
    platform: "Nextdoor",
    category: "general",
    urgency: "normal",
    title: "Found set of Toyota car keys with gym fob at Red Rock Overlook trail",
    content: "Found a set of 3 keys with a black Toyota smart key fob and an EōS Fitness barcode tab on the bench at the Red Rock Canyon scenic overlook trail around 4 PM yesterday. Turned them in to the Red Rock Visitor Center front desk lost & found. Hope the owner finds them!",
    author: {
      name: "Karen Lindqvist",
      neighborhood: "Summerlin West",
      isVerifiedNeighbor: true,
      badge: "Summerlin Resident"
    },
    neighborhood: "Summerlin West",
    coordinates: { lat: 36.175, lng: -115.345 },
    addressSnippet: "Red Rock Canyon Scenic Loop Overlook, Las Vegas NV 89161",
    timestamp: daysAgo(1),
    keywords: ["lost keys", "red rock canyon", "summerlin", "found item", "hiking"],
    engagement: {
      upvotes: 42,
      commentsCount: 5,
      shares: 8,
      helpfulVotes: 29
    }
  }
];
