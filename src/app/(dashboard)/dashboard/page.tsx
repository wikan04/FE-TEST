"use client";

import { useEffect, useState } from "react";
import { LeafletMap } from "@/components/maps/LeafletMaps";
import { ruasApi } from "@/lib/api";
import { Ruas } from "@/types/ruas";

export default function DashboardPage() {
  const [ruasData, setRuasData] = useState<Ruas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRuasData();
  }, []);

  const fetchRuasData = async () => {
    setIsLoading(true);
    setError("");

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
    } catch (error) {
      console.error("Error fetching ruas data:", error);
      setError("Gagal memuat data ruas. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuasClick = (ruas: Ruas) => {
    console.log("Ruas clicked:", ruas);
    // Popup sudah ditangani oleh LeafletMap component
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data ruas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRuasData}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <LeafletMap ruasData={ruasData} onRuasClick={handleRuasClick} />
    </div>
  );
}
