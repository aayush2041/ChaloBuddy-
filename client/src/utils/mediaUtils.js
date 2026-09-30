/**
 * Utility functions for parsing and rendering product media (images & videos).
 */

export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }
  return null;
}

export function isDirectVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url.trim());
}

export function parseProductImages(imagesField) {
  if (!imagesField) return [];
  if (Array.isArray(imagesField)) return imagesField.filter(Boolean);
  if (typeof imagesField === 'string') {
    try {
      const parsed = JSON.parse(imagesField);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // Split by newline or comma
      return imagesField.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function getYouTubeThumbnailUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

export function isVideoUrl(url) {
  return !!getYouTubeEmbedUrl(url) || isDirectVideoUrl(url);
}
