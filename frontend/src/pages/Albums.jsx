import { useEffect, useState } from "react";
import AlbumCard from "../components/album/AlbumCard";
import AlbumCardSkeleton from "../components/common/AlbumCardSkeleton";
import { getAllAlbums } from "../services/musicService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { FiDisc } from "react-icons/fi";
import useAuth from "../context/useAuth";

const Albums = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAlbums = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const data = await getAllAlbums(pageNum, 18);
      
      const newAlbums = data?.data || [];
      const current_page = data?.current_page || 1;
      const last_page = data?.last_page || 1;
      
      setAlbums(prev => pageNum === 1 ? newAlbums : [...prev, ...newAlbums]);
      setHasMore(current_page < last_page);
      setPage(current_page);
    } catch (err) {
      console.error(err);
      if (pageNum === 1) setError("Failed to load albums. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore && activeTab === "all") {
      fetchAlbums(page + 1);
    }
  };

  const lastElementRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  useEffect(() => {
    fetchAlbums();
  }, []);

  if (loading && page === 1) {
    return (
      <div className="flex flex-col gap-6 pb-12 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FiDisc className="text-2xl text-[#6C63FF]" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Albums & Collections</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => <AlbumCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
        <h1 className="text-red-500 text-2xl font-bold">Oops!</h1>
        <p className="text-text-secondary">{error}</p>
        <button 
          onClick={fetchAlbums}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-black transition hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredAlbums = albums.filter((album) => {
    if (activeTab === "my" && user) {
      const currentId = user._id || user.id;
      return (
        album.artist?._id === currentId ||
        album.artist?.id === currentId ||
        album.artist === currentId
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <FiDisc className="text-2xl text-[#6C63FF]" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Albums & Collections</h1>
        </div>
        
        {user?.role === "artist" && (
          <div className="flex items-center p-1.5 rounded-2xl glass-card border border-white/5 gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all" ? "bg-[#6C63FF] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              All Albums
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "my" ? "bg-[#6C63FF] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              My Albums
            </button>
          </div>
        )}
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-4 text-center mt-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-hover mb-2">
            <FiDisc className="text-5xl text-text-secondary/50" />
          </div>
          <h2 className="text-2xl font-bold text-white">No albums found</h2>
          <p className="text-text-secondary max-w-sm">
            {activeTab === "my" 
              ? "You haven't created any albums yet."
              : "It looks like no albums have been created yet. Check back later or ask an artist to compile their tracks!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredAlbums.map((album, index) => {
            if (filteredAlbums.length === index + 1 && activeTab === "all") {
              return (
                <div ref={lastElementRef} key={album._id}>
                  <AlbumCard 
                    album={{ 
                      id: album._id, 
                      title: album.title, 
                      artist: album.artist?.username || "Unknown Artist" 
                    }} 
                  />
                </div>
              );
            } else {
              return (
                <AlbumCard 
                  key={album._id} 
                  album={{ 
                    id: album._id, 
                    title: album.title, 
                    artist: album.artist?.username || "Unknown Artist" 
                  }} 
                />
              );
            }
          })}
          {loadingMore && activeTab === "all" && [...Array(6)].map((_, i) => <AlbumCardSkeleton key={`skeleton-${i}`} />)}
        </div>
      )}
    </div>
  );
};

export default Albums;
