'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc3,
  ChevronDown,
  ChevronUp,
  SkipForward,
  SkipBack,
  Video,
} from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import { getActiveMusicTracks } from '@/lib/actions/adminActions';
import { isYouTubeUrl, extractYouTubeVideoId } from '@/lib/youtube';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// High-availability cozy cafe acoustic lofi tracks (fallback)
const DEFAULT_PLAYLIST = [
  {
    title: 'Warm Cinnamon Bakery Lo-fi',
    artist: 'Miki Cafe Studio',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    title: 'Cozy Morning Coffee',
    artist: 'Miki Cafe Studio',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=cozy-lounge-10284.mp3',
  },
];

export function BakeryMusicPlayer() {
  const [playlist, setPlaylist] = useState<any[]>(DEFAULT_PLAYLIST);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytReadyRef = useRef<boolean>(false);

  // Load playlist from database
  useEffect(() => {
    getActiveMusicTracks()
      .then((tracks) => {
        if (tracks && tracks.length > 0) {
          setPlaylist(tracks);
        }
      })
      .catch((err) => {
        console.debug('Failed to load dynamic tracks, using fallback', err);
      });
  }, []);

  const currentTrack = playlist[trackIndex % playlist.length] || DEFAULT_PLAYLIST[0];
  const isCurrentYT = isYouTubeUrl(currentTrack?.url);
  const currentYtId = extractYouTubeVideoId(currentTrack?.url);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let pollInterval: any;

    const setupPlayer = () => {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        try {
          ytPlayerRef.current = new window.YT.Player('bakery-yt-player-iframe', {
            height: '2',
            width: '2',
            videoId: currentYtId || 'jfKfPFiQCEY',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
            },
            events: {
              onReady: (event: any) => {
                ytReadyRef.current = true;
                if (isMuted) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                  event.target.setVolume(volume * 100);
                }
              },
              onStateChange: (event: any) => {
                // 0 = ENDED
                if (event.data === 0) {
                  setTrackIndex((prev) => (prev + 1) % playlist.length);
                } else if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                }
              },
              onError: (err: any) => {
                console.warn('YouTube Player notice, advancing track:', err);
                setTrackIndex((prev) => (prev + 1) % playlist.length);
              },
            },
          });
        } catch (e) {
          console.debug('YouTube player init delayed', e);
        }
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    pollInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setupPlayer();
        clearInterval(pollInterval);
      }
    }, 250);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Sync volume / mute across both players
  useEffect(() => {
    const targetVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = targetVol;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        if (isMuted) {
          ytPlayerRef.current.mute?.();
        } else {
          ytPlayerRef.current.unMute?.();
          ytPlayerRef.current.setVolume?.(volume * 100);
        }
      } catch (err) {
        console.debug('YT volume error', err);
      }
    }
  }, [volume, isMuted]);

  // Handle track index change
  useEffect(() => {
    if (!currentTrack) return;

    if (isCurrentYT && currentYtId) {
      // Pause HTML audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Load YouTube video
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          if (isPlaying) {
            ytPlayerRef.current.loadVideoById(currentYtId);
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.cueVideoById(currentYtId);
          }
        } catch (err) {
          console.debug('YT load video error', err);
        }
      }
    } else {
      // Pause YouTube player
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (err) {
          console.debug('YT pause error', err);
        }
      }
      // Set & play HTML5 audio
      if (audioRef.current) {
        audioRef.current.src = currentTrack.url;
        if (isPlaying) {
          audioRef.current.play().catch(console.debug);
        }
      }
    }
  }, [trackIndex, playlist]);

  const togglePlay = () => {
    playBubblePop(600);

    if (isCurrentYT && currentYtId) {
      if (isPlaying) {
        try {
          ytPlayerRef.current?.pauseVideo?.();
        } catch (e) {
          console.debug(e);
        }
        setIsPlaying(false);
      } else {
        if (audioRef.current) audioRef.current.pause();
        try {
          if (ytPlayerRef.current?.loadVideoById) {
            ytPlayerRef.current.loadVideoById(currentYtId);
            ytPlayerRef.current.playVideo?.();
          }
        } catch (e) {
          console.debug(e);
        }
        setIsPlaying(true);
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          ytPlayerRef.current?.pauseVideo?.();
        } catch (e) {
          console.debug(e);
        }
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.debug('Audio play deferred', err);
          });
      }
    }
  };

  const handleEnded = () => {
    setTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleNextTrack = () => {
    playBubblePop();
    setTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handlePrevTrack = () => {
    playBubblePop();
    setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-40">
      {/* HTML5 Audio Player for MP3 files */}
      <audio
        ref={audioRef}
        src={isCurrentYT ? undefined : currentTrack.url}
        loop={playlist.length === 1 && !isCurrentYT}
        onEnded={handleEnded}
        preload="none"
      />

      {/* Hidden YouTube background audio iframe */}
      <div
        className="fixed bottom-0 right-0 w-2 h-2 opacity-[0.001] pointer-events-none z-[-1] overflow-hidden"
        aria-hidden="true"
      >
        <div id="bakery-yt-player-iframe" />
      </div>



      {/* Expanded Control Box */}
      {isExpanded && (
        <div className="mb-2 p-3 bg-[#FDFBF7]/95 backdrop-blur-md rounded-2xl border border-[#5D4037]/15 shadow-xl w-64 text-[#5D4037] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#5D4037]/10">
            <div className="flex items-center gap-2">
              <Disc3 className={`w-4 h-4 text-[#D97706] ${isPlaying ? 'animate-spin' : ''}`} />
              <span className="text-xs font-semibold">เพลงบรรเลงคาเฟ่</span>
            </div>
            <button
              onClick={() => {
                playBubblePop();
                setIsExpanded(false);
              }}
              className="text-[#8D6E63] hover:text-[#5D4037] p-1"
              aria-label="ย่อแผงควบคุม"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 flex items-center justify-between">
            <div className="truncate flex-1 mr-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium truncate text-[#5D4037]">{currentTrack.title}</p>
                {isCurrentYT && (
                  <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.2 rounded-md border border-red-200 flex-shrink-0 flex items-center gap-0.5">
                    <Video className="w-2.5 h-2.5" />
                    <span>YouTube</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#8D6E63]">{currentTrack.artist}</p>
            </div>
            {playlist.length > 1 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handlePrevTrack}
                  className="p-1 hover:bg-[#5D4037]/10 rounded-full text-[#8D6E63] hover:text-[#5D4037] transition-colors"
                  title="เพลงก่อนหน้า"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextTrack}
                  className="p-1 hover:bg-[#5D4037]/10 rounded-full text-[#8D6E63] hover:text-[#5D4037] transition-colors"
                  title="เพลงถัดไป"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                playBubblePop();
                setIsMuted(!isMuted);
              }}
              className="text-[#8D6E63] hover:text-[#5D4037]"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1 bg-[#5D4037]/20 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
            />
            <span className="text-[10px] font-mono text-[#8D6E63] w-6 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Main Pill Button */}
      <div className="flex items-center bg-[#FDFBF7]/95 backdrop-blur-md rounded-full border border-[#5D4037]/15 shadow-lg p-1.5 gap-1.5 text-[#5D4037]">
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
            isPlaying
              ? 'bg-[#5D4037] text-white shadow-sm'
              : 'bg-[#5D4037]/10 text-[#5D4037] hover:bg-[#5D4037]/20'
          }`}
          title={isPlaying ? 'หยุดเพลงชั่วคราว' : 'เปิดเพลงคาเฟ่'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => {
            playBubblePop();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:bg-[#5D4037]/5 rounded-full transition-colors"
        >
          {isCurrentYT ? (
            <Video className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#DC2626]' : 'text-[#8D6E63]'}`} />
          ) : (
            <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#D97706]' : 'text-[#8D6E63]'}`} />
          )}
          <span className="hidden sm:inline text-xs">
            {isPlaying ? 'กำลังเล่นเพลง' : 'เปิดเพลง'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-[#8D6E63]" />
          ) : (
            <ChevronUp className="w-3 h-3 text-[#8D6E63]" />
          )}
        </button>
      </div>
    </div>
  );
}
