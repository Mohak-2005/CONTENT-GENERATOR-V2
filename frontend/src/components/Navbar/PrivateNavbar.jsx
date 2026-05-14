import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import { FiLogOut } from "react-icons/fi";
import { FaCreativeCommonsShare } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutAPI } from "../../apis/user/usersAPI";
import { useAuth } from "../../AuthContext/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/plans" },
];

export default function PrivateNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mutation = useMutation({ mutationFn: logoutAPI });

  // ✅ async logout — waits for backend to clear cookie before redirecting
  const handleLogout = async () => {
    try {
      await mutation.mutateAsync(); // wait for logout API to complete
    } catch (e) {
      // ignore errors, still logout
    } finally {
      logout(); // clear auth state
      queryClient.clear(); // clear all cached data
      navigate("/login"); // redirect to login
    }
  };

  return (
    <nav className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left side */}
          <div className="flex">
            {/* Mobile menu button */}
            <div className="-ml-2 mr-2 flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-white">
                <FaCreativeCommonsShare className="h-10 w-10" />
              </Link>
            </div>
            {/* Desktop nav links */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/generate-content"
              className="animate-bounce inline-flex items-center gap-x-1.5 rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
            >
              <PlusIcon className="-ml-0.5 h-5 w-5" />
              Generate content
            </Link>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-700"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
