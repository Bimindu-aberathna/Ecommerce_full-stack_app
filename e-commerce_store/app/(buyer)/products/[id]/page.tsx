// Individual product page for displaying detailed product information 
interface Props {
        //product data
        params: {
            id: string;

        };
    }
export default async function page({ params }: Props) {
    const productId = params.id;
    // Fetch product data from API or database using productId
    // For now, we will simulate with a static product object
    const product = {
  "id": "12345",
  "name": "Apple MacBook Air",
  "description": "A lightweight laptop with a 13‑inch Retina display, Touch ID, and up to 18 hours of battery life.",
  "brand": "Apple",
  "category": "Laptops",
  "price": 450599.99,
  "images": [
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-og-202503?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1739216814915",
    "https://thedisconnekt.com/wp-content/uploads/2024/03/Apple-MacBook-Air-15-inch-23.jpg",
    "https://techtoro.io/image/catalog/Blogs/macbook%20m4%20news/macbook-m4-air.png"
  ],
  "features": [
    "Apple M1 chip",
    "16GB",
    "1TB",
    "13.3‑inch Retina display",
    "Up to 8‑core GPU",
    "Up to 18 hours"
  ],
  "variants": [
    {
      "id": 1,
      "name": "Silver",
      "inStock": true
    },
    {
      "id": 2,
      "name": "Space Gray",
      "inStock": false
    },
    {
        "id": 3,
        "name": "Gold",
        "inStock": true
    }
  ],

  "reviews": [
    {
      "id": "1",
      "author": "John Smith",
      "rating": 5,
      "text": "This is the best laptop I've ever owned! It's incredibly fast and the battery lasts all day.",
      "timestamp": "2023‑02‑10T12:30:00Z"
    },
    {
      "id": "2",
      "author": "Sarah Johnson",
      "rating": 4,
      "text": "I love this laptop, but I wish it had more ports. I had to buy a separate dongle for my external monitor.",
      "timestamp": "2023‑02‑12T09:15:00Z"
    },
    {
      "id": "3",
      "author": "Michael Brown",
      "rating": 5,
      "text": "The M1 chip is a game changer! This laptop is so fast and efficient.",
      "timestamp": "2023‑02‑15T14:45:00Z"
    }
  ],
}


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            <img
            src={product.images[0] || '/images/products/default-product.jpg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            />
        </div>
    
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-lg font-semibold text-blue-600 mb-4">Rs. {product.price.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mb-4">Brand: {product.brand}</p>
            <p className="text-sm text-gray-500 mb-4">Category: {product.category}</p>
            
            <p className="text-sm text-gray-500 mb-4">Varients:</p>
            <div className="flex gap-2 mb-4">
            {product.variants.map((variant) => (
                //radio button group
                <label key={variant.id} className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center cursor-pointer hover:bg-gray-300 transition">
                    <input
                        type="radio"
                        name="variant"
                        value={variant.id}
                        className="mr-2"
                        disabled={!variant.inStock}
                        title={!variant.inStock ? 'This variant is out of stock' : ''}
                    />
                    {variant.name}
                </label>
            ))}
            </div>

    
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="list-disc list-inside mb-4">
            {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
            ))}
            </ul>
    
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Add to Cart
            </button>
            
            <p className="text-gray-600 mb-4 mt-3">{product.description}</p>
        </div>

        
    </div>
  )
}

