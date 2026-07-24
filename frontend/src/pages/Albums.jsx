import { useEffect, useState } from "react";
import AlbumCard from "../components/album/AlbumCard";
import { getAllAlbums } from "../services/musicService";
import { FiDisc } from "react-icons/fi";
import useAuth from "../context/useAuth";

const Albums = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAlbums = async () => {
    try {
      const data = await getAllAlbums();
      setAlbums(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load albums. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <h1 className="text-white text-2xl font-semibold animate-pulse">Loading Albums...</h1>
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
    <div className="flex flex-col gap-6 pb-8 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Albums</h1>
        
        {user?.role === "artist" && (
          <div className="flex bg-surface-hover rounded-full p-1 border border-border">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === "all" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
              }`}
            >
              All Albums
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === "my" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
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
          {filteredAlbums.map((album) => (
            <AlbumCard 
              key={album._id} 
              album={{ 
                id: album._id, 
                title: album.title, 
                artist: album.artist?.username || "Unknown Artist" 
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Albums;
