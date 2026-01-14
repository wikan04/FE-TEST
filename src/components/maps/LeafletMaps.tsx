"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ruas } from "@/types/ruas";
import { parseCoordinates } from "@/lib/utils";

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LeafletMapProps {
  ruasData: Ruas[];
  onRuasClick?: (ruas: Ruas) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  ruasData,
  onRuasClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Indonesia
    const map = L.map(mapContainerRef.current).setView([-6.2088, 106.8456], 10);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add ruas polylines to map
  useEffect(() => {
    if (!mapRef.current || !isMapReady || ruasData.length === 0) return;

    const map = mapRef.current;
    const polylines: L.Polyline[] = [];
    const bounds = L.latLngBounds([]);

    ruasData.forEach((ruas) => {
      if (!ruas.coordinates || ruas.coordinates.length === 0) return;

      // Convert coordinates to LatLng array
      const latLngs: L.LatLngExpression[] = ruas.coordinates
        .sort((a, b) => a.ordering - b.ordering)
        .map((coord) => parseCoordinates(coord.coordinates));

      // Create polyline
      const polyline = L.polyline(latLngs, {
        color: ruas.status === "1" ? "#1e40af" : "#94a3b8",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Add popup with ruas info
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-2">${ruas.ruas_name}</h3>
          <div class="text-xs space-y-1">
            <p><strong>Unit Kerja:</strong> ${ruas.unit?.unit || "-"}</p>
            <p><strong>Panjang:</strong> ${ruas.long} km</p>
            <p><strong>KM:</strong> ${ruas.km_awal} - ${ruas.km_akhir}</p>
            <p><strong>Status:</strong> ${
              ruas.status === "1" ? "Aktif" : "Tidak Aktif"
            }</p>
          </div>
        </div>
      `;

      polyline.bindPopup(popupContent);

      // Add click event
      if (onRuasClick) {
        polyline.on("click", () => {
          onRuasClick(ruas);
        });
      }

      polylines.push(polyline);

      // Extend bounds
      latLngs.forEach((latLng) => {
        bounds.extend(latLng as L.LatLngExpression);
      });
    });

    // Fit map to bounds if there are polylines
    if (polylines.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup
    return () => {
      polylines.forEach((polyline) => polyline.remove());
    };
  }, [ruasData, isMapReady, onRuasClick]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};
