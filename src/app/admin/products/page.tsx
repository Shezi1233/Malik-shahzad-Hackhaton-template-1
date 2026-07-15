"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  old_price: number | null;
  category: string;
  img_url: string;
  stock: number;
  rating: number;
}

interface EditProductData {
  title: string;
  price: number;
  old_price: number | null;
  stock: number;
  category: string;
  description: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    open: boolean;
    product: Product | null;
    data: EditProductData;
    saving: boolean;
  }>({ open: false, product: null, data: {} as EditProductData, saving: false });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    product: Product | null;
    deleting: boolean;
  }>({ show: false, product: null, deleting: false });

  // Add product state
  const [addModal, setAddModal] = useState<{
    open: boolean;
    saving: boolean;
    data: {
      title: string;
      price: string;
      old_price: string;
      stock: string;
      category: string;
      description: string;
      img_url: string;
    };
  }>({
    open: false,
    saving: false,
    data: {
      title: "",
      price: "",
      old_price: "",
      stock: "10",
      category: "new_arrivals",
      description: "",
      img_url: "/product1.png",
    },
  });

  const [uploading, setUploading] = useState(false);

  // Stock quick edit state
  const [stockEdits, setStockEdits] = useState<Record<number, number>>({});
  const [savingStock, setSavingStock] = useState<Record<number, boolean>>({});

  // Sort state
  const [sortField, setSortField] = useState<"id" | "title" | "price" | "stock">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<Product[]>("/admin/products")
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtered & sorted products
  const filteredProducts = products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search)
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "title") return a.title.localeCompare(b.title) * dir;
      if (sortField === "price") return (a.price - b.price) * dir;
      if (sortField === "stock") return (a.stock - b.stock) * dir;
      return (a.id - b.id) * dir;
    });

  // Toggle sort
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
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

  // Quick stock update
  const handleStockChange = (productId: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setStockEdits((prev) => ({ ...prev, [productId]: num }));
    }
  };

  const saveStock = async (product: Product) => {
    const newStock = stockEdits[product.id];
    if (newStock === undefined || newStock === product.stock) {
      setStockEdits((prev) => {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    setSavingStock((prev) => ({ ...prev, [product.id]: true }));
    try {
      const updated = await api.put<Product>(`/admin/products/${product.id}`, {
        stock: newStock,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: updated.stock } : p))
      );
      setStockEdits((prev) => {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      });
    } catch (err: any) {
      alert("Failed to update stock: " + err.message);
    } finally {
      setSavingStock((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Open edit modal
  const openEditModal = (product: Product) => {
    setEditModal({
      open: true,
      product,
      data: {
        title: product.title,
        price: product.price,
        old_price: product.old_price,
        stock: product.stock,
        category: product.category || "",
        description: "",
      },
      saving: false,
    });
    // Fetch full product details for description
    api
      .get<any>(`/admin/products`)
      .then((all) => {
        const full = all.find((p: any) => p.id === product.id);
        if (full?.description) {
          setEditModal((prev) => ({
            ...prev,
            data: { ...prev.data, description: full.description },
          }));
        }
      })
      .catch(() => {});
  };

  const handleEditChange = (field: keyof EditProductData, value: string | number | null) => {
    setEditModal((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  const saveEdit = async () => {
    if (!editModal.product) return;
    setEditModal((prev) => ({ ...prev, saving: true }));
    try {
      const updateData: Record<string, any> = {};
      if (editModal.data.title !== editModal.product.title) updateData.title = editModal.data.title;
      if (editModal.data.price !== editModal.product.price) updateData.price = editModal.data.price;
      if (editModal.data.old_price !== editModal.product.old_price) updateData.old_price = editModal.data.old_price;
      if (editModal.data.stock !== editModal.product.stock) updateData.stock = editModal.data.stock;
      if (editModal.data.category !== editModal.product.category) updateData.category = editModal.data.category;
      if (editModal.data.description) updateData.description = editModal.data.description;

      if (Object.keys(updateData).length === 0) {
        setEditModal((prev) => ({ ...prev, open: false }));
        return;
      }

      const updated = await api.put<Product>(
        `/admin/products/${editModal.product.id}`,
        updateData
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editModal.product!.id
            ? { ...p, ...updated }
            : p
        )
      );
      setEditModal((prev) => ({ ...prev, open: false }));
    } catch (err: any) {
      alert("Failed to update product: " + err.message);
    } finally {
      setEditModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Delete product
  const confirmDelete = (product: Product) => {
    setDeleteConfirm({ show: true, product, deleting: false });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.product) return;
    setDeleteConfirm((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/admin/products/${deleteConfirm.product.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.product!.id));
      setDeleteConfirm({ show: false, product: null, deleting: false });
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
      setDeleteConfirm((prev) => ({ ...prev, deleting: false }));
    }
  };

  // Add product handlers
  const resetAddForm = () => {
    setAddModal({
      open: false,
      saving: false,
      data: {
        title: "",
        price: "",
        old_price: "",
        stock: "10",
        category: "new_arrivals",
        description: "",
        img_url: "/product1.png",
      },
    });
    setUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );
      const result = await response.json();
      if (result.url) {
        setAddModal((prev) => ({
          ...prev,
          data: { ...prev.data, img_url: result.url },
        }));
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const createProduct = async () => {
    const { title, price, old_price, stock, category, description, img_url } = addModal.data;
    if (!title.trim() || !price) {
      alert("Title and Price are required");
      return;
    }

    setAddModal((prev) => ({ ...prev, saving: true }));
    try {
      const newProduct = await api.post<Product>("/admin/products", {
        title: title.trim(),
        price: parseFloat(price),
        old_price: old_price ? parseFloat(old_price) : null,
        stock: parseInt(stock) || 10,
        category,
        description: description.trim() || undefined,
        img_url: img_url || "/product1.png",
      });
      setProducts((prev) => [newProduct, ...prev]);
      resetAddForm();
    } catch (err: any) {
      alert("Failed to create product: " + err.message);
    } finally {
      setAddModal((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} total products
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
          <button
            onClick={() => setAddModal((prev) => ({ ...prev, open: true }))}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> Add Product
          </button>
          <button
            onClick={fetchProducts}
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
            onClick={fetchProducts}
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
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p>
                {search ? "No products match your search" : "No products found"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: Card view */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-[#F0EEED] overflow-hidden flex-shrink-0">
                        {product.img_url ? (
                          <Image
                            src={product.img_url}
                            alt={product.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            unoptimized
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{product.title}</p>
                        <p className="text-xs text-gray-400 truncate">{product.slug}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          ${product.price.toFixed(2)}
                          {product.old_price && (
                            <span className="text-gray-400 line-through ml-1 text-xs">${product.old_price.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-600" title="Edit"><Edit3 size={16} /></button>
                        <button onClick={() => confirmDelete(product)} className="p-2 text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{product.category?.replace(/_/g, " ")}</span>
                      <span className={`font-medium ${product.stock <= 0 ? "text-red-500" : product.stock <= 5 ? "text-orange-500" : "text-green-600"}`}>
                        {product.stock <= 0 ? "Out of stock" : `${product.stock} in stock`}
                      </span>
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
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">
                      <button
                        onClick={() => toggleSort("price")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Price <SortIcon field="price" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <button
                        onClick={() => toggleSort("stock")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Stock <SortIcon field="stock" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-500 font-mono text-xs">
                        #{product.id}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F0EEED] overflow-hidden flex-shrink-0">
                            {product.img_url ? (
                              <Image
                                src={product.img_url}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.old_price && (
                          <span className="text-gray-400 line-through ml-1 text-xs">
                            ${product.old_price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={
                              stockEdits[product.id] !== undefined
                                ? stockEdits[product.id]
                                : product.stock
                            }
                            onChange={(e) =>
                              handleStockChange(product.id, e.target.value)
                            }
                            className={`w-20 px-2 py-1.5 border rounded-lg text-sm text-center font-medium
                              ${
                                stockEdits[product.id] !== undefined &&
                                stockEdits[product.id] !== product.stock
                                  ? "border-blue-400 bg-blue-50"
                                  : "border-gray-200"
                              }
                              focus:outline-none focus:ring-2 focus:ring-blue-200`}
                          />
                          {stockEdits[product.id] !== undefined &&
                            stockEdits[product.id] !== product.stock && (
                              <button
                                onClick={() => saveStock(product)}
                                disabled={savingStock[product.id]}
                                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                              >
                                {savingStock[product.id] ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Save size={14} />
                                )}
                              </button>
                            )}
                        </div>
                        {/* Stock badges */}
                        <div className="mt-1">
                          {product.stock <= 0 ? (
                            <span className="text-xs text-red-500 font-medium">
                              Out of stock
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="text-xs text-orange-500 font-medium">
                              Low stock ({product.stock} left)
                            </span>
                          ) : (
                            <span className="text-xs text-green-600 font-medium">
                              In stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {product.category?.replace(/_/g, " ") || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => confirmDelete(product)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      {/* Edit Modal */}
      {editModal.open && editModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditModal((prev) => ({ ...prev, open: false }))}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={() => setEditModal((prev) => ({ ...prev, open: false }))}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editModal.data.title}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              {/* Price & Old Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editModal.data.price}
                    onChange={(e) =>
                      handleEditChange("price", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editModal.data.old_price ?? ""}
                    onChange={(e) =>
                      handleEditChange(
                        "old_price",
                        e.target.value ? parseFloat(e.target.value) : 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              {/* Stock & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock (Quantity)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editModal.data.stock}
                    onChange={(e) =>
                      handleEditChange("stock", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editModal.data.category}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
                  >
                    <option value="new_arrivals">New Arrivals</option>
                    <option value="top_selling">Top Selling</option>
                    <option value="t-shirts">T-Shirts</option>
                    <option value="shirts">Shirts</option>
                    <option value="pants">Pants &amp; Jeans</option>
                    <option value="shorts">Shorts</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="dresses">Dresses</option>
                    <option value="activewear">Activewear</option>
                    <option value="you_might_also_like">You Might Also Like</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editModal.data.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editModal.saving}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {editModal.saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={resetAddForm}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
              <button
                onClick={resetAddForm}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#F0EEED] overflow-hidden flex-shrink-0 border border-gray-200">
                    {addModal.data.img_url && !addModal.data.img_url.includes("product1") ? (
                      <Image
                        src={addModal.data.img_url}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <label className="flex-1">
                    <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Upload Image
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addModal.data.title}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, title: e.target.value },
                    }))
                  }
                  placeholder="Product name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addModal.data.price}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, price: e.target.value },
                      }))
                    }
                    placeholder="29.99"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addModal.data.old_price}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, old_price: e.target.value },
                      }))
                    }
                    placeholder="39.99"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              {/* Stock & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addModal.data.stock}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, stock: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={addModal.data.category}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, category: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
                  >
                    <option value="new_arrivals">New Arrivals</option>
                    <option value="top_selling">Top Selling</option>
                    <option value="t-shirts">T-Shirts</option>
                    <option value="shirts">Shirts</option>
                    <option value="pants">Pants &amp; Jeans</option>
                    <option value="shorts">Shorts</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="dresses">Dresses</option>
                    <option value="activewear">Activewear</option>
                    <option value="you_might_also_like">You Might Also Like</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={addModal.data.description}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value },
                    }))
                  }
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={resetAddForm}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={createProduct}
                disabled={addModal.saving || !addModal.data.title || !addModal.data.price}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {addModal.saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setDeleteConfirm((prev) => ({ ...prev, show: false }))
            }
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete Product
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete this product?
            </p>
            <p className="text-sm font-medium text-gray-800 mb-6">
              {deleteConfirm.product.title}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  setDeleteConfirm((prev) => ({ ...prev, show: false }))
                }
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
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
