import { Metadata } from "next";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import NewProduct from "@/src/components/seller/product/NewProductForm";

export const metadata: Metadata = {
  title: "Add Product - E-Store",
  description: "Add a new product to your store",
};

export default async function NewProductsPage() {
  return (
    <div>
      <SellerNavbar />
      <div className="p-6 ml-16 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details to add a new product to your store
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <NewProduct />
        </div>
      </div>
    </div>
  );
}
