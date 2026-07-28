import React from "react";
import { Link } from "react-router-dom";
import { FiDisc } from "react-icons/fi";

const AlbumCard = React.memo(({ album = {} }) => {
  const id = album._id || album.id || "1";
  const title = album.title || "Untitled Album";
  const artist = typeof album.artist === "object"
    ? (album.artist?.username || album.artist?.name || "Unknown Artist")
    : (album.artist_ref?.username || album.artist || "Unknown Artist");

  return (
    <Link 
      to={`/album/${id}`}
      className="group relative flex flex-col p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl glass-card hover:border-[#6C63FF]/40 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1.5 block"
    >
      {/* Icon Artwork Placeholder */}
      <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-black/40 border border-white/5 mb-3 shadow-lg">
        {album.cover_img ? (
          <img 
            src={album.cover_img} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <FiDisc className={`text-6xl text-slate-400 group-hover:text-[#6C63FF] transition-all duration-500 group-hover:scale-110 group-hover:rotate-45 ${album.cover_img ? 'hidden' : 'block'}`} />
        
        {/* Subtle Glow Overlay on hover */}
        <div className="absolute inset-0 bg-[#6C63FF]/0 transition-colors duration-300 group-hover:bg-[#6C63FF]/10" />
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h3 className="truncate text-xs sm:text-sm font-bold text-white group-hover:text-[#6C63FF] transition-colors duration-300">
          {title}
        </h3>
        <p className="truncate text-[10px] sm:text-xs text-slate-400 mt-0.5">
          {artist}
        </p>
      </div>
    </Link>
  );
});

export default AlbumCard;
