import { GooglePersonContact, LiveUserLocation, GeoCoordinate } from "../types";
import { calculateDistanceMiles, getCompassDirection, formatDistance } from "./geoUtils";

export const GOOGLE_PEOPLE_API_ENDPOINT = "https://people.googleapis.com/v1/people/me/connections";
export const GOOGLE_DOCS_SOURCE_URL = "https://developers.google.com/people/api/rest/v1/people.connections/list";

// Known Las Vegas valley landmark and neighborhood coordinate centroids for address mapping
const LOCAL_ADDRESS_COORDINATES: Record<string, GeoCoordinate> = {
  "summerlin": { lat: 36.1867, lng: -115.3012 },
  "summerlin north": { lat: 36.205, lng: -115.302 },
  "summerlin south": { lat: 36.136, lng: -115.321 },
  "peccole ranch": { lat: 36.148, lng: -115.295 },
  "spring valley": { lat: 36.115, lng: -115.249 },
  "the lakes": { lat: 36.143, lng: -115.282 },
  "green valley": { lat: 36.048, lng: -115.081 },
  "henderson": { lat: 36.0395, lng: -114.9817 },
  "seven hills": { lat: 35.989, lng: -115.114 },
  "downtown": { lat: 36.1699, lng: -115.1398 },
  "fremont": { lat: 36.1695, lng: -115.143 },
  "the strip": { lat: 36.1147, lng: -115.1728 },
  "las vegas blvd": { lat: 36.125, lng: -115.171 },
  "unlv": { lat: 36.107, lng: -115.142 },
  "north las vegas": { lat: 36.2167, lng: -115.1388 },
  "aliante": { lat: 36.292, lng: -115.185 },
  "centennial hills": { lat: 36.289, lng: -115.275 },
  "southwest": { lat: 36.042, lng: -115.243 },
  "mountains edge": { lat: 35.998, lng: -115.267 },
  "rhodes ranch": { lat: 36.045, lng: -115.289 },
  "enterprise": { lat: 36.025, lng: -115.241 },
  "sunrise manor": { lat: 36.188, lng: -115.062 },
  "lone mountain": { lat: 36.248, lng: -115.312 }
};

/**
 * Resolves an address string or city/region to approximate GeoCoordinates in Las Vegas Valley
 */
export function estimateCoordinatesForAddress(
  address?: string,
  city?: string,
  region?: string
): GeoCoordinate {
  const full = `${address || ""} ${city || ""} ${region || ""}`.toLowerCase();
  
  for (const [key, coords] of Object.entries(LOCAL_ADDRESS_COORDINATES)) {
    if (full.includes(key)) {
      // Add slight micro-offset so multiple people in same neighborhood don't stack exactly on top
      const jitterLat = (Math.random() - 0.5) * 0.006;
      const jitterLng = (Math.random() - 0.5) * 0.006;
      return {
        lat: Number((coords.lat + jitterLat).toFixed(5)),
        lng: Number((coords.lng + jitterLng).toFixed(5))
      };
    }
  }

  // Default within Las Vegas metropolitan area
  const baseLat = 36.14;
  const baseLng = -115.22;
  const hash = full.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offsetLat = ((hash % 100) / 100 - 0.5) * 0.08;
  const offsetLng = (((hash * 13) % 100) / 100 - 0.5) * 0.08;

  return {
    lat: Number((baseLat + offsetLat).toFixed(5)),
    lng: Number((baseLng + offsetLng).toFixed(5))
  };
}

/**
 * Fetch contacts from Google People API using the active OAuth Bearer token
 */
