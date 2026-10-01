import { SocialPost, UserLocationSettings } from "../types";
import { calculateDistanceMiles, formatDistance } from "./geoUtils";

export function exportPostsToText(
  posts: SocialPost[],
  locationSettings: UserLocationSettings,
  searchQuery: string
): string {
  const border = "=".repeat(78);
  const subBorder = "-".repeat(78);
  const lines: string[] = [];

  lines.push(border);
  lines.push("VEGASPULSE: LAS VEGAS VALLEY NEIGHBORHOOD & SOCIAL MEDIA AUDIT REPORT");
  lines.push(border);
  lines.push(`Generated:         ${new Date().toLocaleString()}`);
  lines.push(`Location Anchor:   ${locationSettings.name} [${locationSettings.coordinates.lat.toFixed(4)}°N, ${locationSettings.coordinates.lng.toFixed(4)}°W]`);
  lines.push(`Radius Filter:     Within ${locationSettings.radiusMiles} Miles`);
  lines.push(`Keyword Filter:    ${searchQuery || "All Valley Activity"}`);
  lines.push(`Total Posts Found: ${posts.length}`);
  lines.push(subBorder);
  lines.push("");

  posts.forEach((post, index) => {
    const distance = calculateDistanceMiles(locationSettings.coordinates, post.coordinates);
    lines.push(`[RECORD #${index + 1}]`);
    lines.push(`Platform:    ${post.platform.toUpperCase()}`);
    lines.push(`Title:       ${post.title}`);
    lines.push(`Neighborhood:${post.neighborhood} (~${formatDistance(distance)})`);
    lines.push(`Author:      ${post.author.name} ${post.author.isVerifiedNeighbor ? "[Verified Resident]" : ""}`);
    lines.push(`Timestamp:   ${new Date(post.timestamp).toLocaleString()}`);
    lines.push(`Urgency:     ${post.urgency.toUpperCase()}`);
    lines.push(`Address:     ${post.addressSnippet || "Las Vegas Valley"}`);
    lines.push(`Engagement:  ▲ ${post.engagement.upvotes} Upvotes | ${post.engagement.commentsCount} Comments | ${post.engagement.shares} Shares`);
    lines.push("Content:");
    lines.push(post.content);

    if (post.comments && post.comments.length > 0) {
      lines.push("Recent Neighbor Discussion:");
      post.comments.forEach((c) => {
        lines.push(`  - [${c.author} in ${c.neighborhood}]: "${c.text}"`);
      });
    }

    lines.push(subBorder);
    lines.push("");
  });

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
