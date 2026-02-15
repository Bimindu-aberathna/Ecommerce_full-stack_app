"use client";

import React from "react";

export interface NewProductVariety {
  name: string;
  stock: number;
  preorderLevel: number;
}

interface NewVarietiesEditorProps {
  varieties: NewProductVariety[];
  onChange: (varieties: NewProductVariety[]) => void;
}

const emptyVariety = (): NewProductVariety => ({
  name: "",
  stock: 0,
  preorderLevel: 0,
});

function NewVarietiesEditor({ varieties, onChange }: NewVarietiesEditorProps) {
  const handleVarietyChange = (
    index: number,
    field: keyof NewProductVariety,
    value: string | number,
  ) => {
    const next = varieties.map((variety, i) =>
      i === index ? { ...variety, [field]: value } : variety,
    );
    onChange(next);
  };

  const handleAddVariety = () => {
    onChange([...varieties, emptyVariety()]);
  };

  const handleRemoveVariety = (index: number) => {
    const next = varieties.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [emptyVariety()]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Varieties
        </label>
        <button
          type="button"
          onClick={handleAddVariety}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Add Variety
        </button>
      </div>
      <div className="space-y-3">
        {varieties.map((variety, index) => (
          <div
            key={`variety-${index}`}
            className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 sm:grid-cols-4"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor={`variety-name-${index}`}
                className="block text-xs font-medium text-gray-600  mb-1"
              >
                Name
              </label>
              <input
                id={`variety-name-${index}`}
                type="text"
                value={variety.name}
                onChange={(e) =>
                  handleVarietyChange(index, "name", e.target.value)
                }
                className="block w-full h-9 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor={`variety-stock-${index}`}
                className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >
                Stock
              </label>
              <input
                id={`variety-stock-${index}`}
                type="number"
                value={variety.stock}
                onChange={(e) =>
                  handleVarietyChange(index, "stock", Number(e.target.value))
                }
                  className="block w-full h-9 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
              <label
                htmlFor={`variety-preorder-${index}`}
                className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >
                Pre-Order
              </label>
              <input
                id={`variety-preorder-${index}`}
                type="number"
                value={variety.preorderLevel}
                onChange={(e) =>
                  handleVarietyChange(
                    index,
                    "preorderLevel",
                    Number(e.target.value),
                  )
                }
                className="block w-full h-9 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveVariety(index)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewVarietiesEditor;