export async function fetchGoogleContacts(accessToken: string): Promise<GooglePersonContact[]> {
  const url = new URL(GOOGLE_PEOPLE_API_ENDPOINT);
  url.searchParams.set("pageSize", "100");
  url.searchParams.set(
    "personFields",
    "names,emailAddresses,phoneNumbers,photos,addresses,locations,organizations,relations,userDefined"
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google People API HTTP Error:", response.status, errorText);
    throw new Error(`Google People API failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const connections: any[] = data.connections || [];

  return connections.map((c, index): GooglePersonContact => {
    const nameObj = c.names?.[0] || {};
    const emailObj = c.emailAddresses?.[0] || {};
    const phoneObj = c.phoneNumbers?.[0] || {};
    const photoObj = c.photos?.[0] || {};
    const addrObj = c.addresses?.[0] || {};
    const orgObj = c.organizations?.[0] || {};
    const relObj = c.relations?.[0] || {};

    const displayName = nameObj.displayName || emailObj.value || `Contact #${index + 1}`;
    const formattedAddress = addrObj.formattedValue || [addrObj.streetAddress, addrObj.city, addrObj.region, addrObj.postalCode].filter(Boolean).join(", ");
    const hasPhysicalLocation = Boolean(formattedAddress || addrObj.city || addrObj.region);

    const coords = hasPhysicalLocation
      ? estimateCoordinatesForAddress(addrObj.streetAddress, addrObj.city, addrObj.region)
      : estimateCoordinatesForAddress(displayName, undefined, "NV");

    return {
      resourceName: c.resourceName || `people/contact_${index}`,
      etag: c.etag,
      displayName,
      givenName: nameObj.givenName,
      familyName: nameObj.familyName,
      email: emailObj.value,
      phoneNumber: phoneObj.value,
      photoUrl: photoObj.url,
      streetAddress: addrObj.streetAddress,
      city: addrObj.city,
      region: addrObj.region,
      country: addrObj.country,
      formattedAddress,
      relationship: relObj.type || relObj.person || "Contact",
      organization: orgObj.name,
      jobTitle: orgObj.title,
      coordinates: coords,
      hasPhysicalLocation
    };
  });
}

/**
 * Realistic Las Vegas Valley Google Contacts and Live Circle members
 * Used as fallback or to enrich live beacon demonstrations for contacts
 */
export const SAMPLE_GOOGLE_CONTACTS: GooglePersonContact[] = [
  {
    resourceName: "people/sample_sarah_m",
    displayName: "Sarah Miller",
    givenName: "Sarah",
    familyName: "Miller",
    email: "sarah.miller.family@gmail.com",
    phoneNumber: "(702) 555-0142",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    streetAddress: "9415 W Sahara Ave",
    city: "Las Vegas",
    region: "NV",
    formattedAddress: "9415 W Sahara Ave, The Lakes, Las Vegas, NV 89117",
    relationship: "Family (Sister)",
    organization: "Summerlin Hospital",
    jobTitle: "Pediatric RN",
    coordinates: { lat: 36.1438, lng: -115.2974 },
    hasPhysicalLocation: true
  },
  {
    resourceName: "people/sample_david_k",
    displayName: "David Kim",
    givenName: "David",
    familyName: "Kim",
    email: "david.kim.eng@gmail.com",
    phoneNumber: "(702) 555-0188",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    streetAddress: "2200 S Fort Apache Rd",
    city: "Las Vegas",
    region: "NV",
    formattedAddress: "2200 S Fort Apache Rd, Spring Valley, NV 89117",
    relationship: "Colleague",
    organization: "Switch Data Centers",
    jobTitle: "Network Architect",
    coordinates: { lat: 36.1135, lng: -115.2982 },
    hasPhysicalLocation: true
  },
  {
    resourceName: "people/sample_elena_r",
    displayName: "Elena Rodriguez",
    givenName: "Elena",
    familyName: "Rodriguez",
    email: "elena.rodriguez702@gmail.com",
    phoneNumber: "(702) 555-0193",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    streetAddress: "7200 S Rainbow Blvd",
    city: "Las Vegas",
    region: "NV",
    formattedAddress: "7200 S Rainbow Blvd, Southwest Las Vegas, NV 89118",
    relationship: "Close Friend",
    organization: "UNLV School of Medicine",
    jobTitle: "Clinical Fellow",
    coordinates: { lat: 36.0592, lng: -115.2441 },
    hasPhysicalLocation: true
  },
  {
    resourceName: "people/sample_marcus_b",
    displayName: "Marcus Bennett",
    givenName: "Marcus",
    familyName: "Bennett",
    email: "m.bennett.nv@gmail.com",
    phoneNumber: "(702) 555-0211",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    streetAddress: "4505 S Maryland Pkwy",
    city: "Las Vegas",
    region: "NV",
    formattedAddress: "4505 S Maryland Pkwy, Paradise, NV 89154",
    relationship: "Friend / Alumni",
    organization: "Clark County Aviation",
    jobTitle: "Operations Tech",
    coordinates: { lat: 36.1085, lng: -115.1372 },
    hasPhysicalLocation: true
  },
  {
    resourceName: "people/sample_chloe_t",
    displayName: "Chloe Taylor",
    givenName: "Chloe",
    familyName: "Taylor",
    email: "chloe.taylor.re@gmail.com",
    phoneNumber: "(702) 555-0374",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    streetAddress: "1000 S Rampart Blvd",
    city: "Las Vegas",
    region: "NV",
    formattedAddress: "1000 S Rampart Blvd, Peccole Ranch, NV 89145",
    relationship: "Family (Cousin)",
    organization: "Berkshire Hathaway HomeServices",
    jobTitle: "Realtor",
    coordinates: { lat: 36.1584, lng: -115.2891 },
    hasPhysicalLocation: true
  }
];

