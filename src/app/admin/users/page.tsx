"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Shield,
  ShieldOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    user: AdminUser | null;
    deleting: boolean;
  }>({ show: false, user: null, deleting: false });

  // Sort
  const [sortField, setSortField] = useState<"id" | "username" | "email" | "created_at">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<AdminUser[]>("/admin/users")
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered & sorted users
  const filteredUsers = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(u.id).includes(search)
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "username") return a.username.localeCompare(b.username) * dir;
      if (sortField === "email") return a.email.localeCompare(b.email) * dir;
      if (sortField === "created_at") {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
      return (a.id - b.id) * dir;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="inline" />
    ) : (
      <ChevronDown size={14} className="inline" />
    );
  };

  // Delete user
  const confirmDelete = (user: AdminUser) => {
    setDeleteConfirm({ show: true, user, deleting: false });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.user) return;
    setDeleteConfirm((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/admin/users/${deleteConfirm.user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.user!.id));
      setDeleteConfirm({ show: false, user: null, deleting: false });
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
      setDeleteConfirm((prev) => ({ ...prev, deleting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p>{search ? "No users match your search" : "No users found"}</p>
            </div>
          ) : (
            <>
              {/* Mobile: Card view */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${user.is_admin ? "bg-black" : "bg-gray-400"}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{user.username}</span>
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-white rounded-full text-[10px] font-medium"><Shield size={10} />Admin</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium"><ShieldOff size={10} />User</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {!user.is_admin ? (
                        <button onClick={() => confirmDelete(user)} className="p-2 text-gray-400 hover:text-red-600" title="Delete user"><Trash2 size={16} /></button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Protected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: Table view */}
              <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500">
                    <th className="text-left p-4 font-medium">
                      <button
                        onClick={() => toggleSort("id")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        ID <SortIcon field="id" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <button
                        onClick={() => toggleSort("username")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Username <SortIcon field="username" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <button
                        onClick={() => toggleSort("email")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Email <SortIcon field="email" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-center p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">
                      <button
                        onClick={() => toggleSort("created_at")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Joined <SortIcon field="created_at" />
                      </button>
                    </th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-500 font-mono text-xs">
                        #{user.id}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              user.is_admin ? "bg-black" : "bg-gray-400"
                            }`}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4 text-gray-600">
                        {user.full_name || "—"}
                      </td>
                      <td className="p-4 text-center">
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white rounded-full text-xs font-medium">
                            <Shield size={12} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                            <ShieldOff size={12} />
                            User
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {!user.is_admin ? (
                          <button
                            onClick={() => confirmDelete(user)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm((prev) => ({ ...prev, show: false }))}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete User</h2>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete this user?
            </p>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {deleteConfirm.user.username}
            </p>
            <p className="text-xs text-gray-400 mb-6">{deleteConfirm.user.email}</p>
            <p className="text-xs text-red-500 mb-4">
              This will also delete all their orders, cart items, and notifications.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm((prev) => ({ ...prev, show: false }))}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                disabled={deleteConfirm.deleting}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={deleteConfirm.deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleteConfirm.deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
