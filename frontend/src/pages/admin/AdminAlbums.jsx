import { useEffect, useState } from "react";
import { getAdminAlbums, deleteAdminAlbum } from "../../services/adminService";


const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAlbums = async (q = "") => {
    setLoading(true);
    try {
      const data = await getAdminAlbums(q);
      setAlbums(data.data || data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAlbums(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id) => {
    if (confirm("DANGER: Are you sure you want to delete this album?")) {
      try {
        await deleteAdminAlbum(id);
        fetchAlbums(search);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Albums</h2>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            type="text"
            placeholder="Search albums..."
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
              <th className="px-6 py-4 border-b border-gray-600">Tracks</th>
              <th className="px-6 py-4 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading albums...</td></tr>
            ) : albums.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8">No albums found.</td></tr>
            ) : (
              albums.map(album => (
                <tr key={album._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-mono text-xs">{album._id}</td>
                  <td className="px-6 py-4 font-semibold">{album.title}</td>
                  <td className="px-6 py-4">{album.artist_ref?.username || 'Unknown'}</td>
                  <td className="px-6 py-4">{album.musics?.length || 0}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(album._id)}
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

export default AdminAlbums;
