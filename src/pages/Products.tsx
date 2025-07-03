import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, Search } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import debounce from "lodash.debounce";
import ImageModal from "../components/ImageModal";
import { useLocation } from "react-router-dom";
import "./Slider.css";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  image_url?: string;  // Add this field
  img2?: string;
  img3?: string;
  created_at: string;
  offer?: string;
  quantity: number;
  images?: string[];
  colors?: string[];
}

export default function Products() {
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(2000);
  const [sortOption, setSortOption] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromQuery = queryParams.get("category");

  const colorPalette: Record<string, string> = {
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "Green": "#00FF00",
    "Black": "#000000",
    "White": "#FFFFFF",
    "Yellow": "#FFFF00",
    "Purple": "#800080",
    "Pink": "#FFC0CB",
    "Orange": "#FFA500",
    "Gray": "#808080"
  };

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch("http://localhost:5000/products")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      })
      .catch((err) => setFetchError(err.message || "Error fetching products"))
      .finally(() => setLoading(false));
  }, []);

  // Move backendKeyToDisplay to useMemo to avoid dependency issues
  const { backendKeyToDisplay, allBackendKeys } = useMemo(() => {
    const mapping: Record<string, string> = {
      bags_purse: "Bags and Purse",
      earrings: "Earrings",
      flower_bouquet: "Flower Bouquet",
      flower_pots: "Flower Pots",
      hair_accessories: "Hair Accessories",
      keychains_plushies: "Keychains and Plushies",
      mirror: "Mirror"
    };
    return {
      backendKeyToDisplay: mapping,
      allBackendKeys: Object.keys(mapping)
    };
  }, []);

  useEffect(() => {
    if (categoryFromQuery) {
      // Find the backend key by comparing display names
      const backendKey = Object.entries(backendKeyToDisplay).find(
        ([, display]) => display.toLowerCase() === categoryFromQuery.toLowerCase()
      )?.[0] || categoryFromQuery;
      setSelectedCategories([backendKey]);
    }
  }, [categoryFromQuery, backendKeyToDisplay]);

  // Build a flat list of all products, assigning the table name as category
  const allProducts: Product[] = useMemo(() => {
    return Object.entries(products).flatMap(([table, items]) =>
      (items || []).map(item => ({
        ...item,
        category: table, // Assign table name for filtering
        image: item.image || item.image_url || "",
        colors: item.colors || []
      }))
    );
  }, [products]);

  // Filtering logic: now category filter works as expected
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesPrice = product.price <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "price-low-to-high": return a.price - b.price;
          case "price-high-to-low": return b.price - a.price;
          case "newest-first":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: return 0;
        }
      });
  }, [allProducts, searchQuery, selectedCategories, priceRange, sortOption]);

  // Fix the search handler implementation
  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColorSelect = (productId: string, color: string) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleViewMoreImages = useCallback((images: string[]) => {
    setSelectedProductImages(images.filter(Boolean));
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="products-page min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={
              `filter-sidebar w-full md:w-72 bg-white rounded-2xl shadow-lg p-0 md:p-6 h-fit
              transition-transform duration-300
              fixed md:static top-0 left-0 z-30 md:z-auto md:relative
              md:block ` +
              (showFilters ? "translate-x-0 " : "-translate-x-full md:translate-x-0 ")
            }
            style={{ maxWidth: "20rem" }}
          >
            <div className="md:hidden flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-purple-600 focus:outline-none"
                aria-label="Close filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
            <div className="hidden md:block mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
            </div>
            <div className="divide-y">
              {/* Collapsible Categories */}
              <details open className="group">
                <summary className="flex items-center justify-between py-4 px-6 cursor-pointer select-none group-open:font-semibold">
                  <span>Categories</span>
                  <svg className="w-4 h-4 ml-2 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 space-y-2">
                  {allBackendKeys.map((key) => (
                    <label key={key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(key)}
                        onChange={() => {
                          setSelectedCategories((prev) =>
                            prev.includes(key)
                              ? prev.filter((c) => c !== key)
                              : [...prev, key]
                          );
                        }}
                        className="form-checkbox h-4 w-4 text-purple-600 transition duration-150"
                      />
                      <span className="ml-2 text-gray-700">{backendKeyToDisplay[key]}</span>
                    </label>
                  ))}
                </div>
              </details>
              {/* Collapsible Price */}
              <details open className="group">
                <summary className="flex items-center justify-between py-4 px-6 cursor-pointer select-none group-open:font-semibold">
                  <span>Price Range</span>
                  <svg className="w-4 h-4 ml-2 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-purple-600"
                    title="Price range slider"
                    aria-label="Price range slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>₹0</span>
                    <span>₹{priceRange}</span>
                  </div>
                </div>
              </details>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Sort */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 transition"
              >
                <Filter className="w-5 h-5 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-base bg-gray-50 transition"
                  title="Search products"
                  aria-label="Search products"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50 text-base transition"
                title="Sort products"
                aria-label="Sort products"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low-to-high">Price: Low to High</option>
                <option value="price-high-to-low">Price: High to Low</option>
                <option value="newest-first">Newest First</option>
              </select>
            </div>
            {/* Loader, Error, or Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-opacity-30"></div>
                <span className="ml-4 text-lg text-gray-500">Loading products...</span>
              </div>
            ) : fetchError ? (
              <div className="flex justify-center items-center py-20">
                <span className="text-red-600 text-lg">{fetchError}</span>
              </div>
            ) : (
              <div className="space-y-10">
                <section>
                  <h2 className="text-2xl font-bold mb-6 tracking-tight text-gray-900">All Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {filteredProducts.map((product: Product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden flex flex-col h-full group border border-transparent hover:border-purple-200"
                      >
                        {/* Product Image Slider */}
                        <div className="relative aspect-[4/3] bg-gray-100">
                          <Swiper
                            modules={[Navigation, Pagination]}
                            navigation
                            pagination={{ clickable: true }}
                            className="swiper-container h-full"
                            style={{ borderRadius: "1rem 1rem 0 0" }}
                          >
                            <SwiperSlide>
                              <img
                                src={product.image_url ? product.image_url : "/placeholder.png"}
                                alt={product.name}
                                className="product-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                style={{ aspectRatio: "4/3" }}
                                onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                              />
                            </SwiperSlide>
                            {product.images && product.images.length > 0 && product.images.map((img: string, idx: number) => (
                              <SwiperSlide key={idx}>
                                <img
                                  src={img}
                                  alt={`${product.name} - ${idx + 2}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  style={{ aspectRatio: "4/3" }}
                                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                          {product.images && product.images.length > 0 && (
                            <button
                              className="absolute bottom-2 right-2 bg-white/80 text-purple-600 px-3 py-1 rounded-full text-xs font-medium shadow hover:bg-purple-600 hover:text-white transition"
                              onClick={() => handleViewMoreImages([product.image_url || "/placeholder.png", ...(product.images ?? [])])}
                              tabIndex={0}
                            >
                              + View Images
                            </button>
                          )}
                        </div>
                        {/* Product Details */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.name}</h3>
                            {product.offer && (
                              <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                                {product.offer}% OFF
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                          {/* Color Options */}
                          {product.colors && product.colors.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-1">Colors:</p>
                              <div className="flex gap-2">
                                {product.colors.map((color: string) => (
                                  <button
                                    key={color}
                                    type="button"
                                    className={`
                                      w-7 h-7 rounded-full border-2 flex-shrink-0
                                      transition
                                      focus:outline-none focus:ring-2 focus:ring-purple-400
                                      ${selectedColors[product.id] === color
                                        ? "border-purple-600 ring-2 ring-purple-200"
                                        : "border-gray-300"}
                                      hover:scale-110
                                    `}
                                    style={{ backgroundColor: colorPalette[color] }}
                                    onClick={() => handleColorSelect(product.id, color)}
                                    aria-label={color}
                                  >
                                    {selectedColors[product.id] === color && (
                                      <svg className="w-4 h-4 m-auto text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="mt-auto flex items-end gap-2">
                            <span className="font-bold text-xl text-purple-700">
                              ₹{Number(product.price)?.toFixed(2) ?? '0.00'}
                            </span>
                            {product.offer && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{(product.price / (1 - Number(product.offer) / 100)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                {filteredProducts.length === 0 && (
                  <div className="flex justify-center items-center py-20">
                    <span className="text-gray-500 text-lg">No products found.</span>
                  </div>
                )}
              </div>
            )}
            {/* Image Modal */}
            {isModalOpen && (
              <ImageModal
                images={selectedProductImages}
                onClose={closeModal}
                isOpen={isModalOpen}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
