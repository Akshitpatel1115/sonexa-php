import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlay, FiPause, FiDisc, FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getAlbumById, deleteAlbum } from "../services/musicService";
import { usePlayer } from "../context/PlayerContext";
import useAuth from "../context/useAuth";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/common/ConfirmDialog";

const AlbumDetails = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await getAlbumById(id);
        setAlbum(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load album details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <h1 className="text-white text-2xl font-semibold animate-pulse">Loading Album Details...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center pt-20 flex-col gap-4">
        <h1 className="text-red-500 text-2xl font-bold">Oops!</h1>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center pt-20">
        <h1 className="text-white text-xl">Album not found.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-12">
      {/* Hero Header Section */}
      <div className="relative flex flex-col items-start gap-6 glass-panel rounded-3xl p-6 sm:flex-row sm:items-end sm:p-8 lg:p-10 border border-white/5 overflow-hidden my-4 mx-4 sm:mx-8 lg:mx-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#6C63FF]/30 rounded-full blur-3xl pointer-events-none" />
        
        {/* Album Icon Artwork Placeholder */}
        <div className="h-44 w-44 sm:h-52 sm:w-52 md:h-60 md:w-60 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-black/40 border border-white/5 shadow-2xl z-10">
          <FiDisc className="text-7xl text-slate-400" />
        </div>

        {/* Album Info */}
        <div className="flex flex-col justify-end z-10">
          <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-widest">Album Collection</span>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl md:text-6xl truncate tracking-tight">
            {album.title}
          </h1>
          <div className="mt-4 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-300">
            <span className="text-white font-bold hover:underline cursor-pointer">{album.artist?.username || "Unknown Artist"}</span>
            <span className="text-slate-500">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/5 text-slate-300">{album.musics?.length || 0} songs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 px-4 py-4 sm:px-8 lg:px-10">
        <button 
          onClick={() => {
            if (album.musics?.length > 0) {
              const formattedQueue = album.musics.map(t => ({
                ...t,
                artist: typeof t.artist === "string" ? album.artist : (t.artist || album.artist)
              }));
              playSong(formattedQueue[0], formattedQueue);
            }
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6C63FF] hover:bg-[#8B5CF6] text-white transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#6C63FF]/50 border border-white/5 cursor-pointer"
        >
          <FiPlay className="ml-1 text-2xl fill-white" />
        </button>

        {user?.role === 'artist' && (user?._id === album.artist?._id || user?.id === album.artist?._id) && (
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <button
              onClick={() => navigate(`/album/edit/${album._id || album.id}`)}
              className="flex items-center justify-center h-10 w-10 rounded-2xl glass-card text-slate-300 hover:text-white hover:border-[#6C63FF]/50 transition-colors"
              title="Edit Album"
            >
              <FiEdit2 className="text-lg" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center h-10 w-10 rounded-2xl glass-card text-slate-300 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors"
              title="Delete Album"
            >
              <FiTrash2 className="text-lg" />
            </button>
          </div>
        )}
      </div>

      {/* Tracklist Table */}
      <div className="px-4 sm:px-8 lg:px-10 mt-2">
        <div className="mb-3 grid grid-cols-[auto_1fr_auto] gap-4 border-b border-white/5 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-4">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="pr-4">Actions</div>
        </div>

        <div className="flex flex-col gap-1.5">
          {album.musics.map((track, index) => {
            const isCurrentTrack = currentSong?._id === track._id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;
            
            return (
              <div 
                key={track._id} 
                onClick={() => {
                  if (isCurrentTrack) togglePlay();
                  else {
                    const formattedQueue = album.musics.map(t => ({
                      ...t,
                      artist: typeof t.artist === "string" ? album.artist : (t.artist || album.artist)
                    }));
                    
                    const trackToPlay = formattedQueue.find(t => t._id === track._id);
                    playSong(trackToPlay, formattedQueue);
                  }
                }}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer border ${
                  isCurrentTrack ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF]" : "border-transparent hover:bg-white/10 hover:border-white/5"
                }`}
              >
                {/* Index / Play Icon */}
                <div className="w-8 text-center flex justify-center">
                  {isCurrentlyPlaying ? (
                    <FiPause className="text-[#6C63FF] fill-current text-base" />
                  ) : isCurrentTrack ? (
                    <FiPlay className="text-[#6C63FF] fill-current text-base" />
                  ) : (
                    <>
                      <span className="text-slate-400 group-hover:hidden font-mono text-xs">{index + 1}</span>
                      <FiPlay className="hidden text-white group-hover:block fill-white text-base" />
                    </>
                  )}
                </div>
                
                {/* Title & Artist */}
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-sm font-bold truncate ${isCurrentTrack ? "text-[#6C63FF]" : "text-white"}`}>
                    {track.title}
                  </span>
                  <span className="text-xs text-slate-400 hover:underline hover:text-white transition-colors truncate mt-0.5">
                    {track.artist?.username || album.artist?.username || "Unknown Artist"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-slate-400 pr-4">
                  <FiHeart className="opacity-0 transition-opacity hover:text-white group-hover:opacity-100 hidden sm:block" />
                  <FiMoreHorizontal className="opacity-0 transition-opacity hover:text-white group-hover:opacity-100 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
        onConfirm={async () => {
          try {
            
            await deleteAlbum(album._id || album.id);
            toast.success("Album deleted successfully");
            navigate("/album");
          } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete album");
            setShowDeleteConfirm(false);
          } finally {
            
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default AlbumDetails;
