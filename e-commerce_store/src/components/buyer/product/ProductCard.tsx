import Image from 'next/image'
import React from 'react'

type Product = {
  name: string;
  brand: string;
  image?: string;
  rating?: number;
  price: number;
  inStock?: boolean;
};

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border-gray hover:shadow-md transition  transition-transform hover:scale-102"
    >
      <div className="aspect-square bg-gray-200 rounded-t-lg ">
        <Image
          src={product.image || `/images/products/default-product.jpg`}
          alt={product.name}
          className="h-full w-full object-cover rounded-t-lg"
          width={300}
          height={300}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-sm">★★★★★</div>
          <span className="text-gray-500 text-sm ml-1">({product.rating ?? "N/A"})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {product.inStock ? `Rs. ${product.price}` : 
              <span className="text-red-600">Out of Stock</span>}
          </span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard
