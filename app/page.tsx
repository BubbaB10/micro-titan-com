import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const products = [
  {
    emoji: "📞",
    name: "Missed Call AI",
    tagline: "Never lose a job to a missed call.",
    price: "$400/mo",
    slug: "missed-call-ai",
    accent: "#f97316",
  },
  {
    emoji: "🔍",
    name: "ReviewIntel",
    tagline: "Protect your Amazon listings from fake reviews.",
    price: "$19/report",
    slug: "review-intel",
    accent: "#3b82f6",
  },
  {
    emoji: "📋",
    name: "AI Estimator",
    tagline: "Price every job right, every time.",
    price: "$49/mo",
    slug: "ai-estimator",
    accent: "#10b981",
  },
  {
    emoji: "📊",
    name: "AI Bookkeeper",
    tagline: "Know if you made money. In plain English.",
    price: "$49/mo",
    slug: "ai-bookkeeper",
    accent: "#8b5cf6",
  },
  {
    emoji: "🐾",
    name: "Rescue Social",
    tagline: "AI-powered captions for animal rescue orgs.",
    price: "$99/mo",
    slug: "rescue-social",
    accent: "#ec4899",
  },
  {
    emoji: "🚗",
    name: "Car Wash Marketplace",
    tagline: "Buy and sell car washes. No broker.",
    price: "$99/mo featured",
    slug: "car-wash-marketplace",
    accent: "#06b6d4",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Nav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-6">
            Micro Titan
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight mb-6">
            AI tools that run your life.
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] font-light max-w-xl mx-auto">
            We build the agents. You keep the life.
          </p>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-[#6e7681] text-xs">
          <span>Products</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Our Products</h2>
          <p className="text-center text-[#8b949e] mb-16 text-lg">
            Six tools. Six problems nobody else is solving.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/${product.slug}`}
                className="group bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#30363d] transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Logo area */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${product.accent}18`, border: `1px solid ${product.accent}40` }}
                >
                  {product.emoji}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">{product.name}</h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed">{product.tagline}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: product.accent }}
                  >
                    {product.price}
                  </span>
                  <span className="text-sm text-[#6e7681] group-hover:text-white transition-colors">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-4 border-t border-[#21262d]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-6">
            About
          </p>
          <h2 className="text-3xl font-bold mb-6">Built in Paris, Texas.</h2>
          <p className="text-[#8b949e] text-lg leading-relaxed">
            We build AI tools for the parts of life most people just wing it through.
          </p>
          <p className="text-[#6e7681] text-sm mt-4">
            Micro Titan LLC — Paris, Texas.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
