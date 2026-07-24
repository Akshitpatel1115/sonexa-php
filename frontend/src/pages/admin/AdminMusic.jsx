import { useEffect, useState } from "react";
import { getAdminMusic, deleteAdminMusic } from "../../services/adminService";


const AdminMusic = () => {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMusic = async (q = "") => {
    setLoading(true);
    try {
      const data = await getAdminMusic(q);
      setMusics(data.data || data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMusic(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id) => {
    if (confirm("DANGER: Are you sure you want to delete this track? It will be removed from all albums.")) {
      try {
        await deleteAdminMusic(id);
        fetchMusic(search);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Music</h2>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            type="text"
            placeholder="Search music..."
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-700 text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4 border-b border-gray-600">ID</th>
              <th className="px-6 py-4 border-b border-gray-600">Title</th>
              <th className="px-6 py-4 border-b border-gray-600">Artist</th>
              <th className="px-6 py-4 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8">Loading music...</td></tr>
            ) : musics.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8">No tracks found.</td></tr>
            ) : (
              musics.map(track => (
                <tr key={track._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-mono text-xs">{track._id}</td>
                  <td className="px-6 py-4 font-semibold">{track.title}</td>
                  <td className="px-6 py-4">{track.artist_ref?.username || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(track._id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
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
    </div>
  );
};

export default AdminMusic;
