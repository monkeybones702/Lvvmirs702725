// 8-Directional 5-Mile Multi-Hop NV-FAST Camera Pursuit & Lay-Low Containment Engine
// Connects to Nevada FAST (bugatti.nvfast.org) intersection telemetry

export type CompassSector8 = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export interface DirectionalSectorInfo {
  sector: CompassSector8;
  label: string;
  minDegree: number;
  maxDegree: number;
  arrow: string;
  cardinalAngle: number;
}

export const COMPASS_SECTORS_8: DirectionalSectorInfo[] = [
  { sector: "N", label: "NORTH", minDegree: 337.5, maxDegree: 22.5, arrow: "↑", cardinalAngle: 0 },
  { sector: "NE", label: "NORTHEAST", minDegree: 22.5, maxDegree: 67.5, arrow: "↗", cardinalAngle: 45 },
  { sector: "E", label: "EAST", minDegree: 67.5, maxDegree: 112.5, arrow: "→", cardinalAngle: 90 },
  { sector: "SE", label: "SOUTHEAST", minDegree: 112.5, maxDegree: 157.5, arrow: "↘", cardinalAngle: 135 },
  { sector: "S", label: "SOUTH", minDegree: 157.5, maxDegree: 202.5, arrow: "↓", cardinalAngle: 180 },
  { sector: "SW", label: "SOUTHWEST", minDegree: 202.5, maxDegree: 247.5, arrow: "↙", cardinalAngle: 225 },
  { sector: "W", label: "WEST", minDegree: 247.5, maxDegree: 292.5, arrow: "←", cardinalAngle: 270 },
  { sector: "NW", label: "NORTHWEST", minDegree: 292.5, maxDegree: 337.5, arrow: "↖", cardinalAngle: 315 },
];

export function getBearingSector8(bearingDegrees: number): CompassSector8 {
  const norm = (bearingDegrees % 360 + 360) % 360;
  if (norm >= 337.5 || norm < 22.5) return "N";
  if (norm >= 22.5 && norm < 67.5) return "NE";
  if (norm >= 67.5 && norm < 112.5) return "E";
  if (norm >= 112.5 && norm < 157.5) return "SE";
  if (norm >= 157.5 && norm < 202.5) return "S";
  if (norm >= 202.5 && norm < 247.5) return "SW";
  if (norm >= 247.5 && norm < 292.5) return "W";
  return "NW";
}

