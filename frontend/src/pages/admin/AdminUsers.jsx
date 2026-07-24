import { useEffect, useState } from "react";
import { getAdminUsers, blockUser, unblockUser, deleteUser } from "../../services/adminService";


const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async (q = "") => {
    setLoading(true);
    try {
      const data = await getAdminUsers(q);
      setUsers(data.data || data); // handle pagination
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleBlock = async (id, isBlocked) => {
    if (confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) {
      try {
        if (isBlocked) await unblockUser(id);
        else await blockUser(id);
        fetchUsers(search);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("DANGER: Are you sure you want to delete this user completely?")) {
      try {
        await deleteUser(id);
        fetchUsers(search);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Users</h2>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <input
              type="text"
              placeholder="Search users..."
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
              <tr><td colSpan="5" className="text-center py-8">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8">No users found.</td></tr>
            ) : (
              users.map(user => {
                const isBlocked = user.authBlock && (user.authBlock.isBlocked === true || !!user.authBlock.blockedUntil);
                return (
                  <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-mono text-xs">{user._id}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {isBlocked ? (
                        <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded-full text-xs">Blocked</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded-full text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button 
                        onClick={() => handleBlock(user._id, isBlocked)}
                        className={`px-3 py-1 rounded text-white text-xs ${isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                      >
                        {isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                      >
                        Delete
                      </button>
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

export default AdminUsers;
