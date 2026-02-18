import Image from 'next/image'
import React from 'react'

type Product = {
  name: string;
  brand: string;
  images?: string[];
  rating?: number;
  price: number;
  varieties?: any[]; 
};

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const jsonifyString = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const getImageUrl = () => {
    if (typeof product.images === 'string') {
      const parsedImages = jsonifyString(product.images);
      return parsedImages?.[0]?.url || parsedImages?.[0] || `/images/products/default-product.jpg`;
    } else if (Array.isArray(product.images)) {
      return product.images?.[0] || `/images/products/default-product.jpg`;
    }
    return `/images/products/default-product.jpg`;
  };

  const hasStock = Array.isArray(product.varieties) && product.varieties.length > 0
    ? product.varieties.some((variety) => variety.stock > 0)
    : true;

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-102 flex flex-col">
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2" style={{ color: 'var(--text)' }}>{product.name}</h3>
        <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--secondary)' }}>{product.brand}</p>
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
          <span className="text-xs sm:text-sm ml-1" style={{ color: 'var(--text-muted)' }}>({product.rating ?? "N/A"})</span>
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--primary)' }}>
            {hasStock ? `Rs. ${product.price}` : <span className="text-red-600">Out of Stock</span>}
          </span>
          <button 
            className="w-full px-3 py-2 rounded text-xs sm:text-sm font-medium text-white transition-all duration-200"
            style={{
              backgroundColor: hasStock ? 'var(--primary)' : '#d1d5db',
              display: hasStock ? 'block' : 'none',
              cursor: hasStock ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => hasStock && (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}


export default ProductCard
