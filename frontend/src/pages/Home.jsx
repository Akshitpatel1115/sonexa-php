import MusicCard from "../components/music/MusicCard";
import MusicCardSkeleton from "../components/common/MusicCardSkeleton";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import { getAllMusic } from "../services/musicService";
import { FiGrid, FiList, FiMusic, FiArrowRight, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

const Home = () => {
  const [viewMode, setViewMode] = useState("grid");

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentSong, isPlaying, playSong, togglePlay, recentHistory } = usePlayer();

  const musicsRef = useRef(musics);
  useEffect(() => {
    musicsRef.current = musics;
  }, [musics]);

  const handlePlay = useCallback((song) => {
    playSong(song, musicsRef.current);
  }, [playSong]);

  const handlePause = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      
      const data = await getAllMusic(1, 12);
      
      const newMusics = data?.data || [];
      
      setMusics(newMusics);
    } catch (err) {
      console.error(err);
      setError("Failed to load music. Please try again later.");
    } finally {
      setLoading(false);
    }
  };



  const handleTrackDelete = (deletedId) => {
    setMusics((prev) => prev.filter(song => song._id !== deletedId));
  };

  useEffect(() => {
    fetchMusic();
  }, [])



  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
        <h1 className="text-red-500 text-2xl font-bold">Oops!</h1>
        <p className="text-text-secondary">{error}</p>
        <button 
          onClick={fetchMusic}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-black transition hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 pt-2">
      {/* 0. Recently Played (Only visible if history exists) */}
      {recentHistory && recentHistory.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FiClock className="text-xl text-[#6C63FF]" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">Recently Played</h2>
            </div>
          </div>
          
          <div className={viewMode === "grid" 
            ? "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
            : "flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }>
            {recentHistory.map((song) => (
              <MusicCard 
                key={song._id} 
                song={song} 
                viewMode={viewMode} 
                onDelete={handleTrackDelete}
                isCurrentSong={currentSong?._id === song._id}
                isCurrentlyPlaying={currentSong?._id === song._id && isPlaying}
                onPlay={() => handlePlay(song)}
                onPause={handlePause}
              />
            ))}
          </div>
        </section>
      )}

      {/* 1. Trending Playlist Glass Hero Banner (from reference HomePage.jsx) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Trending Playlists</h2>
          </div>
        </div>

        <div className="relative w-full rounded-3xl p-6 sm:p-8 glass-panel border border-white/5 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/30 via-[#8B5CF6]/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col max-w-lg">
            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#6C63FF] text-white rounded-full w-fit mb-3 shadow-md shadow-[#6C63FF]/40">
              Featured Playlist
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Global Hits 2026</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2 leading-relaxed">
              Experience the top trending tracks worldwide with spatial sound precision, updated hourly on Sonexa.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link 
                to="/album"
                className="px-6 py-3 rounded-2xl bg-[#6C63FF] hover:bg-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/40 border border-white/5 cursor-pointer hover:scale-105 transition-all"
              >
                Listen Now
              </Link>
              <button className="px-5 py-3 rounded-2xl glass-card text-white text-xs font-bold hover:bg-white/20 transition-all cursor-pointer">
                Save to Library
              </button>
            </div>
          </div>

          <div className="relative z-10 w-32 h-32 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/5 shrink-0 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" 
              alt="Global Hits" 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 2. Discover / All Tracks */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎵</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Discover Tracks</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/musics" 
              className="group flex items-center gap-1.5 text-xs font-bold text-[#6C63FF] hover:text-[#8B5CF6] transition-colors"
            >
              View More <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex md:hidden items-center gap-1 glass-card p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#6C63FF] text-white" : "text-slate-400"}`}
              >
                <FiGrid />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-[#6C63FF] text-white" : "text-slate-400"}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
            : "flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }>
            {[...Array(12)].map((_, i) => <MusicCardSkeleton key={`skeleton-${i}`} viewMode={viewMode} />)}
          </div>
        ) : musics.length === 0 ? (
          <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-4 text-center mt-6 glass-panel rounded-3xl p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 mb-2">
              <FiMusic className="text-4xl text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">No tracks found</h2>
            <p className="text-slate-300 max-w-sm text-sm">
              It looks like no music has been uploaded yet. Check back later or ask an artist to upload some tracks!
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
            : "flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }>
            {musics.map((song) => (
              <MusicCard 
                key={song._id} 
                song={song} 
                viewMode={viewMode} 
                onDelete={handleTrackDelete}
                isCurrentSong={currentSong?._id === song._id}
                isCurrentlyPlaying={currentSong?._id === song._id && isPlaying}
                onPlay={() => handlePlay(song)}
                onPause={handlePause}
              />
            ))}
          </div>
        )}
        

      </section>
    </div>
  );
};

export default Home;
