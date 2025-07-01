import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRight, ChevronRight } from "lucide-react";
import { MediaCoverageSection } from "../components/MediaCoverageSection";
import { BrandCollaborationSection } from "../components/BrandCollaborationSection";
import landingPoster from '../assets/landing_poster_pc.png';
import landingPosterMobile from '../assets/landing_poster_mobile.png';

interface Poster {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image2: string;
  image3: string;
}

interface BestSeller {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  image2: string;
  image3: string;
  offer: string;
  category: string;
  created_at: string;
  quantity: number;
}

interface Product {
  id: string;
  category: string;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
  image?: string | null;
}

export default function Home() {
  const [poster, setPoster] = useState<Poster | null>(null);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Responsive poster image selection
  const getPosterImage = () => {
    if (window.innerWidth < 768) {
      return landingPosterMobile;
    }
    return landingPoster;
  };
  const [posterImage, setPosterImage] = useState(getPosterImage());
  useEffect(() => {
    const handleResize = () => setPosterImage(getPosterImage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const examplePoster: Poster = {
      id: "1",
      title: "Summer Collection 2023",
      description: "Discover our new summer collection with exclusive designs",
      image_url: posterImage,
      image2: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      image3: "https://images.unsplash.com/photo-1483985988355-763728e1935b"
    };

    const exampleCategories: Product[] = [
      {
        id: "1",
        category: "Earrings",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9"
      },
      {
        id: "2",
        category: "Hair accessories",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
      },
      {
        id: "3",
        category: "Keychains and Plushies",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
      },
      {
        id: "4",
        category: "Flower Bouquet",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
      },
      {
        id: "5",
        category: "Flower Pots",
        image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
      },
      {
        id: "6",
        category: "Mirror",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
      },
      {
        id: "7",
        category: "Bags and Purse",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
      }
    ];

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch best sellers from backend API
        const bestSellersResponse = await fetch('http://localhost:5000/best_sellers');
        const bestSellersData = await bestSellersResponse.json();
        // Map backend fields to frontend BestSeller interface
        const mappedBestSellers = bestSellersData.map((item: any) => ({
          id: item.id,
          title: item.name, // Map 'name' to 'title'
          description: item.description,
          price: Number(item.price),
          image_url: item.image_url,
          image2: item.image2 || '',
          image3: item.image3 || '',
          offer: item.offer ? String(item.offer) : '',
          category: item.category || '',
          created_at: item.created_at || '',
          quantity: item.quantity,
        }));
        setBestSellers(mappedBestSellers);
        // Fetch categories from backend
        const categoriesResponse = await fetch('http://localhost:5000/categories');
        const categoriesData = await categoriesResponse.json();
        // Optionally, add images for each category if you have them
        setCategories(categoriesData);
        setPoster(examplePoster);
      } catch (error) {
        console.error("Error fetching data:", error);
        setPoster(examplePoster);
        setBestSellers([]); // No demo data
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // posterImage is a dependency for examplePoster
  }, [posterImage]);

  const handleCategoryClick = (category: string) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const calculateDiscountedPrice = (price: number, offer: string) => {
    if (!offer) return price;
    const discount = parseFloat(offer) / 100;
    return price - price * discount;
  };

  const posterSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    fade: true,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Slider Section */}
      {poster && (
        <section className="relative h-[70vh] md:h-screen">
          <Slider {...posterSliderSettings}>
            {[poster.image_url, poster.image_url, poster.image_url]
              .filter(img => img) // Filter out empty strings
              .map((image, index) => (
                <div key={index} className="w-full h-[70vh] md:h-screen">
                  <img
                    src={image}
                    alt={`Poster ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              )
            )}
          </Slider>

          <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6">
                {poster.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                {poster.description}
              </p>
              <Link
                to="/products"
                className="inline-flex bg-pink-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold items-center space-x-2 hover:bg-pink-700 transition-all duration-300 hover:scale-105"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges Section */}
      {/* <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-pink-600">100%</div>
              <div className="text-sm text-gray-600">Handmade</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-pink-600">500+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-pink-600">Free</div>
              <div className="text-sm text-gray-600">Shipping Over ₹999</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-pink-600">Easy</div>
              <div className="text-sm text-gray-600">Returns</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Best Sellers Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-12" >Best Sellers</h2>
            <Link
              to="/products"
              className="flex items-center text-pink-600 hover:text-pink-800"
            >
              View All <ChevronRight className="ml-1" />
            </Link>
          </div>
          {bestSellers.length === 0 ? (
            <div className="text-center text-gray-400 py-16 text-lg">
              {/* Placeholder with example from database structure */}
              <div className="flex flex-col items-center">
                <img
                  src="https://example.com/images/bottle.jpg"
                  alt="Stainless Steel Water Bottle"
                  className="w-40 h-40 object-cover rounded mb-4 border"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x400";
                  }}
                />
                <h3 className="text-xl font-semibold mb-2">Stainless Steel Water Bottle</h3>
                <p className="text-gray-500 mb-2 text-center max-w-xs">
                  Double-walled, leak-proof, and keeps drinks cold for 24 hours.
                </p>
                <div className="flex items-center mb-2">
                  <span className="text-lg font-bold text-pink-600">₹899.00</span>
                  <span className="text-sm text-gray-500 line-through ml-2">₹1,057.65</span>
                  <span className="ml-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">15% OFF</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full border bg-gray-200" style={{backgroundColor: '#C0C0C0'}} title="Silver"></span>
                  <span className="w-5 h-5 rounded-full border bg-blue-500" title="Blue"></span>
                  <span className="w-5 h-5 rounded-full border bg-black" title="Black"></span>
                </div>
                <span className="text-xs text-gray-400">Quantity: 200</span>
              </div>
              <div className="mt-8">Best sellers will appear here soon.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {bestSellers.map((product) => {
                // Ensure price and offer are numbers
                const price = Number(product.price);
                const offer = product.offer ? Number(product.offer) : 0;
                const discountedPrice = offer ? price - price * (offer / 100) : price;
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/600x400";
                        }}
                      />
                      {offer > 0 && (
                        <div className="absolute top-4 right-4 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {offer}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex items-center mb-4">
                        <span className="text-lg font-bold text-pink-600">
                          ₹{discountedPrice.toFixed(2)}
                        </span>
                        {offer > 0 && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-center group-hover:text-pink-600">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage Section */}
      <MediaCoverageSection />

      <BrandCollaborationSection />
    </div>
  );
}