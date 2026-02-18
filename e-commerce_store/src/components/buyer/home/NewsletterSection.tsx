'use client';

export function NewsletterSection() {
  return (
    <section className="bg-gray-100 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
            Subscribe to Our Newsletter
          </h2>
          <p className="mb-6 sm:mb-8 text-gray-600 text-sm sm:text-base">
            Get exclusive deals and updates straight to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-center items-stretch sm:items-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-r-none focus:outline-none text-sm sm:text-base"
            />
            <button 
              className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-l-none text-white font-semibold transition text-sm sm:text-base"
              style={{ backgroundColor: 'var(--primary)' }}
              onClick={() => alert('Thank you for subscribing!')}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
