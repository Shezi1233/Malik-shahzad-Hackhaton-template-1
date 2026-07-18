"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface OrderData {
  id: number;
  status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  tax_amount: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  created_at: string;
  items: OrderItem[];
  payment_method: string;
}

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.orderId) return;
    api
      .get<OrderData>(`/orders/${params.orderId}`)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/profile" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="bg-white border rounded-2xl p-8 print:p-0 print:border-0" id="invoice">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black">SHOP.CO</h1>
            <p className="text-gray-500 text-sm mt-1">Invoice</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">Order #{order.id}</p>
            <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <hr className="mb-6" />

        {/* Bill To */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
          <p className="font-medium">{order.shipping_name}</p>
          <p className="text-sm text-gray-600">{order.shipping_email}</p>
          <p className="text-sm text-gray-600">{order.shipping_address}</p>
          <p className="text-sm text-gray-600">{order.shipping_city}, {order.shipping_country}</p>
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-2 font-medium">Item</th>
              <th className="text-center py-2 font-medium">Qty</th>
              <th className="text-right py-2 font-medium">Price</th>
              <th className="text-right py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                </td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">${item.price?.toFixed(2)}</td>
                <td className="text-right py-3 font-medium">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-${order.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>${order.delivery_fee.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>${(order.tax_amount || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>
        </div>

        <hr className="my-6" />
        <p className="text-center text-xs text-gray-400">Thank you for shopping at SHOP.CO!</p>
      </div>

      <style jsx>{`@media print { body { -webkit-print-color-adjust: exact; } }`}</style>
    </div>
  );
}
