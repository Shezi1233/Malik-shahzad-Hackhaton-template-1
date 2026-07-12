"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCw,
} from "lucide-react";

interface DashboardData {
  total_products: number;
  total_orders: number;
  total_users: number;
  total_revenue: number;
  recent_orders: Array<{
    id: number;
    status: string;
    total: number;
    created_at: string;
    shipping_name: string;
    items: Array<{ id: number; title: string; quantity: number }>;
  }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered": return "text-green-600 bg-green-50";
    case "shipped": return "text-blue-600 bg-blue-50";
    case "processing": return "text-yellow-600 bg-yellow-50";
    case "pending": return "text-gray-600 bg-gray-50";
    case "cancelled": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = () => {
    setLoading(true);
    setError("");
    api
      .get<DashboardData>("/admin/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 inline-flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboard}
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={data.total_products}
          icon={Package}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={data.total_orders}
          icon={ShoppingCart}
          color="bg-green-600"
        />
        <StatCard
          title="Total Users"
          value={data.total_users}
          icon={Users}
          color="bg-purple-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${data.total_revenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-orange-600"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>

        {data.recent_orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left p-4 font-medium">Order #</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 font-medium">#{order.id}</td>
                    <td className="p-4 text-gray-600">{order.shipping_name}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium">${order.total.toFixed(2)}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
