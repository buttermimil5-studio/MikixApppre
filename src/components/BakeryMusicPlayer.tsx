'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Disc3, ChevronDown, ChevronUp, SkipForward, SkipBack } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import { getActiveMusicTracks } from '@/lib/actions/adminActions';

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

  useEffect(() => {
    getActiveMusicTracks().then((tracks) => {
      if (tracks && tracks.length > 0) {
        setPlaylist(tracks);
      }
    }).catch((err) => {
      console.debug('Failed to load dynamic tracks, using fallback', err);
    });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    playBubblePop(600);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.debug('Audio play deferred', err);
      });
    }
  };

  const handleEnded = () => {
    setTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleNextTrack = () => {
    playBubblePop();
    setTrackIndex((prev) => (prev + 1) % playlist.length);
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(console.debug);
      }, 100);
    }
  };

  const handlePrevTrack = () => {
    playBubblePop();
    setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(console.debug);
      }, 100);
    }
  };

  const currentTrack = playlist[trackIndex % playlist.length] || DEFAULT_PLAYLIST[0];

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-40">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop={playlist.length === 1}
        onEnded={handleEnded}
        preload="none"
      />


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
              <p className="text-xs font-medium truncate text-[#5D4037]">{currentTrack.title}</p>
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
          <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#D97706]' : 'text-[#8D6E63]'}`} />
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