export function calculateBearingDegrees(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const φ1 = toRad(from.lat);
  const φ2 = toRad(to.lat);
  const Δλ = toRad(to.lng - from.lng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (toDeg(θ) + 360) % 360;
}

export interface HistoricalSnapshotFrame {
  id: string;
  timestamp: string;
  minutesAgo: number;
  cameraNumber: number;
  intersection: string;
  isPositiveDetection: boolean;
  vehicleMatchScore: number; // 0 to 100%
  vehicleDetails?: {
    makeModel: string;
    color: string;
    plateNumber: string;
    speedMph: number;
    lane: string;
    travelVector: string;
    boundingPolygon: { x: number; y: number; w: number; h: number };
  };
  snapshotDescription: string;
  trafficDensity: "clear" | "moderate" | "heavy" | "gridlock";
}

export interface PursuitHopNode {
  hopNumber: number;
  cameraId: string;
  cameraNumber: number;
  cameraName: string;
  intersection: string;
  coordinates: { lat: number; lng: number };
  sector8: CompassSector8;
  bearingDeg: number;
  distanceFromOriginMiles: number;
  distanceFromLastHopMiles: number;
  timestamp: string;
  relativeMinutesAgo: number;
  speedMph: number;
  detectionConfidence: number; // e.g. 94.2
  turnActionTaken: string;
  frames: HistoricalSnapshotFrame[];
  sourceUrl: string;
}

export interface ContainmentZoneData {
  zoneName: string;
  sectorDescription: string;
  centerCoordinates: { lat: number; lng: number };
  radiusMiles: number;
  containmentProbability: number; // e.g. 93.5%
  status: "surrounded" | "laying_low" | "high_density_search" | "perimeter_locked";
  reasonsLayingLow: string[];
  recommendedSurveillancePosts: {
    label: string;
    intersection: string;
    coordinates: { lat: number; lng: number };
    action: string;
  }[];
  potentialStashStructures: string[];
}

export interface PursuitActiveCase {
  id: string;
  caseNumber: string;
  title: string;
  crimeType: string;
  agencyAssigned: string;
  incidentTime: string;
  originLocation: string;
  originCoordinates: { lat: number; lng: number };
  suspectDescription: string;
  suspectVehicle: {
    makeModel: string;
    color: string;
    yearRange: string;
    bodyStyle: string;
    plateNumber: string;
    plateNotes: string;
    distinctiveFeatures: string[];
    initialHeading: string;
  };
  hops: PursuitHopNode[];
  containmentZone: ContainmentZoneData;
  perimeterBoundaryCameras: {
    cameraId: string;
    cameraNumber: number;
    intersection: string;
    coordinates: { lat: number; lng: number };
    distanceMiles: number;
    scanResult: "NEGATIVE_CLEARED";
    lastScannedMinutesAgo: number;
  }[];
}

export const ACTIVE_PURSUIT_CASES: PursuitActiveCase[] = [
  {
    id: "case-sv-113",
    caseNumber: "LVMPD-26-0922-4418",
    title: "Porch Pirate FedEx Package Theft & High-Speed Egress",
    crimeType: "Felony Grand Larceny / Fleeing Suspect",
    agencyAssigned: "LVMPD Spring Valley Area Command & FAST Traffic Intelligence",
    incidentTime: "45 mins ago (20:40 PDT)",
    originLocation: "Desert Breeze Park (Spring Mountain Rd & Durango Dr)",
    originCoordinates: { lat: 36.126, lng: -115.253 },
    suspectDescription: "Female suspect wearing beige cap and dark sunglasses; male getaway driver in dark hoodie.",
    suspectVehicle: {
      makeModel: "Honda Civic Sedan",
      color: "Crimson Red",
      yearRange: "2018-2021",
      bodyStyle: "4-Door Compact Sedan",
      plateNumber: "NV #78B-492 (Partial Match)",
      plateNotes: "Rear license plate bracket tinted; front plate missing.",
      distinctiveFeatures: [
        "Black aftermarket driver-side rear rim",
        "Dented lower rocker panel on passenger side",
        "Dark limo tint on rear and quarter windows",
        "FedEx shipping box visible on rear parcel shelf"
      ],
      initialHeading: "Eastbound on Spring Mountain Rd accelerating from Desert Breeze Park"
    },
    hops: [
      {
        hopNumber: 1,
        cameraId: "fast-cam-508",
        cameraNumber: 508,
        cameraName: "Spring Mountain Rd & Rainbow Blvd",
        intersection: "W Spring Mountain Rd & S Rainbow Blvd",
        coordinates: { lat: 36.126, lng: -115.242 },
        sector8: "E",
        bearingDeg: 90,
        distanceFromOriginMiles: 0.62,
        distanceFromLastHopMiles: 0.62,
        timestamp: "38 mins ago",
        relativeMinutesAgo: 38,
        speedMph: 39,
        detectionConfidence: 94.6,
        turnActionTaken: "Crossed intersection eastbound at high velocity, executed aggressive right lane shift",
        sourceUrl: "https://bugatti.nvfast.org/camera/508",
        frames: [
          {
            id: "snap-508-t38",
            timestamp: "20:46:12 PDT",
            minutesAgo: 38,
            cameraNumber: 508,
            intersection: "Spring Mountain & Rainbow",
            isPositiveDetection: true,
            vehicleMatchScore: 94.6,
            snapshotDescription: "FAST cam snapshot captures crimson Honda Civic eastbound in center travel lane #2. High optical confidence match on tinted rear glass and black passenger rim.",
            trafficDensity: "moderate",
            vehicleDetails: {
              makeModel: "Honda Civic (Red)",
              color: "Crimson Red",
              plateNumber: "NV #78B-492",
              speedMph: 39,
              lane: "Lane #2 Eastbound",
              travelVector: "Heading East, braking toward Rainbow turn pocket",
              boundingPolygon: { x: 38, y: 44, w: 22, h: 26 }
            }
          }
        ]
      },
      {
        hopNumber: 2,
        cameraId: "fast-cam-512",
        cameraNumber: 512,
        cameraName: "Rainbow Blvd & Flamingo Rd",
        intersection: "S Rainbow Blvd & W Flamingo Rd",
        coordinates: { lat: 36.115, lng: -115.242 },
        sector8: "SE",
        bearingDeg: 148,
        distanceFromOriginMiles: 1.15,
        distanceFromLastHopMiles: 0.76,
        timestamp: "31 mins ago",
        relativeMinutesAgo: 31,
        speedMph: 36,
        detectionConfidence: 92.1,
        turnActionTaken: "Turned South onto S Rainbow Blvd following traffic wave through Flamingo Rd",
        sourceUrl: "https://bugatti.nvfast.org/camera/512",
        frames: [
          {
            id: "snap-512-t31",
            timestamp: "20:53:40 PDT",
            minutesAgo: 31,
            cameraNumber: 512,
            intersection: "Rainbow & Flamingo",
            isPositiveDetection: true,
            vehicleMatchScore: 92.1,
            snapshotDescription: "Optical snapshot confirms red Honda Civic continuing southbound on Rainbow Blvd. Passenger visor down; front passenger door dent clearly distinguished.",
            trafficDensity: "moderate",
            vehicleDetails: {
              makeModel: "Honda Civic (Red)",
              color: "Crimson Red",
              plateNumber: "NV #78B-492",
              speedMph: 36,
              lane: "Lane #1 Southbound",
              travelVector: "Southbound on Rainbow past commercial center",
              boundingPolygon: { x: 48, y: 52, w: 20, h: 24 }
            }
          }
        ]
      },
      {
        hopNumber: 3,
        cameraId: "fast-cam-516",
        cameraNumber: 516,
        cameraName: "Rainbow Blvd & Peace Way",
        intersection: "S Rainbow Blvd & Peace Way",
        coordinates: { lat: 36.110, lng: -115.242 },
        sector8: "SE",
        bearingDeg: 154,
        distanceFromOriginMiles: 1.48,
        distanceFromLastHopMiles: 0.35,
        timestamp: "24 mins ago",
        relativeMinutesAgo: 24,
        speedMph: 19,
        detectionConfidence: 96.8,
        turnActionTaken: "Braked sharply and turned West into Peace Way commercial light-industrial complex",
        sourceUrl: "https://bugatti.nvfast.org/camera/516",
        frames: [
          {
            id: "snap-516-t24",
            timestamp: "21:00:15 PDT",
            minutesAgo: 24,
            cameraNumber: 516,
            intersection: "Rainbow & Peace Way",
            isPositiveDetection: true,
            vehicleMatchScore: 96.8,
            snapshotDescription: "High-resolution intersection snapshot shows red Civic turning right onto Peace Way at 19 MPH with headlights switched to parking lights. Terminal directional branch detected.",
            trafficDensity: "clear",
            vehicleDetails: {
              makeModel: "Honda Civic (Red)",
              color: "Crimson Red",
              plateNumber: "NV #78B-492",
              speedMph: 19,
              lane: "Right Turn Deceleration Pocket",
              travelVector: "Westbound into Peace Way industrial alleyway",
              boundingPolygon: { x: 55, y: 58, w: 25, h: 28 }
            }
          }
        ]
      }
    ],
    containmentZone: {
      zoneName: "Spring Valley Commercial Light Industrial & Auto Bay Enclave",
      sectorDescription: "Bounded by W Flamingo Rd (North), S Rainbow Blvd (East), W Tropicana Ave (South), and S Tenaya Way (West).",
      centerCoordinates: { lat: 36.1085, lng: -115.248 },
      radiusMiles: 0.42,
      containmentProbability: 94.2,
      status: "laying_low",
      reasonsLayingLow: [
        "Vehicle turned west off Rainbow Blvd onto Peace Way with low-beam / parking lights at 21:00 PDT.",
        "Zero downstream camera detections across all surrounding freeway ramps (CC-215 / Flamingo, CC-215 / Tropicana) over the last 24 minutes.",
        "No sighting at western arterial boundary (Tenaya Way & Peace Way or Buffalo Dr).",
        "Zone contains 14 multi-bay automotive repair garages, dead-end warehouse alleys, and secluded commercial parking lots ideal for vehicle concealing and package inventory sorting."
      ],
      recommendedSurveillancePosts: [
        {
          label: "Perimeter Post Alpha",
          intersection: "S Rainbow Blvd & Peace Way",
          coordinates: { lat: 36.110, lng: -115.242 },
          action: "Deploy marked unit to seal eastern ingress/egress corridor."
        },
        {
          label: "Perimeter Post Bravo",
          intersection: "S Tenaya Way & Peace Way",
          coordinates: { lat: 36.110, lng: -115.251 },
          action: "Station intercept unit to block western residential neighborhood cut-through."
        },
        {
          label: "Perimeter Post Charlie",
          intersection: "W Tropicana Ave & S Tenaya Way",
          coordinates: { lat: 36.101, lng: -115.251 },
          action: "Monitor commercial truck alleyway exiting south toward Tropicana."
        }
      ],
      potentialStashStructures: [
        "Spring Valley Auto Tech complex (bay #4 & #7 rollup doors open)",
        "Desert Horizon Commercial Storage yard (rear gravel enclosure)",
        "Covered carport structure behind Peace Way Professional Center"
      ]
    },
    perimeterBoundaryCameras: [
      {
        cameraId: "fast-cam-105",
        cameraNumber: 105,
        intersection: "CC-215 Beltway & Flamingo Rd",
        coordinates: { lat: 36.115, lng: -115.298 },
        distanceMiles: 2.8,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 2
      },
      {
        cameraId: "fast-cam-107",
        cameraNumber: 107,
        intersection: "CC-215 Beltway & Tropicana Ave",
        coordinates: { lat: 36.101, lng: -115.298 },
        distanceMiles: 3.1,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 3
      },
      {
        cameraId: "fast-cam-520",
        cameraNumber: 520,
        intersection: "S Decatur Blvd & W Tropicana Ave",
        coordinates: { lat: 36.101, lng: -115.207 },
        distanceMiles: 2.4,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 2
      },
      {
        cameraId: "fast-cam-524",
        cameraNumber: 524,
        intersection: "S Buffalo Dr & W Flamingo Rd",
        coordinates: { lat: 36.115, lng: -115.260 },
        distanceMiles: 1.1,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 1
      },
      {
        cameraId: "fast-cam-108",
        cameraNumber: 108,
        intersection: "I-15 at Flamingo Rd",
        coordinates: { lat: 36.115, lng: -115.1785 },
        distanceMiles: 3.9,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 1
      }
    ]
  },
  {
    id: "case-peccole-102",
    caseNumber: "LVMPD-26-0920-0418",
    title: "Systematic Car Prowler / Vehicle Burglary Crew",
    crimeType: "Multiple Vehicle Burglaries / Stolen Property",
    agencyAssigned: "LVMPD Summerlin Area Command & Night Shift Watch",
    incidentTime: "3 hours ago (03:15 PDT)",
    originLocation: "Peccole Ranch (Paseo Vista Dr & Lake Sahara Dr)",
    originCoordinates: { lat: 36.147, lng: -115.285 },
    suspectDescription: "Two suspects in dark hooded sweatshirts and neoprene masks testing door handles; lookout vehicle staging nearby.",
    suspectVehicle: {
      makeModel: "Nissan Altima Sedan",
      color: "Dark Silver / Gunmetal",
      yearRange: "2015-2018",
      bodyStyle: "4-Door Midsize Sedan",
      plateNumber: "Paper Temporary Tag (California Dealer)",
      plateNotes: "Paper dealer tag taped inside rear tinted windshield.",
      distinctiveFeatures: [
        "Mismatched black hubcaps on driver side",
        "Driver side taillight lens cracked with white glare",
        "No front license plate bracket",
        "Heavy rear trunk squat (likely carrying stolen tools/batteries)"
      ],
      initialHeading: "Southbound on Ft Apache Rd towards Sahara Ave & Desert Inn Rd"
    },
    hops: [
      {
        hopNumber: 1,
        cameraId: "fast-cam-530",
        cameraNumber: 530,
        cameraName: "Sahara Ave & Ft Apache Rd",
        intersection: "W Sahara Ave & S Ft Apache Rd",
        coordinates: { lat: 36.144, lng: -115.298 },
        sector8: "SW",
        bearingDeg: 236,
        distanceFromOriginMiles: 0.76,
        distanceFromLastHopMiles: 0.76,
        timestamp: "2 hr 45 min ago",
        relativeMinutesAgo: 165,
        speedMph: 44,
        detectionConfidence: 91.8,
        turnActionTaken: "Crossed Sahara Ave continuing south on Ft Apache Rd with headlights dipped",
        sourceUrl: "https://bugatti.nvfast.org/camera/530",
        frames: [
          {
            id: "snap-530-t165",
            timestamp: "03:22:18 PDT",
            minutesAgo: 165,
            cameraNumber: 530,
            intersection: "Sahara & Ft Apache",
            isPositiveDetection: true,
            vehicleMatchScore: 91.8,
            snapshotDescription: "Night vision infrared frame shows dark silver Altima traveling south. Cracked left taillight creates distinctive photometric halo; temporary tag reflection verified.",
            trafficDensity: "clear",
            vehicleDetails: {
              makeModel: "Nissan Altima (Silver)",
              color: "Dark Gunmetal Silver",
              plateNumber: "Paper Temporary Tag",
              speedMph: 44,
              lane: "Lane #1 Southbound",
              travelVector: "Southbound toward Desert Inn Rd",
              boundingPolygon: { x: 42, y: 40, w: 24, h: 25 }
            }
          }
        ]
      },
      {
        hopNumber: 2,
        cameraId: "fast-cam-534",
        cameraNumber: 534,
        cameraName: "Desert Inn Rd & Ft Apache Rd",
        intersection: "W Desert Inn Rd & S Ft Apache Rd",
        coordinates: { lat: 36.130, lng: -115.298 },
        sector8: "S",
        bearingDeg: 180,
        distanceFromOriginMiles: 1.38,
        distanceFromLastHopMiles: 0.97,
        timestamp: "2 hr 38 min ago",
        relativeMinutesAgo: 158,
        speedMph: 31,
        detectionConfidence: 93.4,
        turnActionTaken: "Turned Eastbound onto Desert Inn Rd toward Durango Dr",
        sourceUrl: "https://bugatti.nvfast.org/camera/534",
        frames: [
          {
            id: "snap-534-t158",
            timestamp: "03:29:40 PDT",
            minutesAgo: 158,
            cameraNumber: 534,
            intersection: "Desert Inn & Ft Apache",
            isPositiveDetection: true,
            vehicleMatchScore: 93.4,
            snapshotDescription: "Altima captured making sweeping left turn onto Desert Inn Rd. Two silhouettes visible in front seats; front passenger passenger window rolled down slightly.",
            trafficDensity: "clear",
            vehicleDetails: {
              makeModel: "Nissan Altima (Silver)",
              color: "Dark Silver",
              plateNumber: "Paper Tag (Confirmed)",
              speedMph: 31,
              lane: "Left Turn Slot EB",
              travelVector: "Eastbound on Desert Inn toward Grand Canyon & Durango",
              boundingPolygon: { x: 50, y: 46, w: 22, h: 26 }
            }
          }
        ]
      },
      {
        hopNumber: 3,
        cameraId: "fast-cam-538",
        cameraNumber: 538,
        cameraName: "Desert Inn Rd & Durango Dr",
        intersection: "W Desert Inn Rd & S Durango Dr",
        coordinates: { lat: 36.130, lng: -115.279 },
        sector8: "SE",
        bearingDeg: 125,
        distanceFromOriginMiles: 1.22,
        distanceFromLastHopMiles: 1.08,
        timestamp: "2 hr 29 min ago",
        relativeMinutesAgo: 149,
        speedMph: 22,
        detectionConfidence: 95.2,
        turnActionTaken: "Turned South onto Durango Dr then immediately veered into Desert Breeze Park maintenance perimeter",
        sourceUrl: "https://bugatti.nvfast.org/camera/538",
        frames: [
          {
            id: "snap-538-t149",
            timestamp: "03:37:05 PDT",
            minutesAgo: 149,
            cameraNumber: 538,
            intersection: "Desert Inn & Durango",
            isPositiveDetection: true,
            vehicleMatchScore: 95.2,
            snapshotDescription: "Vehicle decelerates and extinguishes lights while entering the shadowed utility roadway behind the baseball complex.",
            trafficDensity: "clear",
            vehicleDetails: {
              makeModel: "Nissan Altima (Silver)",
              color: "Dark Silver",
              plateNumber: "Temp Paper Tag",
              speedMph: 22,
              lane: "Right Shoulder Turn Slip",
              travelVector: "Entering park maintenance service road",
              boundingPolygon: { x: 60, y: 52, w: 26, h: 27 }
            }
          }
        ]
      }
    ],
    containmentZone: {
      zoneName: "Desert Breeze Community Park & Flood Detention Basin Compound",
      sectorDescription: "Desert wash berm between Desert Inn Rd and Spring Mountain Rd behind Durango High School.",
      centerCoordinates: { lat: 36.128, lng: -115.275 },
      radiusMiles: 0.35,
      containmentProbability: 91.5,
      status: "laying_low",
      reasonsLayingLow: [
        "Vehicle entered off-road access gate with lights extinguished at 03:37 PDT.",
        "Zero downstream detections at Spring Mountain & Durango or Sahara & Durango.",
        "High concentration of shadowed culverts, maintenance storage containers, and drainage access corridors.",
        "Perpetrators likely paused to unload stolen property, rummage backpacks, and wait until morning commute traffic."
      ],
      recommendedSurveillancePosts: [
        {
          label: "North Berm Gate",
          intersection: "Desert Inn Rd & S Durango Dr",
          coordinates: { lat: 36.130, lng: -115.279 },
          action: "Lock northern park gate perimeter."
        },
        {
          label: "South School Perimeter",
          intersection: "Spring Mountain Rd & S Durango Dr",
          coordinates: { lat: 36.126, lng: -115.279 },
          action: "Position watch unit at southern drainage culvert exit."
        }
      ],
      potentialStashStructures: [
        "Regional flood wash culvert under Durango Dr bridge",
        "Desert Breeze Park heavy equipment staging yard",
        "Durango High School athletic field storage sheds"
      ]
    },
    perimeterBoundaryCameras: [
      {
        cameraId: "fast-cam-508",
        cameraNumber: 508,
        intersection: "Spring Mountain Rd & Rainbow Blvd",
        coordinates: { lat: 36.126, lng: -115.242 },
        distanceMiles: 2.7,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 4
      },
      {
        cameraId: "fast-cam-312",
        cameraNumber: 312,
        intersection: "CC-215 at Town Center Dr",
        coordinates: { lat: 36.142, lng: -115.311 },
        distanceMiles: 1.6,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 5
      }
    ]
  },
  {
    id: "case-craig-108",
    caseNumber: "LVMPD-26-0922-7703",
    title: "Armed Robbery & Shots Fired Fleeing Corridor",
    crimeType: "Violent Felony / Assault with Deadly Weapon",
    agencyAssigned: "LVMPD North Command & Tactical Air Operations STAR-1",
    incidentTime: "1 hr 15 mins ago (20:10 PDT)",
    originLocation: "Craig Ranch Regional Park (W Craig Rd & Simmons St)",
    originCoordinates: { lat: 36.241, lng: -115.176 },
    suspectDescription: "Two armed males wearing ski masks fleeing in high-horsepower modern muscle car with aftermarket exhaust.",
    suspectVehicle: {
      makeModel: "Dodge Charger SRT / Scat Pack",
      color: "Matte Charcoal / Pitch Black",
      yearRange: "2019-2023",
      bodyStyle: "4-Door Full Size Performance Sedan",
      plateNumber: "Unknown / Dark Smoked License Plate Cover",
      plateNotes: "License plate obscured with infrared-blocking smoked cover.",
      distinctiveFeatures: [
        "Aggressive dual hood heat extractors",
        "Red Brembo brake calipers visible behind 20-inch matte wheels",
        "Blacked-out LED taillight bar (racetrack lighting)",
        "Extremely loud modified exhaust with decel popping"
      ],
      initialHeading: "Westbound on W Craig Rd towards Decatur Blvd and US-95 corridor"
    },
    hops: [
      {
        hopNumber: 1,
        cameraId: "fast-cam-705",
        cameraNumber: 705,
        cameraName: "Craig Rd & Simmons St",
        intersection: "W Craig Rd & Simmons St",
        coordinates: { lat: 36.241, lng: -115.176 },
        sector8: "N",
        bearingDeg: 0,
        distanceFromOriginMiles: 0.1,
        distanceFromLastHopMiles: 0.1,
        timestamp: "1 hr 12 min ago",
        relativeMinutesAgo: 72,
        speedMph: 58,
        detectionConfidence: 97.4,
        turnActionTaken: "Spun tires exiting skate park access driveway, accelerated westbound on Craig Rd",
        sourceUrl: "https://bugatti.nvfast.org/camera/705",
        frames: [
          {
            id: "snap-705-t72",
            timestamp: "20:12:44 PDT",
            minutesAgo: 72,
            cameraNumber: 705,
            intersection: "Craig & Simmons",
            isPositiveDetection: true,
            vehicleMatchScore: 97.4,
            snapshotDescription: "NV-FAST 705 snapshot shows matte charcoal Charger accelerating west through green signal at 58 MPH. Red brake caliper glow and hood scoops verified.",
            trafficDensity: "clear",
            vehicleDetails: {
              makeModel: "Dodge Charger SRT",
              color: "Matte Charcoal",
              plateNumber: "Smoked Plate Cover",
              speedMph: 58,
              lane: "Lane #2 Westbound",
              travelVector: "High-speed egress westbound on Craig Rd",
              boundingPolygon: { x: 35, y: 48, w: 28, h: 26 }
            }
          }
        ]
      },
      {
        hopNumber: 2,
        cameraId: "fast-cam-710",
        cameraNumber: 710,
        cameraName: "Craig Rd & Clayton St",
        intersection: "W Craig Rd & Clayton St",
        coordinates: { lat: 36.241, lng: -115.195 },
        sector8: "W",
        bearingDeg: 270,
        distanceFromOriginMiles: 1.08,
        distanceFromLastHopMiles: 1.08,
        timestamp: "1 hr 08 min ago",
        relativeMinutesAgo: 68,
        speedMph: 64,
        detectionConfidence: 95.8,
        turnActionTaken: "Maintained center lane westbound past Clayton St weaving through traffic",
        sourceUrl: "https://bugatti.nvfast.org/camera/710",
        frames: [
          {
            id: "snap-710-t68",
            timestamp: "20:16:10 PDT",
            minutesAgo: 68,
            cameraNumber: 710,
            intersection: "Craig & Clayton",
            isPositiveDetection: true,
            vehicleMatchScore: 95.8,
            snapshotDescription: "Vehicle captured in high-speed corridor traversal. Optical timestamp matches acoustic shot detection telemetry from Craig Ranch.",
            trafficDensity: "moderate",
            vehicleDetails: {
              makeModel: "Dodge Charger SRT",
              color: "Matte Charcoal",
              plateNumber: "Smoked Shield",
              speedMph: 64,
              lane: "Lane #2 Westbound",
              travelVector: "Continuing west toward Decatur Blvd",
              boundingPolygon: { x: 40, y: 50, w: 26, h: 25 }
            }
          }
        ]
      },
      {
        hopNumber: 3,
        cameraId: "fast-cam-715",
        cameraNumber: 715,
        cameraName: "Craig Rd & Decatur Blvd",
        intersection: "W Craig Rd & N Decatur Blvd",
        coordinates: { lat: 36.241, lng: -115.207 },
        sector8: "W",
        bearingDeg: 270,
        distanceFromOriginMiles: 1.74,
        distanceFromLastHopMiles: 0.67,
        timestamp: "1 hr 03 min ago",
        relativeMinutesAgo: 63,
        speedMph: 28,
        detectionConfidence: 96.1,
        turnActionTaken: "Hard right turn Northbound onto N Decatur Blvd toward secluded rail spur district",
        sourceUrl: "https://bugatti.nvfast.org/camera/715",
        frames: [
          {
            id: "snap-715-t63",
            timestamp: "20:21:30 PDT",
            minutesAgo: 63,
            cameraNumber: 715,
            intersection: "Craig & Decatur",
            isPositiveDetection: true,
            vehicleMatchScore: 96.1,
            snapshotDescription: "Charger cuts across dedicated right turn lane onto N Decatur Blvd heading north into industrial warehouse zone. Velocity drops sharply as vehicle enters unpaved gravel lot.",
            trafficDensity: "clear",
            vehicleDetails: {
              makeModel: "Dodge Charger SRT",
              color: "Matte Charcoal",
              plateNumber: "Covered",
              speedMph: 28,
              lane: "Decatur Northbound Turn",
              travelVector: "Northbound into railway siding industrial corridor",
              boundingPolygon: { x: 52, y: 54, w: 25, h: 27 }
            }
          }
        ]
      }
    ],
    containmentZone: {
      zoneName: "North Las Vegas Industrial Rail Siding & Scrap Yard District",
      sectorDescription: "Bounded by W Lone Mountain Rd (North), N Decatur Blvd (East), W Craig Rd (South), and Union Pacific Rail Spur (West).",
      centerCoordinates: { lat: 36.255, lng: -115.212 },
      radiusMiles: 0.48,
      containmentProbability: 96.2,
      status: "laying_low",
      reasonsLayingLow: [
        "Vehicle completed rapid turn north onto Decatur Blvd and exited paved grid onto rail spur access road at 20:21 PDT.",
        "Zero egress detected on all perimeter freeway cameras: US-95 & Craig (Cam #225), US-95 & Ann Rd (Cam #228), and 215 & Decatur (Cam #330).",
        "Extreme heat signature likely cooling down behind metal scrap warehouse barrier to evade police helicopter FLIR.",
        "Area contains heavy machinery scrap yards, shipping container stacks, and unmonitored commercial garages."
      ],
      recommendedSurveillancePosts: [
        {
          label: "Decatur Rail Crossing Post",
          intersection: "N Decatur Blvd & W Lone Mountain Rd",
          coordinates: { lat: 36.262, lng: -115.207 },
          action: "Deploy heavy intercept vehicles and spike strips across Decatur north exit."
        },
        {
          label: "Craig Buffer Post",
          intersection: "W Craig Rd & N Decatur Blvd",
          coordinates: { lat: 36.241, lng: -115.207 },
          action: "Prevent southward backtracking toward residential neighborhoods."
        },
        {
          label: "Air Support FLIR Sweep",
          intersection: "Union Pacific Rail Spur Corridor",
          coordinates: { lat: 36.255, lng: -115.215 },
          action: "Request Metro STAR-1 FLIR thermal scan of scrap metal yard bays."
        }
      ],
      potentialStashStructures: [
        "Western Metal Recycling auto yard (rear container stacks)",
        "Desert Rail Cargo staging dock #3",
        "Abandoned concrete batch plant warehouse"
      ]
    },
    perimeterBoundaryCameras: [
      {
        cameraId: "fast-cam-225",
        cameraNumber: 225,
        intersection: "US-95 at Craig Rd",
        coordinates: { lat: 36.241, lng: -115.241 },
        distanceMiles: 3.6,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 3
      },
      {
        cameraId: "fast-cam-330",
        cameraNumber: 330,
        intersection: "CC-215 Beltway & Decatur Blvd",
        coordinates: { lat: 36.286, lng: -115.207 },
        distanceMiles: 3.1,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 2
      },
      {
        cameraId: "fast-cam-720",
        cameraNumber: 720,
        intersection: "Craig Rd & I-15 Interchange",
        coordinates: { lat: 36.241, lng: -115.118 },
        distanceMiles: 3.2,
        scanResult: "NEGATIVE_CLEARED",
        lastScannedMinutesAgo: 1
      }
    ]
  }
];
