import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import icon from '../assets/images/icon.png';
import { Instagram, ShoppingCart, User, Menu, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Catalogue' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
] as const;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`w-full rounded-t-xl px-4 py-2 fixed left-0 z-50 top-10 transition-colors duration-300 ${scrolled ? 'bg-transparent backdrop-blur' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="rounded-full shadow-lg bg-white p-2">
            <img src={icon} alt="Mommy n Me Logo" className="w-12 h-12 rounded-full" />
          </div>
          <span className="text-4xl font-title1 font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#8f6fd7] to-[#6ec3c7]">
            Mommy n Me
          </span>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden ml-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8f6fd7]"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-7 h-7 text-[#8f6fd7]" /> : <Menu className="w-7 h-7 text-[#8f6fd7]" />}
        </button>

        {/* Navigation - desktop */}
        <div className="hidden md:flex items-center space-x-1 bg-glass-100 backdrop-blur rounded-full shadow-md px-4 py-2">
          {NAV_ITEMS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`relative px-4 py-2 rounded-full transition-colors ${
                isActive(path)
                  ? 'bg-[#8f6fd7] text-white font-bold shadow'
                  : 'text-gray-600 hover:text-[#8f6fd7]'
              }`}
              aria-current={isActive(path) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          <a
            href="https://www.instagram.com/_mommy.n.me_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-[#8f6fd7] hover:text-[#6ec3c7] transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
          {loading ? (
            <div className="w-6 h-6 animate-pulse bg-purple-200 rounded-full"></div>
          ) : isLoggedIn ? (
            <Link
              to="/profile"
              aria-label="Profile"
              className="text-[#8f6fd7] hover:text-[#6ec3c7] transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>
          ) : (
            <Link
              to="/login"
              aria-label="Login"
              className="text-[#8f6fd7] hover:text-[#6ec3c7] transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-b-xl z-40 animate-fade-in">
          <div className="flex flex-col items-center py-4 space-y-2">
            {NAV_ITEMS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`w-full text-center px-4 py-2 rounded-full transition-colors ${
                  isActive(path)
                    ? 'bg-[#8f6fd7] text-white font-bold shadow'
                    : 'text-gray-600 hover:text-[#8f6fd7]'
                }`}
                aria-current={isActive(path) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
