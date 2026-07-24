import { useState, useEffect, useRef } from "react";
import { FiSearch, FiMusic, FiDisc, FiUser, FiX, FiLoader } from "react-icons/fi";
import { Link } from "react-router-dom";
import { globalSearch } from "../../services/musicService";
import { usePlayer } from "../../context/PlayerContext";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ music: [], albums: [], artists: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const { playSong } = usePlayer();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ music: [], albums: [], artists: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await globalSearch(query);
        if (response.success) {
          setResults(response.results);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults({ music: [], albums: [], artists: [] });
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const hasResults = results.music.length > 0 || results.albums.length > 0 || results.artists.length > 0;

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
      <div className="relative flex items-center w-full h-10 rounded-full bg-surface hover:bg-surface-hover border border-border overflow-hidden transition-colors">
        <div className="pl-3 pr-2 text-text-secondary">
          <FiSearch className="text-lg" />
        </div>
        <input
          type="text"
          placeholder="Search for music, albums, or artists..."
          className="flex-1 h-full bg-transparent border-none outline-none text-sm text-white placeholder:text-text-secondary pr-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="px-3 text-text-secondary hover:text-white"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Dropdown Overlay */}
      {isOpen && query.trim() && (
        <div className="absolute top-12 left-0 w-full max-h-[70vh] overflow-y-auto bg-surface rounded-xl border border-border shadow-2xl z-50 p-2 scrollbar-thin">
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-secondary gap-3">
              <FiLoader className="text-2xl animate-spin text-primary" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-secondary text-center px-4">
              <FiSearch className="text-3xl mb-3 opacity-50" />
              <p className="text-sm font-medium text-white mb-1">No results found for "{query}"</p>
              <p className="text-xs">No matching music, albums, or artists found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Songs Section */}
              {results.music.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
                    <FiMusic /> Songs
                  </h3>
                  <div className="flex flex-col gap-1">
                    {results.music.map((song) => (
                      <button 
                        key={song._id}
                        onClick={() => {
                          playSong({ id: song._id, _id: song._id, title: song.title, artist: song.artist, uri: song.uri });
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full text-left gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors group"
                      >
                        <div className="w-10 h-10 rounded bg-surface-hover flex items-center justify-center shrink-0">
                          <FiMusic className="text-text-secondary group-hover:text-primary" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold text-white truncate">{song.title}</span>
                          <span className="text-xs text-text-secondary truncate">{song.artist}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Albums Section */}
              {results.albums.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 mb-2 flex items-center gap-2 mt-2">
                    <FiDisc /> Albums
                  </h3>
                  <div className="flex flex-col gap-1">
                    {results.albums.map((album) => (
                      <Link 
                        key={album._id}
                        to={`/album/${album._id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-md bg-surface-hover flex items-center justify-center shrink-0">
                          <FiDisc className="text-text-secondary group-hover:text-primary" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold text-white truncate">{album.title}</span>
                          <span className="text-xs text-text-secondary truncate">{album.artist}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Artists Section */}
              {results.artists.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 mb-2 flex items-center gap-2 mt-2">
                    <FiUser /> Artists
                  </h3>
                  <div className="flex flex-col gap-1">
                    {results.artists.map((artist) => (
                      <div 
                        key={artist._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center shrink-0 border border-border">
                          <FiUser className="text-text-secondary" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold text-white truncate">{artist.username}</span>
                          <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Artist</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
