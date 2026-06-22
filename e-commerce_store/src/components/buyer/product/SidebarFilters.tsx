"use client";
import React from "react";
import { useEffect } from "react";
import { ProductService } from "@/src/services/product.service";
import type { Category } from "@/src/types";

type category = {
  id: number;
  name: string;
  image?: string;
};

function SidebarFilters() {
  //lazy load categories from backend and store
  const [categories, setCategories] = React.useState<category[]>([]);
  const [filterCategories, setFilterCategories] = React.useState<category[]>([]);
  const [brands, setBrands] = React.useState<string[]>([]);
  const [filterBrands, setFilterBrands] = React.useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
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
  }, [filterCategories]);

  const fetchBrands = async () => {
    console.log("Fetching brands for categories:", filterCategories);
    let categoryIds = ""
    if (filterCategories.length > 0) {
      categoryIds = filterCategories.map((c) => c.id).join(",");
    }
    try {
      const res = await ProductService.getBrands(categoryIds);
      const brandList = Array.isArray(res.data?.data) ? res.data.data : [];
      console.log("Fetched brands:", brandList);
      setBrands(brandList);
      console.log("Fetched brands state:", brands);
    } catch (err) {
      console.log(err);
      setBrands([]);
    }
  };

  const printBrands = () => {
    console.log("Current brands state:", brands);
  }

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
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterCategories([...filterCategories, category]);
                        } else {
                          setFilterCategories(
                            filterCategories.filter((c) => c !== category),
                          );
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
              <input type="range" min="0" max="1000" className="w-full" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Rs. 0</span>
                <span>Rs. 100000+</span>
              </div>
            </div>
            {/* <button onClick={printBrands} className="mt-2 px-3 py-1 bg-gray-200 rounded">Print Brands</button> */}
          </div>

          {/* Brand */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Brand</h3>
            <div className="space-y-2">
              {brands ? brands.map((brand, index) => (
                <label key={index} className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  {brand}
                </label>
              )) : (
                <p>No brands available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidebarFilters;
