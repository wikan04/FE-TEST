import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - JM GIS",
  description: "Login to Jasa Marga GIS Application",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        {children}
      </div>

      {/* Right Side - Illustration/Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-64 h-64 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                className="w-32 h-32 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Sistem Informasi Geografis
          </h2>
          <p className="text-gray-600 text-lg">PT Jasa Marga (Persero) Tbk</p>
          <p className="text-gray-500 mt-2">Pengelolaan Data Ruas Jalan Tol</p>
        </div>
      </div>
    </div>
  );
}
