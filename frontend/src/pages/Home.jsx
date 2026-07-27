import MusicCard from "../components/music/MusicCard";
import MusicCardSkeleton from "../components/common/MusicCardSkeleton";
import { useEffect, useState } from "react";
import { getAllMusic } from "../services/musicService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { FiGrid, FiList, FiMusic } from "react-icons/fi";
import { Link } from "react-router-dom";

const Home = () => {
  const [viewMode, setViewMode] = useState("grid");

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMusic = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const data = await getAllMusic(pageNum, 12);
      
      const newMusics = data?.data || [];
      const current_page = data?.current_page || 1;
      const last_page = data?.last_page || 1;
      
      setMusics(prev => pageNum === 1 ? newMusics : [...prev, ...newMusics]);
      setHasMore(current_page < last_page);
      setPage(current_page);
    } catch (err) {
      console.error(err);
      if (pageNum === 1) setError("Failed to load music. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchMusic(page + 1);
    }
  };

  const lastElementRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  const handleTrackDelete = (deletedId) => {
    setMusics((prev) => prev.filter(song => song._id !== deletedId));
  };

  useEffect(() => {
    fetchMusic();
  }, [])

  if (loading && page === 1) {
    return (
      <div className="flex flex-col gap-8 pb-12 pt-2">
        <section className="flex flex-col gap-4">
           <div className="w-full h-64 sm:h-72 rounded-3xl glass-panel animate-pulse border border-white/5" />
        </section>
        <section className="flex flex-col gap-4">
           <div className="h-8 w-48 rounded bg-white/10 animate-pulse mb-2" />
           <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {[...Array(12)].map((_, i) => <MusicCardSkeleton key={i} viewMode={viewMode} />)}
           </div>
        </section>
      </div>
    );
  }

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

          <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/5 shrink-0 transform rotate-2 hover:rotate-0 transition-transform duration-500">
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

        {musics.length === 0 ? (
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
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
            : "flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }>
            {musics.map((song, index) => {
              if (musics.length === index + 1) {
                return (
                  <div ref={lastElementRef} key={song._id}>
                    <MusicCard song={song} queue={musics} viewMode={viewMode} onDelete={handleTrackDelete} />
                  </div>
                );
              } else {
                return <MusicCard key={song._id} song={song} queue={musics} viewMode={viewMode} onDelete={handleTrackDelete} />;
              }
            })}
            {loadingMore && [...Array(6)].map((_, i) => <MusicCardSkeleton key={`skeleton-${i}`} viewMode={viewMode} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
