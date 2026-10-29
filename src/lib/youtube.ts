/**
 * YouTube Utility Helper
 * Supports standard watch, short youtu.be, live streams, shorts, and embed URLs
 */

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  
  // Handles:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtube.com/watch?v=VIDEO_ID&list=...
  // - https://youtu.be/VIDEO_ID
  // - https://youtu.be/VIDEO_ID?t=...
  // - https://www.youtube.com/live/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  
  return match && match[1] && match[1].length === 11 ? match[1] : null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return !!extractYouTubeVideoId(url);
}

export function getYouTubeEmbedUrl(url: string | null | undefined, options?: { autoplay?: boolean; loop?: boolean }): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  const params = new URLSearchParams({
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    autoplay: options?.autoplay ? '1' : '0',
    loop: options?.loop ? '1' : '0',
    playlist: options?.loop ? videoId : '',
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
