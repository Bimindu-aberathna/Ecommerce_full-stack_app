"use client";
import React, { useEffect, useState } from "react";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X, FolderPlus, Edit2, Trash2, Search } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

type Category = {
  id: string;
  name: string;
};

type SubCategory = {
  id: string;
  name: string;
  categoryId: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
};

export default function SubCategoriesPage() {
  const { token } = useAuth();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  });

  const apiUrl = "/api";

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch subcategories
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      let url = `${apiUrl}/subcategories`;
      if (filterCategory) {
        url += `?categoryId=${filterCategory}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  // Create subcategory
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
      toast.error("Subcategory name and category are required");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/subcategories`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories([...subCategories, response.data?.data || formData]);
      toast.success("Subcategory created successfully");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Failed to create subcategory");
    }
  };

  // Update subcategory
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const response = await axios.put(
        `${apiUrl}/subcategories/${editingId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubCategories(
        subCategories.map((sub) =>
          sub.id === editingId ? { ...sub, ...formData } : sub
        )
      );
      toast.success("Subcategory updated successfully");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error("Failed to update subcategory");
    }
  };

  // Delete subcategory
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      await axios.delete(`${apiUrl}/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories(subCategories.filter((sub) => sub.id !== id));
      toast.success("Subcategory deleted successfully");
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Failed to delete subcategory");
    }
  };

  // Open modal for edit
  const handleEdit = (subCategory: SubCategory) => {
    setEditingId(subCategory.id);
    setFormData({
      name: subCategory.name,
      categoryId: subCategory.categoryId,
      image: subCategory.image || "",
      isActive: subCategory.isActive,
      sortOrder: subCategory.sortOrder,
    });
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      image: "",
      isActive: true,
      sortOrder: 0,
    });
    setEditingId(null);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchSubCategories();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSubCategories();
    }
  }, [filterCategory]);

  const filteredSubCategories = subCategories.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Unknown";
  };

  return (
    <div>
      <SellerNavbar />
      <div className="p-6 ml-16 md:ml-64">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Subcategories
            </h1>
            <p className="text-gray-600 mt-1">Manage product subcategories</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition"
          >
            <FolderPlus className="h-5 w-5" />
            Add Subcategory
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategories Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading subcategories...</p>
          </div>
        ) : filteredSubCategories.length === 0 ? (
          <div className="text-center py-12">
            <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {subCategories.length === 0
                ? "No subcategories yet. Create one to get started!"
                : "No subcategories match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubCategories.map((subCategory) => (
                  <tr
                    key={subCategory.id}
                    className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-3">
                      {subCategory.image ? (
                        <img
                          src={subCategory.image}
                          alt={subCategory.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">
                      {subCategory.name}
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                      {getCategoryName(subCategory.categoryId)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            subCategory.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subCategory.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                      {subCategory.sortOrder}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(subCategory)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subCategory.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        <Transition show={isModalOpen} as="div">
          <Dialog as="div" className="relative z-50" onClose={closeModal}>
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="fixed inset-0 bg-black/50"
            />

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as="div"
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                  className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingId
                        ? "Edit Subcategory"
                        : "Add New Subcategory"}
                    </DialogTitle>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={editingId ? handleUpdate : handleCreate}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Subcategory Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                        placeholder="Enter subcategory name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Image URL <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sortOrder: parseInt(e.target.value),
                          })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Active
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition"
                      >
                        {editingId ? "Update" : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      <ToastContainer />
    </div>
  );
}
