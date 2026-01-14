"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, User, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { username, clearAuth } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Master Data", path: "/master-data" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-24 h-10 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">
                  App Logo
                </span>
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            {/* User Info & Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {username}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {username}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Hamburger Menu Icon - Mobile */}
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation - bisa dikembangkan nanti */}
      </div>
    </nav>
  );
};
