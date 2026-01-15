"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "@/components/ui";
import { Ruas } from "@/types/ruas";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create numbered icon
const createNumberedIcon = (number: number, color: string = "#1e40af") => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">${number}</span>
      </div>
    `,
    className: "custom-numbered-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface RuasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruas: Ruas | null;
}

export const RuasDetailModal: React.FC<RuasDetailModalProps> = ({
  isOpen,
  onClose,
  ruas,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Cleanup map on unmount or when modal closes
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setMapInitialized(false);
    }
  }, [isOpen]);

  // Initialize and draw map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !ruas || mapRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || !ruas) return;

      try {
        // Initialize map
        const map = L.map(mapContainerRef.current, {
          center: [-6.2088, 106.8456],
          zoom: 10,
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setMapInitialized(true);

        // Force map to recalculate size
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }

          // Draw coordinates if available
          if (ruas.coordinates && ruas.coordinates.length > 0) {
            drawCoordinatesOnMap(map, ruas);
          }
        }, 200);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, ruas]);

  const drawCoordinatesOnMap = (map: L.Map, ruasData: Ruas) => {
    if (!ruasData.coordinates || ruasData.coordinates.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    // Add markers for each coordinate
    ruasData.coordinates
      .sort((a, b) => a.ordering - b.ordering)
      .forEach((coord, index) => {
        const [lat, lng] = coord.coordinates.split(",").map(Number);
        latLngs.push([lat, lng]);

        // Create marker with number
        const marker = L.marker([lat, lng], {
          icon: createNumberedIcon(index + 1),
        }).addTo(map);

        marker.bindPopup(`
          <div style="text-align: center;">
            <strong>Titik ${index + 1}</strong><br>
            <small>${coord.coordinates}</small>
          </div>
        `);
      });

    // Draw polyline connecting all points
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: ruasData.status === "1" ? "#1e40af" : "#94a3b8",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
    }

    // Fit map to show all markers
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  if (!ruas) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Ruas" size="xl">
      <div className="space-y-4">
        {/* Form Fields - Read Only */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nama Ruas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruas
            </label>
            <input
              type="text"
              value={ruas.ruas_name}
              readOnly
              className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>

          {/* KM Awal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Km Awal
            </label>
            <input
              type="text"
              value={ruas.km_awal}
              readOnly
              className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Unit Kerja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Kerja
            </label>
            <input
              type="text"
              value={ruas.unit?.unit || "-"}
              readOnly
              className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>

          {/* KM Akhir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Km Akhir
            </label>
            <input
              type="text"
              value={ruas.km_akhir}
              readOnly
              className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Panjang Ruas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang (km) *
            </label>
            <input
              type="text"
              value={ruas.long}
              readOnly
              className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <input
              type="text"
              value={ruas.status === "1" ? "Aktif" : "Tidak Aktif"}
              readOnly
              className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        {/* Map Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peta Ruas
          </label>
          <div
            ref={mapContainerRef}
            className="w-full h-96 rounded-md border border-gray-300 bg-gray-100"
            style={{ minHeight: "384px" }}
          >
            {!mapInitialized && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading map...</p>
              </div>
            )}
          </div>
        </div>

        {/* Coordinate List - Optional */}
        {ruas.coordinates && ruas.coordinates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daftar Koordinat ({ruas.coordinates.length} titik)
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1 bg-gray-50 rounded-md p-2">
              {ruas.coordinates
                .sort((a, b) => a.ordering - b.ordering)
                .map((coord, index) => (
                  <div
                    key={coord.id}
                    className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1"
                  >
                    <span className="font-medium w-6">{index + 1}.</span>
                    <span className="font-mono text-xs">
                      {coord.coordinates}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Dibuat
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(ruas.created_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Diperbarui
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(ruas.updated_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