/**
 * Generate active Live Beacons for contacts in the user's circle
 */
export function generateLiveBeaconsFromContacts(
  contacts: GooglePersonContact[],
  userCoords: GeoCoordinate
): LiveUserLocation[] {
  const statuses: LiveUserLocation["status"][] = [
    "At Home",
    "At Work",
    "In Transit",
    "On Foot / Jogging",
    "Shopping / Errands",
    "Out with Family",
    "Active Beacon"
  ];

  return contacts.map((c, i) => {
    const coords = c.coordinates || {
      lat: userCoords.lat + (Math.random() - 0.5) * 0.04,
      lng: userCoords.lng + (Math.random() - 0.5) * 0.04
    };

    const speed = i % 3 === 0 ? Math.floor(25 + Math.random() * 35) : i % 2 === 0 ? Math.floor(3 + Math.random() * 4) : 0;
    const status = speed > 15 ? "In Transit" : speed > 2 ? "On Foot / Jogging" : statuses[i % statuses.length];

    const relTag: LiveUserLocation["relationshipTag"] =
      c.relationship?.toLowerCase().includes("sister") || c.relationship?.toLowerCase().includes("family") || c.relationship?.toLowerCase().includes("cousin")
        ? "Family"
        : c.relationship?.toLowerCase().includes("colleague") || c.organization
        ? "Coworker"
        : "Friend";

    return {
      userId: `google_user_${c.resourceName.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email: c.email || `contact_${i}@gmail.com`,
      displayName: c.displayName,
      photoUrl: c.photoUrl,
      coordinates: coords,
      addressSnippet: c.formattedAddress || `${c.streetAddress || ""}, ${c.city || "Las Vegas"}`,
      neighborhood: c.city || "Las Vegas Valley",
      status,
      speedMph: speed,
      batteryLevel: Math.max(18, Math.floor(100 - i * 14)),
      isLive: true,
      lastSeen: new Date(Date.now() - i * 180000).toISOString(),
      relationshipTag: relTag,
      googleContactMatch: true,
      headingCompass: getCompassDirection(userCoords, coords),
      deviceType: i % 2 === 0 ? "Pixel" : "iPhone",
      lastVerifiedCCTVCameraId: `cam-${(i % 12) + 1}`
    };
  });
}
