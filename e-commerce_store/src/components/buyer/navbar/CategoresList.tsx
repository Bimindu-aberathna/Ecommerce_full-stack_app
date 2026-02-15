"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSubCategories, setActiveSubCategories] = useState<
    SubCategory[] | null
  >(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const fetchCategories = async () => {
    if (categories.length > 0) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/categories`
      );

      // Ensure we have the data array from your API response
      const categoryData = response.data.data || response.data || [];
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle subcategory toggle
  const handleSubCategoryToggle = (e: React.MouseEvent, categoryId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeCategoryId === categoryId) {
      setActiveSubCategories(null);
      setActiveCategoryId(null);
    } else {
      const category = categories.find((cat) => cat.id === categoryId);
      setActiveSubCategories(category?.subCategories || []);
      setActiveCategoryId(categoryId);
    }
  };

  // Handle mouse leave to close subcategories after a delay
  const handleMouseLeave = () => {
    setTimeout(() => {
      setActiveSubCategories(null);
      setActiveCategoryId(null);
      setMenuOpen(false);
    }, 300);
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <MenuButton
          className="relative flex rounded-full bg-gray-800 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
          style={{ backgroundColor: "transparent" }}
          onClick={() => {
            setMenuOpen(!menuOpen);
            fetchCategories(); // Lazy load categories when menu opens
          }}
        >
          <span
            className="absolute -inset-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          <span className="sr-only">Categories</span>
          <p className="text-white font-bold">
            Categories{" "}
            <ChevronRight
              className={`inline w-4 h-4 transition-transform ${
                menuOpen ? "rotate-90" : ""
              }`}
            />
          </p>
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute left-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {loading ? (
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              Loading categories...
            </div>
          </MenuItem>
        ) : categories.length === 0 ? (
          <MenuItem>
            <p className="block px-4 py-2 text-sm text-gray-700">
              No categories available
            </p>
          </MenuItem>
        ) : (
          <>
            <MenuItem>
              <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Link href={`/products`} className="flex-1">
                  All
                </Link>
              </div>
            </MenuItem>

            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseLeave={handleMouseLeave}
              >
                <MenuItem>
                  <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Link
                      href={`/products?category=${category.id}`}
                      className="flex-1"
                    >
                      {category.name}
                    </Link>
                    {category.subCategories &&
                      category.subCategories.length > 0 && (
                        <button
                          onClick={(e) =>
                            handleSubCategoryToggle(e, category.id)
                          }
                          className="ml-2 p-1 rounded-3xl hover:text-blue-600 cursor-pointer"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "50%",
                            padding: "0.25rem",
                          }}
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              activeCategoryId === category.id
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>
                      )}
                  </div>
                </MenuItem>

                {/* Subcategories dropdown */}
                {activeSubCategories &&
                  activeCategoryId === category.id &&
                  activeSubCategories.length > 0 && (
                    <div className="absolute left-full top-0 z-20 w-48 bg-white shadow-lg rounded-md border border-gray-200">
                      {activeSubCategories.map((subCategory) => (
                        <MenuItem key={subCategory.id}>
                          <Link
                            href={`/products?subcategory=${subCategory.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {subCategory.name}
                          </Link>
                        </MenuItem>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </>
        )}
      </MenuItems>

      <ToastContainer />
    </Menu>
  );
}
