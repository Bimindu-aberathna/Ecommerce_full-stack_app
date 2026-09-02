"use client";

export function HomeHero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
          Welcome to E-Store
        </h1>
        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto">
          Discover amazing products at unbeatable prices. Shop with confidence
          and enjoy fast, free shipping.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <div className="relative inline-block">
            <span
              className="absolute inset-0 rounded-lg bg-white opacity-75 animate-ping motion-reduce:animate-none"
              aria-hidden="true"
            ></span>
            <button
              className="relative bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition text-sm sm:text-base"
              onClick={() => (window.location.href = "/products")}
            >
              Shop Now
            </button>
          </div>
          <button className="border border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-sm sm:text-base">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
