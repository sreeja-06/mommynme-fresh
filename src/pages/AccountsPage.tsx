import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Home, LogOut } from "lucide-react";

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder for user info, can be replaced with real data
  const user = {
    email: "your@email.com",
    name: "New User",
  };

  const handleLogout = () => {
    // Clear auth/session here if needed
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-purple-100 text-center">
        <div className="flex flex-col items-center mb-6">
          <User className="w-14 h-14 text-purple-500 mb-2" />
          <h1 className="text-2xl font-bold text-purple-800 mb-1">Welcome, {user.name}!</h1>
          <p className="text-gray-600 text-sm">Your account has been created successfully.</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <div className="text-left">
            <div className="mb-2">
              <span className="font-semibold text-purple-700">Email:</span> {user.email}
            </div>
            {/* Add more user info here if available */}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-600 text-white font-medium shadow hover:bg-purple-700 transition"
          >
            <User className="w-5 h-5" /> View Profile
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-500 text-white font-medium shadow hover:bg-indigo-600 transition"
          >
            <Home className="w-5 h-5" /> Go to Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-medium shadow hover:bg-gray-300 transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
