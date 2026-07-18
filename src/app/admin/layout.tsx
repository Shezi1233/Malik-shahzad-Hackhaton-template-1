"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/promocodes", label: "Promo Codes", icon: Tag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile Header Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 md:hidden flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-base font-bold text-gray-900">Admin Panel</h1>
          <Link href="/" className="text-gray-400 hover:text-black p-2">
            <ArrowLeft size={18} />
          </Link>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
                <hr className="my-3" />
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back to site
                </Link>
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mt-1"
            >
              <ArrowLeft size={14} />
              Back to site
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">SHOP.CO Admin</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto mt-14 md:mt-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminRoute>
  );
}
