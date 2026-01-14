"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // Initialize auth state from localStorage
    initAuth();
  }, [initAuth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
