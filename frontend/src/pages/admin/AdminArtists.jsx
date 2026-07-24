import { useEffect, useState } from "react";
import { getAdminArtists, approveArtist, suspendArtist, rejectArtist } from "../../services/adminService";


const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchArtists = async (q = "") => {
    setLoading(true);
    try {
      const data = await getAdminArtists(q);
      setArtists(data.data || data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArtists(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleToggleSuspend = async (id, isSuspended) => {
    if (confirm(`Are you sure you want to ${isSuspended ? 'approve/reactivate' : 'suspend'} this artist?`)) {
      try {
        if (isSuspended) await approveArtist(id);
        else await suspendArtist(id);
        fetchArtists(search);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  const handleReject = async (id) => {
    if (confirm(`Are you sure you want to completely reject and delete this pending artist?`)) {
      try {
        await rejectArtist(id);
        fetchArtists(search);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Artists</h2>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            type="text"
            placeholder="Search artists..."
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
              <th className="px-6 py-4 border-b border-gray-600">Username</th>
              <th className="px-6 py-4 border-b border-gray-600">Email</th>
              <th className="px-6 py-4 border-b border-gray-600">Status</th>
              <th className="px-6 py-4 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading artists...</td></tr>
            ) : artists.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8">No artists found.</td></tr>
            ) : (
              artists.map(artist => {
                const isSuspended = artist.authBlock && (artist.authBlock.isBlocked === true || !!artist.authBlock.blockedUntil);
                const isPending = artist.status === 'pending';
                
                return (
                  <tr key={artist._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-mono text-xs">{artist._id}</td>
                    <td className="px-6 py-4">{artist.username}</td>
                    <td className="px-6 py-4">{artist.email}</td>
                    <td className="px-6 py-4">
                      {isPending ? (
                        <span className="px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-xs">Pending</span>
                      ) : isSuspended ? (
                        <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded-full text-xs">Suspended</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded-full text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {isPending ? (
                        <>
                          <button 
                            onClick={() => handleToggleSuspend(artist._id, true)}
                            className="px-3 py-1 rounded text-white text-xs bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(artist._id)}
                            className="px-3 py-1 rounded text-white text-xs bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleToggleSuspend(artist._id, isSuspended)}
                          className={`px-3 py-1 rounded text-white text-xs ${isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminArtists;
