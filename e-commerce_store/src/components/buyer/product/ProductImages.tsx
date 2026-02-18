"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type ImageType = {
  url: string;
  type: string;
  isPrimary: boolean;
};

type ProductImagesProps = {
  images: string[] | ImageType[];
};

function getImageUrl(image: string | ImageType): string {
  if (typeof image === "string") return image;
  return image.url;
}

function ProductImages({ images }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0);

  useEffect(() => {
    setSelectedImage(0);
  }, [images]);

  const hasImages = images.length > 0;
  const currentImage =
    hasImages && selectedImage < images.length
      ? getImageUrl(images[selectedImage])
      : "/images/products/default-product.jpg";

  return (
    <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto px-2 sm:px-0">
      <div className="relative aspect-square bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-6 group">
        <img
          src={currentImage}
          alt="Selected Product Image"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          width={500}
          height={500}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/products/default-product.jpg";
          }}
        />

        {hasImages && images.length > 1 && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`thumbnail-btn flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 ${
                    selectedImage === index ? "active" : ""
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={64}
                    height={64}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`thumbnail-btn ${
                    selectedImage === index ? "active" : ""
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200"
                    width={80}
                    height={80}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-1 sm:space-x-2 lg:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`nav-dot ${selectedImage === index ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      )}

      {!hasImages && (
        <div className="text-center text-gray-500 py-8">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs sm:text-sm">No images available</p>
        </div>
      )}
    </div>
  );
}

export default ProductImages;
