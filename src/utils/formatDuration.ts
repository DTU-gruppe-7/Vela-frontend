/**
 * Parse an ISO 8601 duration string (e.g. "PT1H20M", "PT45M", "PT2H") into a
 * human-readable Danish string like "1 t 20 min" or "45 min".
 */
export function formatDuration(iso: string): string {
    const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
    if (!match) return iso;
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} t`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.length > 0 ? parts.join(' ') : '0 min';
}
