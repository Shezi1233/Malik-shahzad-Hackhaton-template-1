"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { RefreshCw, Plus, X, Tag, CheckCircle } from "lucide-react";

interface PromoCode {
  id: number;
  code: string;
  discount_amount: number;
  is_active: boolean;
  usage_limit: number;
  used_count: number;
  created_at: string;
}

export default function AdminPromoCodes() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newLimit, setNewLimit] = useState("100");
  const [saving, setSaving] = useState(false);

  const fetchPromos = () => {
    setLoading(true);
    setError("");
    api
      .get<PromoCode[]>("/promocodes")
      .then(setPromos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPromos(); }, []);

  const toggleActive = async (promo: PromoCode) => {
    try {
      const updated = await api.put<PromoCode>(`/promocodes/${promo.id}`, {
        is_active: !promo.is_active,
      });
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? updated : p)));
    } catch { /* silent */ }
  };

  const deletePromo = async (id: number) => {
    if (!confirm("Delete this promo code?")) return;
    try {
      await api.delete(`/promocodes/${id}`);
      setPromos((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silent */ }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newDiscount) return;
    setSaving(true);
    try {
      const promo = await api.post<PromoCode>("/promocodes", {
        code: newCode.trim().toUpperCase(),
        discount_amount: parseFloat(newDiscount),
        usage_limit: parseInt(newLimit) || 0,
      });
      setPromos((prev) => [promo, ...prev]);
      setShowAdd(false);
      setNewCode("");
      setNewDiscount("");
      setNewLimit("100");
    } catch (err: any) {
      alert(err.message || "Failed to create promo code");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-1">{promos.length} codes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPromos} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Code
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchPromos} className="bg-black text-white px-6 py-2 rounded-full text-sm">Retry</button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {promos.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <Tag size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No promo codes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {promos.map((promo) => (
                <div key={promo.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{promo.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${promo.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                          {promo.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        ${promo.discount_amount} off &middot; Used {promo.used_count}/{promo.usage_limit || "∞"} times
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(promo)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        promo.is_active ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {promo.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => deletePromo(promo.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Promo Code</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="SUMMER50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount ($)</label>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="30"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (0 = unlimited)</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
              >
                {saving ? "Creating..." : "Create Promo Code"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
