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
    const res = JSON.parse(str);
    // console.log("Parsed images:", res[0]);
    return res;
  } catch {
    return null;
  }
}

// Get the image URL properly
const getImageUrl = () => {
  if (typeof product.images === 'string') {
    const parsedImages = jsonifyString(product.images);
    const imageUrl = parsedImages?.[0]?.url || parsedImages?.[0] || `/images/products/default-product.jpg`;
    // console.log("Final image URL:", imageUrl);
    return imageUrl;
  } else if (Array.isArray(product.images)) {
    return product.images?.[0] || `/images/products/default-product.jpg`;
  }
  return `/images/products/default-product.jpg`;
}

  return (
    <div
      className="bg-white rounded-lg shadow-sm border-gray hover:shadow-md transition  transition-transform hover:scale-102"
    >
      <div className="aspect-square bg-gray-200 rounded-t-lg ">
        {/* <Image
          src={product.images?.[0] || `/images/products/default-product.jpg`}
          alt={product.name}
          className="h-full w-full object-cover rounded-t-lg"
          width={300}
          height={300}
        /> */}
        {/* images:[{"url":"https://firebasestorage.googleapis.com/v0/b/champions-stores.appspot.com/o/images%2F0911c7cb-209b-4308-bf57-5fe749ee83e7?alt=media&token=8a9427d8-06d7-4764-a031-8c2b24068db5","type":"image","isPrimary":true},{"url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk8ANoxHoOiwBF2wTK4ZTFgB3Ow20FGLlgWg&s","type":"image","isPrimary":false}] */}
        <img
          src={getImageUrl()}
          alt={product.name}
          className="h-full w-full object-cover rounded-t-lg"
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
            {/* {product.inStock ? `Rs. ${product.price}` : 
              <span className="text-red-600">Out of Stock</span>} */}
              {Array.isArray(product.varieties) && product.varieties.length > 0
                ? product.varieties.some((variety) => variety.stock > 0)
                  ? `Rs. ${product.price}`
                  : <span className="text-red-600">Out of Stock</span>
                : `Rs. ${product.price}`
              }
          </span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
            style={{
              display: Array.isArray(product.varieties) && product.varieties.length > 0
                ? product.varieties.some((variety) => variety.stock > 0)
                  ? 'block'
                  : 'none'
                : 'block'
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}


export default ProductCard
