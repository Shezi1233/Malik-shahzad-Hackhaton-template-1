"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCw,
  TrendingUp,
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
  monthly_sales: Array<{ month: string; total: number }>;
  top_products: Array<{ id: number; title: string; total_sold: number; revenue: number }>;
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

function MiniBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (!data.length) return <p className="text-gray-400 text-sm py-4 text-center">No sales data yet</p>;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 h-32 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 font-medium">
            ${d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value.toFixed(0)}
          </span>
          <div
            className="w-full bg-black/80 hover:bg-black rounded-t transition-all cursor-pointer"
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            title={`${d.label}: $${d.value.toFixed(2)}`}
          />
          <span className="text-[10px] text-gray-500 rotate-45 origin-left whitespace-nowrap">
            {d.label.slice(5)}
          </span>
        </div>
      ))}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-32 bg-gray-100 rounded" />
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

  const chartData = (data.monthly_sales || []).map((s) => ({
    label: s.month,
    value: s.total,
  }));

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
        <StatCard title="Total Products" value={data.total_products} icon={Package} color="bg-blue-600" />
        <StatCard title="Total Orders" value={data.total_orders} icon={ShoppingCart} color="bg-green-600" />
        <StatCard title="Total Users" value={data.total_users} icon={Users} color="bg-purple-600" />
        <StatCard title="Total Revenue" value={`$${data.total_revenue.toFixed(2)}`} icon={DollarSign} color="bg-orange-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Monthly Sales</h2>
          </div>
          <MiniBarChart data={chartData} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          {(!data.top_products || data.top_products.length === 0) ? (
            <p className="text-gray-400 text-sm py-4 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.top_products.slice(0, 6).map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-xs text-gray-400">{product.total_sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
