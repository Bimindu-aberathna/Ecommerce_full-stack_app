import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductsGrid from "@/src/components/seller/product/SellerProductGrid";
import SortDropdown from "@/src/components/buyer/product/SortDropdown";
import axios from "axios";
import ChatButton from "@/src/components/buyer/chat/ChatButton";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import NewProduct from "@/src/components/seller/product/NewProductForm";

export const metadata: Metadata = {
  title: "Products - E-Store",
  description: "Browse our wide selection of products",
};


export default async function NewProductsPage() {
  
    

  return (
    <div className="container mx-32 py-8">
        <SellerNavbar />
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Add New Product</h1>
          <p className="text-gray-600">Fill in the details to add a new product to your store</p>
        </div>
        <div className="mt-8">
            <NewProduct />
        </div>
    </div>

    )
};
