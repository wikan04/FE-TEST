"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ruasApi } from "@/lib/api";
import { Ruas } from "@/types/ruas";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const LeafletMap = dynamic(
  () => import("@/components/maps/LeafletMap").then((mod) => mod.LeafletMap),
  { ssr: false }
);

export default function DashboardPage() {
  const [ruasData, setRuasData] = useState<Ruas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRuasData();
    }
  }, []);

  const fetchRuasData = async () => {
    setIsLoading(true);
    setError("");

    const loadingToast = toast.loading("Memuat data ruas...");

    try {
      // Fetch all ruas with high per_page to get all data
      const response = await ruasApi.getAll(1, 100);

      // Filter only active ruas (status === '1')
      const activeRuas = response.data.filter((ruas) => ruas.status === "1");

      // Fetch detailed data for each ruas to get coordinates
      const ruasWithCoordinates = await Promise.all(
        activeRuas.map(async (ruas) => {
          try {
            const detailResponse = await ruasApi.getOne(ruas.id);
            return detailResponse.data;
          } catch (error) {
            console.error(`Error fetching ruas ${ruas.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null values
      const validRuas = ruasWithCoordinates.filter(
        (ruas): ruas is Ruas => ruas !== null
      );

      setRuasData(validRuas);
      toast.success(`${validRuas.length} ruas aktif dimuat`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error fetching ruas data:", error);
      setError("Gagal memuat data ruas. Silakan coba lagi.");
      toast.error("Gagal memuat data ruas", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToMasterData = () => {
    router.push("/master-data");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600 font-medium">
            Memuat peta ruas jalan tol...
          </p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={<AlertCircle className="h-16 w-16 text-red-400" />}
            title="Gagal Memuat Peta"
            description={error}
            action={{
              label: "Coba Lagi",
              onClick: fetchRuasData,
            }}
          />
        </div>
      </div>
    );
  }

  if (ruasData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <EmptyState
            title="Belum Ada Ruas Aktif"
            description="Belum ada data ruas dengan status aktif untuk ditampilkan di peta. Silakan tambahkan data ruas terlebih dahulu."
            action={{
              label: "Ke Master Data",
              onClick: handleNavigateToMasterData,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Info Badge */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2 animate-fadeIn">
        <p className="text-sm font-medium text-gray-700">
          Menampilkan{" "}
          <span className="text-blue-600 font-bold">{ruasData.length}</span>{" "}
          ruas aktif
        </p>
      </div>

      <LeafletMap ruasData={ruasData} />
    </div>
  );
}
