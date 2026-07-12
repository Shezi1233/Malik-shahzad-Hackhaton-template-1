"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";

interface OrderItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

interface Order {
  id: number;
  status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "text-green-600 bg-green-50";
    case "shipped":
      return "text-blue-600 bg-blue-50";
    case "processing":
      return "text-yellow-600 bg-yellow-50";
    case "pending":
      return "text-gray-600 bg-gray-100";
    case "cancelled":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>({});

  // Expanded orders for item details
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  // Sort
  const [sortField, setSortField] = useState<"id" | "total" | "status" | "created_at">(
    "id"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<Order[]>("/admin/orders")
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtered & sorted orders
  const filteredOrders = orders
    .filter((o) => {
      const matchSearch =
        String(o.id).includes(search) ||
        o.shipping_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.shipping_email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "total") return (a.total - b.total) * dir;
      if (sortField === "status")
        return a.status.localeCompare(b.status) * dir;
      if (sortField === "created_at") {
        return (
          (new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()) *
          dir
        );
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

  const toggleExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Update order status
  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      const updated = await api.put<Order>(
        `/admin/orders/${orderId}/status`,
        { status: newStatus }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch (err: any) {
      alert("Failed to update order status: " + err.message);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Get next suggested status based on current
  const getNextStatus = (current: string) => {
    const idx = STATUSES.indexOf(current);
    if (idx >= 0 && idx < STATUSES.length - 1) return STATUSES[idx + 1];
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 self-end sm:self-auto"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order #, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && (
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
              <p>
                {search || statusFilter !== "all"
                  ? "No orders match your filters"
                  : "No orders yet"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight
                            size={16}
                            className={`text-gray-400 transition-transform ${
                              expandedOrders[order.id] ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.shipping_name} &middot;{" "}
                            {order.shipping_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status badge and update */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updatingStatus[order.id]}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>

                      {updatingStatus[order.id] && (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Order Summary Info */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm text-gray-500">
                    <span>
                      Total:{" "}
                      <span className="font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Items:{" "}
                      <span className="font-medium text-gray-700">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                      </span>
                    </span>
                    <span>
                      Date:{" "}
                      <span className="font-medium text-gray-700">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <span>
                      Payment:{" "}
                      <span className="font-medium text-gray-700 capitalize">
                        {order.payment_method}
                      </span>
                    </span>
                  </div>

                  {/* Quick action buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    {getNextStatus(order.status) && order.status !== "cancelled" && (
                      <button
                        onClick={() =>
                          updateStatus(order.id, getNextStatus(order.status)!)
                        }
                        disabled={updatingStatus[order.id]}
                        className="px-3 py-1 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                      >
                        Mark as{" "}
                        {getNextStatus(order.status)!.charAt(0).toUpperCase() +
                          getNextStatus(order.status)!.slice(1)}
                      </button>
                    )}
                    {(order.status === "pending" ||
                      order.status === "processing") && (
                      <button
                        onClick={() => updateStatus(order.id, "cancelled")}
                        disabled={updatingStatus[order.id]}
                        className="px-3 py-1 border border-red-200 text-red-600 rounded-full text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrders[order.id] && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="p-4 sm:p-6">
                      {/* Shipping Details */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Shipping Details
                        </h4>
                        <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                          <p className="text-gray-900 font-medium">
                            {order.shipping_name}
                          </p>
                          <p className="text-gray-500">{order.shipping_email}</p>
                          <p className="text-gray-600 mt-1">
                            {order.shipping_address}
                          </p>
                          <p className="text-gray-600">
                            {order.shipping_city},{" "}
                            {order.shipping_postal_code},{" "}
                            {order.shipping_country}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Items ({order.items.length})
                        </h4>
                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {item.quantity}
                                  {item.size && ` | Size: ${item.size}`}
                                  {item.color && ` | Color: ${item.color}`}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-gray-900 ml-4">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Total Breakdown */}
                      <div className="mt-4 flex justify-end">
                        <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm w-full max-w-xs">
                          <div className="flex justify-between py-1">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-900">
                              ${order.subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-500">Discount</span>
                            <span className="text-green-600">
                              -${order.discount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-500">Delivery</span>
                            <span className="text-gray-900">
                              ${order.delivery_fee.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-t border-gray-100 mt-1 pt-2 font-semibold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
