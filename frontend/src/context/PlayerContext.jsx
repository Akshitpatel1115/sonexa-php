import { createContext, useState, useContext, useMemo, useCallback } from "react";

const PlayerContext = createContext();

export const usePlayer = () => {
  return useContext(PlayerContext);
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [isFullscreenPlayerOpen, setIsFullscreenPlayerOpen] = useState(false);
  const [recentHistory, setRecentHistory] = useState(() => {
    const saved = localStorage.getItem("sonexa_recent_tracks");
    return saved ? JSON.parse(saved) : [];
  });

  const playSong = useCallback((song, newQueue = []) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Add to recent history
    setRecentHistory((prev) => {
      const filtered = prev.filter((s) => s._id !== song._id);
      const updated = [song, ...filtered].slice(0, 5);
      localStorage.setItem("sonexa_recent_tracks", JSON.stringify(updated));
      return updated;
    });

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    } else {
      setQueue(prev => prev.length === 0 ? [song] : prev);
    }
  }, []);

  const playNext = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % queue.length;
      playSong(queue[nextIndex], queue);
    }
  }, [currentSong, queue, playSong]);

  const playPrevious = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      playSong(queue[prevIndex], queue);
    }
  }, [currentSong, queue, playSong]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const stopSong = useCallback(() => {
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
  }, []);

  const clearHistory = useCallback(() => {
    setRecentHistory([]);
    localStorage.removeItem("sonexa_recent_tracks");
    localStorage.removeItem("sonexa_playback_history");
  }, []);

  const contextValue = useMemo(() => ({
    currentSong,
    isPlaying,
    queue,
    recentHistory,
    playSong,
    playNext,
    playPrevious,
    togglePlay,
    stopSong,
    clearHistory,
    setIsPlaying,
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
  }), [currentSong, isPlaying, queue, recentHistory, isFullscreenPlayerOpen, playSong, playNext, playPrevious, togglePlay, stopSong, clearHistory]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};
