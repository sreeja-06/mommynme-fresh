import { useState } from "react";
import { Link } from "react-router-dom";
import icon from "../assets/images/icon.png";
import ShippingPolicy from "./ShippingPolicy";
import ReturnsPolicy from "./ReturnsPolicy";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Instagram } from "lucide-react";

const Footer = () => {
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isReturnsModalOpen, setIsReturnsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#f8f6fb] to-[#393646] text-[#fff] rounded-b-xl shadow-lg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center mb-4 space-x-3">
              <img src={icon} alt="Mommy n Me Logo" className="w-16 h-16 rounded-full shadow-lg" />
              <span className="text-3xl font-title1 font-medium text-white">
                Mommy <span className="text-white">n Me</span>
              </span>
            </div>
            <p className="text-white mb-6 text-lg">
              Where every stitch tells a story of love, <br />
              creativity, and craftsmanship.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/_mommy.n.me_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e5bad8]/20 hover:bg-[#e5bad8]/40 transition"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="mailto:mommynme@gmail.com"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e5bad8]/20 hover:bg-[#e5bad8]/40 transition"
              >
                <Mail className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold text-xl mb-4 text-[#fff] border-b-2 border-[#e5bad8] w-fit pb-1">Explore</h4>
            <ul className="space-y-3 text-lg">
              <li>
                <Link
                  to="/about"
                  className="flex items-center text-white hover:text-[#fff] transition"
                >
                  <span className="w-2 h-2 bg-[#e5bad8] rounded-full mr-2"></span>
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="flex items-center text-white hover:text-[#fff] transition"
                >
                  <span className="w-2 h-2 bg-[#e5bad8] rounded-full mr-2"></span>
                  Shop Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="flex items-center text-white hover:text-[#fff] transition"
                >
                  <span className="w-2 h-2 bg-[#e5bad8] rounded-full mr-2"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-xl mb-4 text-[#fff] border-b-2 border-[#e5bad8] w-fit pb-1">Support</h4>
            <ul className="space-y-3 text-lg">
              <li>
                <button
                  onClick={() => setIsShippingModalOpen(true)}
                  className="flex items-center text-white hover:text-[#fff] transition w-full text-left"
                >
                  <span className="w-2 h-2 bg-[#e5bad8] rounded-full mr-2"></span>
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsReturnsModalOpen(true)}
                  className="flex items-center text-white hover:text-[#fff] transition w-full text-left"
                >
                  <span className="w-2 h-2 bg-[#e5bad8] rounded-full mr-2"></span>
                  Returns & Exchanges
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-xl mb-4 text-[#fff] border-b-2 border-[#e5bad8] w-fit pb-1">
              Join Our Circle
            </h4>
            <p className="text-white mb-4 text-lg">
              Get updates on new patterns, exclusive offers, and crochet inspiration.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="bg-[#e5bad8]/20 text-white px-4 py-3 rounded-l-lg focus:ring-2 focus:ring-[#e5bad8] focus:border-transparent flex-1 placeholder-[#e5bad8]"
                required
              />
              <button
                type="submit"
                className="bg-[#a084ca] hover:bg-[#e5bad8] px-4 py-3 rounded-r-lg text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#e5bad8]/30 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-[#d1c7e0] text-lg font-title1">
          <span>
            &copy; {new Date().getFullYear()} Mommy n Me
          </span>
          <span>
            Powered by <strong className="font-bold text-[#fff]">Naiyo24</strong>
          </span>
        </div>
      </div>

      {/* Shipping Policy Modal */}
      <AnimatePresence>
        {isShippingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsShippingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-purple-800">
                  Shipping Policy
                </h3>
                <button
                  onClick={() => setIsShippingModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <ShippingPolicy />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Returns Policy Modal */}
      <AnimatePresence>
        {isReturnsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsReturnsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-purple-800">
                  Returns & Exchanges
                </h3>
                <button
                  onClick={() => setIsReturnsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <ReturnsPolicy />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
