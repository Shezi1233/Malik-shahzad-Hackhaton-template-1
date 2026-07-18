import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <div className="text-9xl font-black text-gray-100 select-none">404</div>

        {/* Content */}
        <div className="-mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved. Let&apos;s get you back on track.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/all-products"
              className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:border-gray-400 hover:text-black transition-all"
            >
              Browse Products
            </Link>
          </div>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/all-products" className="text-sm text-gray-500 hover:text-black transition-colors">
              All Products
            </Link>
            <Link href="/cart" className="text-sm text-gray-500 hover:text-black transition-colors">
              Cart
            </Link>
            <Link href="/signin" className="text-sm text-gray-500 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/ordertracking" className="text-sm text-gray-500 hover:text-black transition-colors">
              Order Tracking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
