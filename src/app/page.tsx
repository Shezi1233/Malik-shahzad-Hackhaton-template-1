import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Load brand fonts immediately (above fold)
import Fonts from "@/components/fonts";

// Lazy load below-fold components
const Products = dynamic(() => import("@/app/products/page"), {
  loading: () => (
    <div className="w-full max-w-screen-2xl mx-auto mt-10 px-4 sm:px-8">
      <div className="flex justify-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-[20px] animate-pulse" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

const TopSell = dynamic(() => import("@/app/products/sell"), {
  loading: () => (
    <div className="w-full max-w-screen-2xl mx-auto mt-10 px-4 sm:px-8">
      <div className="flex justify-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-[20px] animate-pulse" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

const CategorySection = dynamic(() => import("@/components/CategorySection"), {
  loading: () => (
    <div className="w-full max-w-screen-2xl mx-auto mt-8 px-4 sm:px-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-[20px] animate-pulse" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

const Dress = dynamic(() => import("@/components/dress"), {
  loading: () => <div className="h-[300px] bg-gray-100 mt-8 rounded-xl animate-pulse max-w-screen-2xl mx-auto" />,
  ssr: false,
});

const CustomerCarousel = dynamic(() => import("@/components/couresel"), {
  loading: () => <div className="h-[200px] bg-gray-50 mt-14 animate-pulse" />,
  ssr: false,
});

const Chatbot = dynamic(() => import("@/components/chatbot"), {
  ssr: false,
});

const categorySections = [
  { title: "👕 T-SHIRTS", category: "t-shirts" },
  { title: "👔 SHIRTS", category: "shirts" },
  { title: "👖 PANTS & JEANS", category: "pants" },
  { title: "🩳 SHORTS", category: "shorts" },
  { title: "🧥 OUTERWEAR", category: "outerwear" },
  { title: "🏋️ ACTIVEWEAR", category: "activewear" },
  { title: "👗 DRESSES", category: "dresses" },
  { title: "🧶 HOODIES", category: "hoodies" },
];

export default function Home() {
  return (
    <div>
      <Hero />
      <Fonts />

      {/* Lazy loaded below-fold sections */}
      <Products />
      <TopSell />

      {/* Shop by Category Section */}
      <div className="w-full max-w-screen-2xl mx-auto mt-12 sm:mt-16 px-4 sm:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black">
            SHOP BY CATEGORY
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Find exactly what you need from our curated collections
          </p>
        </div>
      </div>

      {categorySections.map((section) => (
        <CategorySection
          key={section.category}
          title={section.title}
          category={section.category}
        />
      ))}

      <Dress />
      <CustomerCarousel />
      <Chatbot />
    </div>
  );
}
