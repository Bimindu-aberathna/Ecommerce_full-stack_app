import React from 'react'

function SidebarFilters() {
  return (
    <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
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
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input type="range" min="0" max="1000" className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>$1000+</span>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Brand</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Apple
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Samsung
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Nike
                  </label>
                </div>
              </div>
            </div>
          </aside>
  )
}

export default SidebarFilters
