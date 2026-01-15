"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ruas } from "@/types/ruas";
import { parseCoordinates } from "@/lib/utils";

// Fix Leaflet default icon issue with Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Custom icons for start and end points
const createIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        
      </div>
    `,
    className: "custom-numbered-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

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

  //nambahin ruas dan marker
  useEffect(() => {
    if (!mapRef.current || !isMapReady || ruasData.length === 0) return;

    const map = mapRef.current;
    const polylines: L.Polyline[] = [];
    const markers: L.Marker[] = [];
    const bounds = L.latLngBounds([]);

    ruasData.forEach((ruas, ruasIndex) => {
      if (!ruas.coordinates || ruas.coordinates.length === 0) return;

      const latLngs: L.LatLngExpression[] = ruas.coordinates
        .sort((a, b) => a.ordering - b.ordering)
        .map((coord) => parseCoordinates(coord.coordinates));

      const polyline = L.polyline(latLngs, {
        color: ruas.status === "1" ? "#1e40af" : "#94a3b8",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      const polylinePopupContent = `
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

      polyline.bindPopup(polylinePopupContent);

      if (onRuasClick) {
        polyline.on("click", () => {
          onRuasClick(ruas);
        });
      }

      polylines.push(polyline);
      //Start Marker
      if (latLngs.length > 0) {
        const startPoint = latLngs[0] as [number, number];
        const startMarker = L.marker(startPoint, {
          icon: createIcon("#10b981"),
        }).addTo(map);

        startMarker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">Titik Awal</h3>
            <p class="text-xs"><strong>Ruas:</strong> ${ruas.ruas_name}</p>
            <p class="text-xs"><strong>KM:</strong> ${ruas.km_awal}</p>
            <p class="text-xs text-gray-600">${startPoint[0].toFixed(
              6
            )}, ${startPoint[1].toFixed(6)}</p>
          </div>
        `);

        markers.push(startMarker);
        bounds.extend(startPoint);
      }

      // End Marker
      if (latLngs.length > 1) {
        const endPoint = latLngs[latLngs.length - 1] as [number, number];
        const endMarker = L.marker(endPoint, {
          icon: createIcon("#ef4444"),
        }).addTo(map);

        endMarker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">Titik Akhir</h3>
            <p class="text-xs"><strong>Ruas:</strong> ${ruas.ruas_name}</p>
            <p class="text-xs"><strong>KM:</strong> ${ruas.km_akhir}</p>
            <p class="text-xs text-gray-600">${endPoint[0].toFixed(
              6
            )}, ${endPoint[1].toFixed(6)}</p>
          </div>
        `);

        markers.push(endMarker);
        bounds.extend(endPoint);
      }

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
      markers.forEach((marker) => marker.remove());
    };
  }, [ruasData, isMapReady, onRuasClick]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};
