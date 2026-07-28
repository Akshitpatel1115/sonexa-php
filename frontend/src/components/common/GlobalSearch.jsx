import { useState, useEffect, useRef } from "react";
import { FiSearch, FiMusic, FiDisc, FiUser, FiX, FiLoader } from "react-icons/fi";
import { Link } from "react-router-dom";
import { globalSearch } from "../../services/musicService";
import { usePlayer } from "../../context/PlayerContext";
import { useDebounce } from "../../hooks/useDebounce";

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

  const debouncedQuery = useDebounce(query, 600);

  // Update searching state immediately on typing so UI shows loading
  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      setIsOpen(true);
    } else {
      setResults({ music: [], albums: [], artists: [] });
      setIsSearching(false);
      setIsOpen(false);
    }
  }, [query]);

  // Actually search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) return;

    const controller = new AbortController();

    const performSearch = async () => {
      try {
        const response = await globalSearch(debouncedQuery, controller.signal);
        if (response.success) {
          setResults(response.results);
        }
      } catch (error) {
        if (error.name === 'CanceledError' || error.message === 'canceled') {
          return; // Ignore canceled requests
        }
        console.error("Search failed:", error);
        setResults({ music: [], albums: [], artists: [] });
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    performSearch();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const hasResults = results.music.length > 0 || results.albums.length > 0 || results.artists.length > 0;

  return (
    <div className="relative w-full max-w-md mx-auto" ref={searchRef}>
      <div className="relative flex items-center w-full h-10 rounded-full glass-card hover:border-[#6C63FF]/50 border border-white/5 overflow-hidden transition-all shadow-md">
        <div className="pl-3.5 pr-2 text-slate-400">
          <FiSearch className="text-base" />
        </div>
        <input
          type="text"
          placeholder="Search for music, albums, or artists..."
          className="flex-1 h-full bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-400 pr-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="px-3 text-slate-400 hover:text-white transition-colors"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Dropdown Overlay */}
      {isOpen && query.trim() && (
        <div className="absolute top-12 left-0 w-full max-h-[70vh] overflow-y-auto glass-panel rounded-2xl border border-white/5 shadow-2xl z-50 p-3 custom-scrollbar">
          
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
