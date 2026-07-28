import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMusic } from "../services/musicService";
import { FiUploadCloud, FiMusic } from "react-icons/fi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useToast } from "../context/ToastContext";

const CreateMusic = () => {
  const [musicData, setMusicData] = useState({
    title: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setMusicData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Auto-fill title if empty
      if (!musicData.title) {
        setMusicData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      toast.error("Please select an audio file.");
      return;
    }
    
    const formData = new FormData();
    formData.append("title", musicData.title);
    formData.append("music", audioFile);
    if (coverFile) {
      formData.append("cover_img", coverFile);
    }

    try {
      setIsSubmitting(true);
      await createMusic(formData);
      toast.success("Music uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload music");
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Upload New Track</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Add high-fidelity spatial sound tracks directly to your catalog.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Audio File Upload Dropzone */}
        <div className="rounded-3xl border border-white/5 glass-panel p-6 shadow-xl sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#6C63FF]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col items-center justify-center w-full gap-6 text-center rounded-2xl border-2 border-dashed border-white/5 bg-white/5 p-10 transition-colors hover:border-[#6C63FF]/50">
            <FiUploadCloud className="text-6xl text-[#6C63FF]" />
            
            {audioFile ? (
              <div className="w-full truncate text-lg font-bold text-white px-4">
                {audioFile.name}
              </div>
            ) : (
              <div className="text-slate-300">
                <p className="font-semibold text-white text-lg">Select an audio file</p>
                <p className="text-sm text-slate-400 mt-1">MP3, WAV, FLAC supported</p>
              </div>
            )}

            <label className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#6C63FF] hover:bg-[#8B5CF6] px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#6C63FF]/40 border border-white/5">
              <FiUploadCloud className="text-xl" />
              <span>{audioFile ? "Change File" : "Browse Files"}</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} required={!audioFile} />
            </label>
          </div>
        </div>

        {/* Track Details Section */}
        <div className="rounded-3xl border border-white/5 glass-card p-6 shadow-xl sm:p-8">
          <div className="grid gap-6">
            <Input
              label="Track Title"
              name="title"
              placeholder="e.g. Midnight City"
              value={musicData.title}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Cover Art (Optional)
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

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto px-16 py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#8B5CF6] text-white text-base font-bold shadow-xl shadow-[#6C63FF]/40 border border-white/5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Uploading Track..." : "Publish Track to Catalog"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMusic;
