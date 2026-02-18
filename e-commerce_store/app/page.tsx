import CustomerNavbar from '@/src/components/buyer/navbar/CustomerNavbar';
import { HomeHero } from '@/src/components/buyer/home/HomeHero';
import { NewsletterSection } from '@/src/components/buyer/home/NewsletterSection';
import 'react-toastify/dist/ReactToastify.css';
import { FeaturedProductsGrid } from '@/src/components/buyer/home/FeaturedProductsGrid';
import { CategorySelector } from '@/src/components/buyer/home/CategorySelector';





export default function HomePage() {


  return (
    <div className="min-h-screen">
      <CustomerNavbar />
      <HomeHero />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">Shop by Category</h2>
          {/* <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-lg mx-auto mb-3 sm:mb-4"></div>
              <h3 className="font-semibold text-sm sm:text-base">Electronics</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-lg mx-auto mb-3 sm:mb-4"></div>
              <h3 className="font-semibold text-sm sm:text-base">Fashion</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-lg mx-auto mb-3 sm:mb-4"></div>
              <h3 className="font-semibold text-sm sm:text-base">Home & Garden</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 rounded-lg mx-auto mb-3 sm:mb-4"></div>
              <h3 className="font-semibold text-sm sm:text-base">Sports</h3>
            </div>
          </div>
           */}
           <CategorySelector />
        </div>
      </section>

      <FeaturedProductsGrid />
      <NewsletterSection />
    </div>
  );
}
