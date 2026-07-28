import { useState, useRef, useEffect } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiVolume2, 
  FiHeart, 
  FiMaximize2,
  FiX
} from "react-icons/fi";
import { FullscreenPlayer } from "../player/FullscreenPlayer";

const FooterPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, togglePlay, playNext, playPrevious, setIsFullscreenPlayerOpen, isFullscreenPlayerOpen, queue } = usePlayer();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(1);
  const [isClosed, setIsClosed] = useState(false);

  // Automatically reopen player if music starts playing again
  useEffect(() => {
    if (isPlaying) {
      setIsClosed(false);
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const current = audio.currentTime;
    const total = audio.duration || 0;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(formatTime(audio.duration));
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

  const handleSeek = (e) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = getClientX(e) - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  const onSeekStart = (e) => {
    if (!e.touches) e.preventDefault(); // Prevent default only for mouse to avoid passive event warning on touch
    handleSeek(e);
    
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      setIsPlaying(false);
    }

    const onMove = (eMove) => handleSeek(eMove);
    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      
      if (wasPlaying) {
        setIsPlaying(true);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  const handleVolumeChange = (e) => {
    if (!volumeBarRef.current || !audioRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = getClientX(e) - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percent);
    audioRef.current.volume = percent;
  };

  const onVolumeStart = (e) => {
    if (!e.touches) e.preventDefault();
    handleVolumeChange(e);
    const onMove = (eMove) => handleVolumeChange(eMove);
    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  const seekToPercent = (percent) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
    }
  };

  const setVolumeLevel = (level) => {
    if (audioRef.current) {
      audioRef.current.volume = level;
      setVolume(level);
    }
  };

  if (!currentSong) {
    return null;
  }

  const handleClose = () => {
    if (isPlaying) setIsPlaying(false);
    setIsClosed(true);
  };

  return (
    <>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.uri}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      />

      {/* Fullscreen Player Portal/Component */}
      <FullscreenPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        progress={progress}
        isFullscreenPlayerOpen={isFullscreenPlayerOpen}
        setIsFullscreenPlayerOpen={setIsFullscreenPlayerOpen}
        setIsPlaying={setIsPlaying}
        togglePlay={togglePlay}
        playNext={playNext}
        playPrevious={playPrevious}
        seekToPercent={seekToPercent}
        setVolumeLevel={setVolumeLevel}
        queue={queue}
      />

      {/* The Footer UI */}
      {!isClosed && (
        <footer className="h-16 sm:h-24 mx-auto max-w-5xl mb-3 sm:mb-6 rounded-3xl sm:rounded-[2rem] glass-panel border border-white/5 flex items-center justify-between px-3 sm:px-8 relative z-50 shadow-2xl backdrop-blur-2xl transition-all w-[96%] sm:w-[95%]">
          
          {/* Close Button in absolute top-right corner of the rounded footer, or on the far right */}
          <button 
            onClick={handleClose}
            className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 h-6 w-6 sm:h-8 sm:w-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 z-50 cursor-pointer"
            title="Close Player"
          >
            <FiX className="text-xs sm:text-sm font-bold" />
          </button>
          
          {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-surface-hover shrink-0 hidden sm:block">
          {/* Dummy image - standard SONEXA practice */}
          <img 
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop" 
            alt="Album cover" 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h4 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[90px] sm:max-w-[200px]">
            {currentSong.title}
          </h4>
          <p className="text-[10px] sm:text-xs text-text-secondary truncate max-w-[90px] sm:max-w-[200px]">
            {currentSong.artist?.username || currentSong.artist || "Unknown Artist"}
          </p>
        </div>
        <button className="text-text-secondary hover:text-white transition hidden sm:block ml-2">
          <FiHeart className="text-lg" />
        </button>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={playPrevious}
            className="text-text-secondary hover:text-white transition active:scale-95"
          >
            <FiSkipBack className="text-xl" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95 shrink-0"
          >
            {isPlaying ? (
              <FiPause className="text-lg sm:text-xl fill-black" />
            ) : (
              <FiPlay className="text-lg sm:text-xl fill-black ml-1" />
            )}
          </button>

          <button 
            onClick={playNext}
            className="text-text-secondary hover:text-white transition active:scale-95"
          >
            <FiSkipForward className="text-xl" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1 sm:gap-2 w-full">
          <span className="text-[10px] sm:text-xs text-text-secondary w-8 sm:w-10 text-right shrink-0">{currentTime}</span>
          <div 
            ref={progressBarRef}
            onMouseDown={onSeekStart}
            onTouchStart={onSeekStart}
            className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-surface-hover"
          >
            <div 
              className="absolute top-0 left-0 h-full rounded-full bg-primary group-hover:bg-primary-hover transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="player-dot absolute top-1/2 -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-white shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            ></div>
          </div>
          <span className="text-[10px] sm:text-xs text-text-secondary w-8 sm:w-10 shrink-0">{duration}</span>
        </div>
      </div>

      {/* Right: Volume & Extras */}
      <div className="flex items-center justify-end gap-4 w-1/3 text-text-secondary hidden md:flex">
        <FiVolume2 className="text-lg" />
        <div 
          ref={volumeBarRef}
          onMouseDown={onVolumeStart}
          onTouchStart={onVolumeStart}
          className="group relative h-1.5 w-24 cursor-pointer rounded-full bg-surface-hover"
        >
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-primary group-hover:bg-primary-hover transition-all duration-100"
            style={{ width: `${volume * 100}%` }}
          ></div>
          <div 
            className="player-dot absolute top-1/2 -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-white shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            style={{ left: `${volume * 100}%` }}
          ></div>
        </div>
        <button 
          onClick={() => setIsFullscreenPlayerOpen(true)}
          className="hover:text-white transition ml-2 cursor-pointer"
        >
          <FiMaximize2 className="text-lg" />
        </button>
      </div>
      
        </footer>
      )}
    </>
  );
};

export default FooterPlayer;
