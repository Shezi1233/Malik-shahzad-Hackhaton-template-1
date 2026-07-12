"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/authContext";
import PrivateRoute from "@/components/PrivateRoute";
import { api } from "@/lib/api";

interface OrderItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  id: number;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  created_at: string;
  items: OrderItem[];
}

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    postal_code: user?.postal_code || "",
    country: user?.country || "",
  });

  useEffect(() => {
    api.get<Order[]>("/orders")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(form);
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "shipped": return "text-blue-600";
      case "delivered": return "text-green-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {message && (
        <div className={`p-3 rounded-md mb-4 text-sm ${message.includes("success") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-black font-medium hover:underline"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input name="postal_code" value={form.postal_code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input name="country" value={form.country} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Username</span>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Full Name</span>
              <p className="font-medium">{user?.full_name || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Phone</span>
              <p className="font-medium">{user?.phone || "—"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">Address</span>
              <p className="font-medium">{user?.address || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">City</span>
              <p className="font-medium">{user?.city || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Postal Code</span>
              <p className="font-medium">{user?.postal_code || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Country</span>
              <p className="font-medium">{user?.country || "—"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>

        {loading ? (
          <div className="animate-pulse text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Order #{order.id}</span>
                  <span className={`font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm mt-1">
                  {order.items.length} item(s) — <span className="font-bold">${order.total.toFixed(2)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <PrivateRoute>
      <ProfileContent />
    </PrivateRoute>
  );
}
