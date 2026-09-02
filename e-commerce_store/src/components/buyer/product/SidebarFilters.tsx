"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ProductService } from "@/src/services/product.service";
import { useRouter, useSearchParams } from "next/navigation";

type category = {
  id: number;
  name: string;
  image?: string;
};

function SidebarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //lazy load categories from backend and store
  const [categories, setCategories] = useState<category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStock, setInStock] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize UI state from current URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "";
    const brandsFromUrl = searchParams.getAll("brands");
    const minPriceFromUrl = searchParams.get("minPrice") || "";
    const maxPriceFromUrl = searchParams.get("maxPrice") || "";
    const inStockFromUrl = searchParams.get("inStock") === "true";

    setSelectedCategoryId(categoryFromUrl);
    setSelectedBrands(brandsFromUrl);
    setMinPrice(minPriceFromUrl);
    setMaxPrice(maxPriceFromUrl);
    setInStock(inStockFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await ProductService.getCategories();
      const categoryList = Array.isArray(res.data?.data) ? res.data.data : [];

      
      setCategories(categoryList);
    } catch (err) {
      console.log(err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchBrands();
    // Reset brands selection when category changes
    setSelectedBrands([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  const fetchBrands = async () => {
    try {
      const res = await ProductService.getBrands(selectedCategoryId);
      const brandList = Array.isArray(res.data?.data) ? res.data.data : [];
      setBrands(brandList);
    } catch (err) {
      console.log(err);
      setBrands([]);
    }
  };

  const canApply = useMemo(() => {
    return (
      !!selectedCategoryId ||
      selectedBrands.length > 0 ||
      !!minPrice ||
      !!maxPrice ||
      inStock
    );
  }, [inStock, maxPrice, minPrice, selectedBrands.length, selectedCategoryId]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset pagination when filters change
    params.delete("page");

    if (selectedCategoryId) params.set("category", selectedCategoryId);
    else params.delete("category");

    params.delete("brands");
    selectedBrands.forEach((b) => params.append("brands", b));

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (inStock) params.set("inStock", "true");
    else params.delete("inStock");

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("category");
    params.delete("brands");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("inStock");
    router.push(`?${params.toString()}`);

    setSelectedCategoryId("");
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
  };

  return (
    <div className="">
      <input
        type="checkbox"
        id="mobile-filter-toggle"
        className="peer hidden"
      />
      <label
        htmlFor="mobile-filter-toggle"
        className="block lg:hidden rounded-lg p-3 text-center cursor-pointer mb-4 bg-blue-500 text-white"
      >
        <span className="peer-checked:hidden">Show Filters</span>
        <span className="hidden peer-checked:inline">Hide Filters</span>
      </label>
      <div className="hidden peer-checked:block peer-checked:static w-full lg:block w-64">
        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      className="mr-2"
                      checked={selectedCategoryId === category.id.toString()}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryId(category.id.toString());
                        }
                      }}
                    />
                    {category.name}
                  </label>
                ))}
              {/* <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Electronics
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Fashion
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Home & Garden
              </label> */}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Min"
                  className="w-1/2 rounded border px-3 py-2 text-sm"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Max"
                  className="w-1/2 rounded border px-3 py-2 text-sm"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Brand</h3>
            <div className="space-y-2">
              {brands ? brands.map((brand, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands((prev) => [...prev, brand]);
                      } else {
                        setSelectedBrands((prev) => prev.filter((b) => b !== brand));
                      }
                    }}
                  />
                  {brand}
                </label>
              )) : (
                <p>No brands available</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              In stock only
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              disabled={!canApply}
              className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded border px-4 py-2 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidebarFilters;
