import { useEffect, useState } from "react";
import { getAdminUsers, blockUser, unblockUser, deleteUser } from "../../services/adminService";
import AdminPagination from "../../components/common/AdminPagination";


const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (q = "", pageNum = 1) => {
    setLoading(true);
    try {
      const data = await getAdminUsers(q, pageNum);
      setUsers(data.data || data); // handle pagination
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
      fetchUsers(search, 1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleBlock = async (id, isBlocked) => {
    if (confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) {
      try {
        if (isBlocked) await unblockUser(id);
        else await blockUser(id);
        fetchUsers(search, page);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("DANGER: Are you sure you want to delete this user completely?")) {
      try {
        await deleteUser(id);
        fetchUsers(search, page);
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Manage System Users</h2>
          <p className="text-xs text-slate-400 mt-1">Review user accounts, status badges, and moderate access.</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            type="text"
            placeholder="Search users by name..."
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
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-400 animate-pulse font-semibold">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-500 font-semibold">No users found.</td></tr>
            ) : (
              users.map(user => {
                const isBlocked = user.authBlock && (user.authBlock.isBlocked === true || !!user.authBlock.blockedUntil);
                return (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{user.username}</td>
                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      {isBlocked ? (
                        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-bold">Blocked</span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleBlock(user._id, isBlocked)}
                        className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 border ${
                          isBlocked 
                            ? 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 border-emerald-500/40' 
                            : 'bg-amber-600/30 hover:bg-amber-600 text-amber-200 border-amber-500/40'
                        }`}
                      >
                        {isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold transition-transform hover:scale-105 active:scale-95"
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
      
      {!loading && users.length > 0 && (
        <AdminPagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={(newPage) => fetchUsers(search, newPage)} 
        />
      )}
    </div>
  );
};

export default AdminUsers;
