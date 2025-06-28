import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "./components/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalLoader from "./components/GlobalLoader";
import LoginSignupPage from "./pages/LoginSignupPage";
import NotFound from "./pages/NotFound";
import { HashLoader } from 'react-spinners';
import { supabase } from "./utils/supabaseClient";

// Lazy-loaded components
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <HashLoader color="#4f46e5" size={50} />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <GlobalLoader />
        <Navbar />
        <main className="flex-grow">
          <ScrollToTop />
          <Suspense fallback={
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <HashLoader color="#4f46e5" size={50} />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<LoginSignupPage />} />
              {/* Admin Panel Route */}
              <Route path="/AdminPanel" element={<AdminPanel />} />
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              {/* 404 Catch-all route - MUST be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default App;