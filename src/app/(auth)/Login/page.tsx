"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 3) {
      newErrors.password = "Password minimal 3 karakter";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon lengkapi form dengan benar");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Memproses login...");

    try {
      const response = await authApi.login(formData);

      if (response.status && response.access_token) {
        // Save auth data
        setAuth(response.access_token, formData.username);

        toast.success("Login berhasil! Selamat datang.", { id: loadingToast });

        // Small delay for better UX
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        toast.error("Login gagal. Silakan coba lagi.", { id: loadingToast });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

      if (error.response?.status === 401) {
        errorMessage = "Username atau password salah";
      } else if (error.response?.status === 422) {
        errorMessage = "Data yang dimasukkan tidak valid";
      } else if (error.message === "Network Error") {
        errorMessage = "Tidak dapat terhubung ke server";
      }

      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="mb-8 text-center">
        {/* Logo Placeholder */}
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">JM GIS</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang
        </h1>
        <p className="text-gray-600">Masuk untuk melanjutkan ke aplikasi</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <Input
          label="Username"
          type="text"
          placeholder="Masukkan username"
          value={formData.username}
          onChange={(e) => {
            setFormData({ ...formData, username: e.target.value });
            if (errors.username) setErrors({ ...errors, username: "" });
          }}
          error={errors.username}
          leftIcon={<User className="h-5 w-5 text-gray-400" />}
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Masukkan password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          error={errors.password}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
          disabled={isLoading}
        />

        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Login
        </Button>
      </form>
    </div>
  );
}
