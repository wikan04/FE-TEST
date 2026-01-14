"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Lock, User } from "lucide-react";

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
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!formData.username) {
      newErrors.username = "Username wajib diisi";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login(formData);

      if (response.status && response.access_token) {
        // Save auth data
        setAuth(response.access_token, formData.username);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setLoginError("Login gagal. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setLoginError("Username atau password salah");
      } else {
        setLoginError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        {/* Logo Placeholder */}
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 font-semibold">App Logo</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang
        </h1>
        <p className="text-gray-600">Masuk untuk melanjutkan ke aplikasi</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Error Message */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {loginError}
          </div>
        )}

        {/* Username Input */}
        <Input
          label="Username"
          type="text"
          placeholder="Masukkan username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
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

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Username: <span className="font-medium">admin</span>
          </p>
          <p>
            Password: <span className="font-medium">123</span>
          </p>
        </div>
      </form>
    </div>
  );
}
