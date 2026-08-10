/**
 * Helper utilities to handle YouTube URLs, Video IDs, Embed URLs and Thumbnails for Newbery TV
 */

/**
 * Extracts YouTube Video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID directly (11 characters)
 */
export function extractYouTubeId(urlInput) {
  if (!urlInput) return null;

  const trimmed = String(urlInput).trim();

  // If it's already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex for standard YouTube URLs
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

/**
 * Checks if a given URL is a YouTube URL
 */
export function isYouTubeUrl(urlInput) {
  return extractYouTubeId(urlInput) !== null;
}

/**
 * Generates responsive YouTube Embed iframe URL
 */
export function getYouTubeEmbedUrl(urlOrId, autoplay = true) {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return urlOrId; // Return raw string if fallback needed

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Returns high-quality YouTube thumbnail image URL
 */
export function getYouTubeThumbnailUrl(urlOrId) {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) {
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop';
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Normalizes any YouTube URL to canonical watch URL format
 */
export function getCanonicalYouTubeUrl(urlOrId) {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return urlOrId;
  return `https://www.youtube.com/watch?v=${videoId}`;
}
