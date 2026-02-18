'use client';

export function HomeHero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
          Welcome to E-Store
        </h1>
        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto">
          Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, free shipping.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button 
            className="bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
            onClick={() => window.location.href = '/products'}
          >
            Shop Now
          </button>
          <button className="border border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-sm sm:text-base">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
