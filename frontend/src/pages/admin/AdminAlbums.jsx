import { useEffect, useState } from "react";
import { getAdminAlbums, deleteAdminAlbum } from "../../services/adminService";
import AdminPagination from "../../components/common/AdminPagination";


const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAlbums = async (q = "", pageNum = 1) => {
    setLoading(true);
    try {
      const data = await getAdminAlbums(q, pageNum);
      setAlbums(data.data || data); 
      setTotalPages(data.last_page || 1);
      setPage(data.current_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAlbums(search, 1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id) => {
    if (confirm("DANGER: Are you sure you want to delete this album?")) {
      try {
        await deleteAdminAlbum(id);
        fetchAlbums(search, page);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Manage Published Albums</h2>
          <p className="text-xs text-slate-400 mt-1">Review album releases, track counts, and moderate catalog publications.</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            type="text"
            placeholder="Search albums..."
            className="px-4 py-2.5 rounded-2xl glass-card text-white border border-white/5 focus:outline-none focus:border-[#6C63FF] text-xs placeholder:text-slate-500 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Artist</th>
              <th className="px-6 py-4">Tracks</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-400 animate-pulse font-semibold">Loading albums...</td></tr>
            ) : albums.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-500 font-semibold">No albums found.</td></tr>
            ) : (
              albums.map(album => (
                <tr key={album._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{album.title}</td>
                  <td className="px-6 py-4 text-[#6C63FF] font-semibold">{album.artist_ref?.username || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-bold text-[11px]">
                      {album.musics?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(album._id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold transition-transform hover:scale-105 active:scale-95"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && albums.length > 0 && (
        <AdminPagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={(newPage) => fetchAlbums(search, newPage)} 
        />
      )}
    </div>
  );
};

export default AdminAlbums;
