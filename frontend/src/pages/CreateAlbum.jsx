import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAlbum, getAllMusic, deleteMusic, getAllAlbums } from "../services/musicService";
import { FiMusic, FiCheck, FiLoader, FiTrash2 } from "react-icons/fi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../context/useAuth";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/common/ConfirmDialog";

const CreateAlbum = () => {
  const { user } = useAuth();
  const [albumData, setAlbumData] = useState({
    title: "",
  });
  
  const [artistTracks, setArtistTracks] = useState([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState(new Set());
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  
  const { currentSong, stopSong } = usePlayer();
  const toast = useToast();
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistTracks = async () => {
      try {
        const allMusics = await getAllMusic();
        // Filter by current artist's ID
        const currentId = user?._id || user?.id;
        const myTracks = allMusics.filter(
          (track) => track.artist?._id === currentId || track.artist === currentId
        );
        setArtistTracks(myTracks);
      } catch (error) {
        console.error("Failed to load tracks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchArtistTracks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAlbumChange = (e) => {
    setAlbumData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleTrackSelection = (trackId) => {
    setSelectedTrackIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const initiateTrackDelete = async (e, trackId) => {
    e.stopPropagation();
    try {
      const albums = await getAllAlbums();
      const userId = user?._id ? user._id.toString() : user?.id?.toString();
      const myAlbums = albums.filter(a => {
        const aArtistId = a.artist?._id ? a.artist._id.toString() : a.artist?.toString();
        return aArtistId === userId;
      });
      const isInAlbum = myAlbums.some(album => 
        album.musics && album.musics.some(m => m === trackId || m._id === trackId)
      );

      setConfirmMessage(isInAlbum 
        ? "This track is currently in one or more of your albums. Deleting it will also remove it from those albums. Are you sure you want to delete it?"
        : "Are you sure you want to delete this track?"
      );
      setTrackToDelete(trackId);
    } catch (error) {
      console.error("Failed to check albums:", error);
      toast.error("Failed to verify albums before deletion.");
    }
  };

  const executeTrackDelete = async () => {
    if (!trackToDelete) return;
    try {
      await deleteMusic(trackToDelete);
      if (currentSong?._id === trackToDelete) {
        stopSong();
      }
      setArtistTracks(prev => prev.filter(t => t._id !== trackToDelete));
      setSelectedTrackIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackToDelete);
        return newSet;
      });
      toast.success("Track deleted successfully");
    } catch (error) {
      console.error("Failed to delete track:", error);
      toast.error(error.response?.data?.message || "Failed to delete track");
    } finally {
      setTrackToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!albumData.title || selectedTrackIds.size === 0) {
      toast.error("Please provide an album title and select at least one track.");
      return;
    }

    const formData = new FormData();
    formData.append("title", albumData.title);
    
    // Append each track ID individually since it's an array
    Array.from(selectedTrackIds).forEach((id, index) => {
      formData.append(`musics[${index}]`, id);
    });

    if (coverFile) {
      formData.append("cover_img", coverFile);
    }
    
    try {
      setIsSubmitting(true);
      await createAlbum(formData);
      toast.success("Album created successfully!");
      navigate("/album");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create album");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8 pb-16 flex flex-col gap-8">
      {/* Artist Studio Hero Banner */}
      <div className="relative w-full rounded-3xl p-6 sm:p-8 glass-panel border border-white/5 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl bg-gradient-to-r from-purple-900/40 via-indigo-950/60 to-slate-900/80">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center shadow-xl shrink-0">
            <FiMusic className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#6C63FF] text-white rounded-full">
                Artist Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Create New Album</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Compile your uploaded spatial tracks into a cohesive album collection.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Album Details Section */}
        <div className="rounded-3xl border border-white/5 glass-card p-6 shadow-xl sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-white">Album Information</h2>
          <div className="grid gap-6">
            <Input
              label="Album Title"
              name="title"
              placeholder="e.g. Hurry Up, We're Dreaming"
              value={albumData.title}
              onChange={handleAlbumChange}
              required
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Album Cover Art (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiMusic className="text-3xl text-slate-500" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-400 max-w-[200px]">
                    Upload a square image (e.g. 500x500px).
                  </p>
                  <label className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition-colors border border-white/5">
                    <span>{coverFile ? "Change Image" : "Upload Image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Selection Section */}
        <div className="rounded-3xl border border-white/5 glass-card p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Select Tracks</h2>
              <p className="text-sm text-slate-400 mt-1">Click to select tracks to include in this album collection.</p>
            </div>
            <div className="rounded-2xl bg-[#6C63FF] px-4 py-2 text-xs font-bold text-white shadow-md border border-white/5">
              {selectedTrackIds.size} Selected
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/5 py-12">
              <FiLoader className="mb-4 text-4xl text-[#6C63FF] animate-spin" />
              <p className="text-slate-400 font-medium">Loading your tracks...</p>
            </div>
          ) : artistTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/5 py-12 transition-colors">
              <FiMusic className="mb-4 text-5xl text-slate-400" />
              <p className="text-slate-400 font-medium">You haven't uploaded any tracks yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {artistTracks.map((track) => {
                const isSelected = selectedTrackIds.has(track._id);
                return (
                  <div 
                    key={track._id} 
                    onClick={() => toggleTrackSelection(track._id)}
                    className={`group flex items-center gap-4 rounded-2xl p-3.5 pl-4 border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "bg-[#6C63FF]/15 border-[#6C63FF]/50 shadow-sm" 
                        : "bg-white/5 border-white/5 hover:border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected ? "bg-[#6C63FF] border-[#6C63FF] text-white" : "border-slate-500 bg-transparent group-hover:border-white"
                    }`}>
                      {isSelected && <FiCheck strokeWidth={3} />}
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <span className={`truncate text-sm font-bold transition-colors ${isSelected ? "text-[#6C63FF]" : "text-white"}`}>
                        {track.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => initiateTrackDelete(e, track._id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Delete Track"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto px-16 py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#8B5CF6] text-white text-base font-bold shadow-xl shadow-[#6C63FF]/40 border border-white/5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing Album..." : "Publish Album to Catalog"}
          </Button>
        </div>
      </form>
      
      <ConfirmDialog 
        isOpen={Boolean(trackToDelete)}
        title="Delete Track"
        message={confirmMessage}
        onConfirm={executeTrackDelete}
        onCancel={() => setTrackToDelete(null)}
      />
    </div>
  );
};

export default CreateAlbum;

