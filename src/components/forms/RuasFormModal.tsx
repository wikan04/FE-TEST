"use client";

import { useEffect, useState, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { Ruas, RuasFormData } from "@/types/ruas";
import { Unit } from "@/types/unit";
import { X, Trash2 } from "lucide-react";
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

// Create numbered icon with delete button
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

interface RuasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RuasFormData) => Promise<void>;
  ruas?: Ruas | null;
  units: Unit[];
}

export const RuasFormModal: React.FC<RuasFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ruas,
  units,
}) => {
  const [formData, setFormData] = useState<RuasFormData>({
    unit_id: 0,
    ruas_name: "",
    long: "",
    km_awal: "",
    km_akhir: "",
    status: "1",
    coordinates: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mapInitialized, setMapInitialized] = useState(false);

  // Map refs
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ marker: L.Marker; coord: string }[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Cleanup map on unmount or when modal closes
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      clearMap();
      mapRef.current.remove();
      mapRef.current = null;
      setMapInitialized(false);
    }
  }, [isOpen]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || mapRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      try {
        const map = L.map(mapContainerRef.current, {
          center: [-6.2088, 106.8456],
          zoom: 10,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        // Add click event to add markers
        map.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          handleMapClick(lat, lng);
        });

        mapRef.current = map;
        setMapInitialized(true);

        // Force map to recalculate size
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 200);

        // If editing, draw existing coordinates
        if (ruas && ruas.coordinates && ruas.coordinates.length > 0) {
          const coords = ruas.coordinates.map((c) => c.coordinates);
          setTimeout(() => {
            drawCoordinatesOnMap(coords);
          }, 300);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Reset form when modal opens/closes or ruas changes
  useEffect(() => {
    if (isOpen) {
      if (ruas) {
        // Edit mode
        const coordinates = ruas.coordinates?.map((c) => c.coordinates) || [];
        setFormData({
          unit_id: ruas.unit_id,
          ruas_name: ruas.ruas_name,
          long: String(ruas.long),
          km_awal: ruas.km_awal,
          km_akhir: ruas.km_akhir,
          status: ruas.status,
          coordinates: coordinates,
        });
      } else {
        // Add mode - RESET semua
        setFormData({
          unit_id: 0,
          ruas_name: "",
          long: "",
          km_awal: "",
          km_akhir: "",
          status: "1",
          coordinates: [],
        });
        if (mapRef.current) {
          clearMap();
        }
      }
      setErrors({});
    }
  }, [isOpen, ruas]);

  const handleMapClick = (lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)},${lng.toFixed(6)}`;

    // Update formData dengan menambah koordinat baru
    setFormData((prevData) => {
      const newCoordinates = [...prevData.coordinates, coordString];

      // Add marker to map dengan index yang benar
      if (mapRef.current) {
        const markerIndex = newCoordinates.length;
        const marker = L.marker([lat, lng], {
          icon: createNumberedIcon(markerIndex),
        }).addTo(mapRef.current);

        // Popup dengan tombol hapus
        const popupContent = `
          <div style="text-align: center;">
            <strong>Titik ${markerIndex}</strong><br>
            <small>${coordString}</small><br>
            <button 
              onclick="window.removeCoordinate(${markerIndex - 1})"
              style="
                margin-top: 8px;
                padding: 4px 8px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              "
            >
              Hapus
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push({ marker, coord: coordString });

        // Update polyline
        updatePolyline(newCoordinates);
      }

      return {
        ...prevData,
        coordinates: newCoordinates,
      };
    });
  };

  const drawCoordinatesOnMap = (coordinates: string[]) => {
    if (!mapRef.current || coordinates.length === 0) return;

    clearMap();

    const latLngs: L.LatLngExpression[] = [];

    coordinates.forEach((coord, index) => {
      const [lat, lng] = coord.split(",").map(Number);
      latLngs.push([lat, lng]);

      const marker = L.marker([lat, lng], {
        icon: createNumberedIcon(index + 1),
      }).addTo(mapRef.current!);

      const popupContent = `
        <div style="text-align: center;">
          <strong>Titik ${index + 1}</strong><br>
          <small>${coord}</small><br>
          <button 
            onclick="window.removeCoordinate(${index})"
            style="
              margin-top: 8px;
              padding: 4px 8px;
              background: #ef4444;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            "
          >
            Hapus
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push({ marker, coord });
    });

    // Draw polyline
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: "#1e40af",
        weight: 4,
      }).addTo(mapRef.current);
    }

    // Fit bounds
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const updatePolyline = (coordinates: string[]) => {
    if (!mapRef.current) return;

    // Remove old polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (coordinates.length > 1) {
      const latLngs = coordinates.map((coord) => {
        const [lat, lng] = coord.split(",").map(Number);
        return [lat, lng] as L.LatLngExpression;
      });

      polylineRef.current = L.polyline(latLngs, {
        color: "#1e40af",
        weight: 4,
      }).addTo(mapRef.current);
    }
  };

  const clearMap = () => {
    // Remove all markers
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    // Remove polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
  };

  const handleRemoveCoordinate = (index: number) => {
    const newCoordinates = formData.coordinates.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      coordinates: newCoordinates,
    });

    // Redraw map dengan koordinat baru
    if (mapRef.current) {
      drawCoordinatesOnMap(newCoordinates);
    }
  };

  // Expose remove function to window for popup button
  useEffect(() => {
    if (isOpen) {
      (window as any).removeCoordinate = handleRemoveCoordinate;
    }
    return () => {
      delete (window as any).removeCoordinate;
    };
  }, [isOpen, formData.coordinates]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.unit_id || formData.unit_id === 0) {
      newErrors.unit_id = "Unit Kerja wajib dipilih";
    }
    if (!formData.ruas_name.trim()) {
      newErrors.ruas_name = "Nama Ruas wajib diisi";
    }

    const longValue = String(formData.long).trim();
    if (
      !longValue ||
      longValue === "" ||
      Number(longValue) <= 0 ||
      isNaN(Number(longValue))
    ) {
      newErrors.long = "Panjang ruas harus lebih dari 0";
    }

    if (!formData.km_awal.trim()) {
      newErrors.km_awal = "KM Awal wajib diisi";
    }
    if (!formData.km_akhir.trim()) {
      newErrors.km_akhir = "KM Akhir wajib diisi";
    }
    if (formData.coordinates.length < 2) {
      newErrors.coordinates =
        "Minimal 2 koordinat diperlukan. Klik pada peta untuk menambah koordinat.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      clearMap();
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (mapRef.current) {
      clearMap();
      mapRef.current.remove();
      mapRef.current = null;
      setMapInitialized(false);
    }
    onClose();
  };

  const handleClearAllCoordinates = () => {
    setFormData({
      ...formData,
      coordinates: [],
    });
    clearMap();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={ruas ? "Edit Ruas" : "Tambah Ruas"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nama Ruas */}
          <Input
            label="Ruas *"
            type="text"
            placeholder="Contoh: Jakarta Bogor Ciawi"
            value={formData.ruas_name}
            onChange={(e) =>
              setFormData({ ...formData, ruas_name: e.target.value })
            }
            error={errors.ruas_name}
          />

          {/* KM Awal */}
          <Input
            label="Km Awal *"
            type="text"
            placeholder="Contoh: 1"
            value={formData.km_awal}
            onChange={(e) =>
              setFormData({ ...formData, km_awal: e.target.value })
            }
            error={errors.km_awal}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Unit Kerja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Kerja *
            </label>
            <select
              value={formData.unit_id}
              onChange={(e) =>
                setFormData({ ...formData, unit_id: Number(e.target.value) })
              }
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value={0}>Pilih Unit Kerja</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit}
                </option>
              ))}
            </select>
            {errors.unit_id && (
              <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>
            )}
          </div>

          {/* KM Akhir */}
          <Input
            label="Km Akhir *"
            type="text"
            placeholder="Contoh: 34"
            value={formData.km_akhir}
            onChange={(e) =>
              setFormData({ ...formData, km_akhir: e.target.value })
            }
            error={errors.km_akhir}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Panjang Ruas */}
          <Input
            label="Panjang (km) *"
            type="text"
            placeholder="Contoh: 34"
            value={formData.long}
            onChange={(e) => setFormData({ ...formData, long: e.target.value })}
            error={errors.long}
          />

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value="1">Aktif</option>
              <option value="0">Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Interactive Map */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              * Klik pada peta untuk menambah ruas
            </label>
            {formData.coordinates.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllCoordinates}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Hapus Semua
              </button>
            )}
          </div>
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
          {errors.coordinates && (
            <p className="mt-1 text-sm text-red-600">{errors.coordinates}</p>
          )}
        </div>

        {/* Coordinate List */}
        {formData.coordinates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Koordinat yang Ditambahkan ({formData.coordinates.length})
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {formData.coordinates.map((coord, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span className="text-sm text-gray-700">
                    {index + 1}. {coord}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoordinate(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
