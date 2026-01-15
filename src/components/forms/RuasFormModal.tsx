"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { Ruas, RuasFormData } from "@/types/ruas";
import { Unit } from "@/types/unit";
import { MapPin, X } from "lucide-react";

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
    long: 0,
    km_awal: "",
    km_akhir: "",
    status: "1",
    coordinates: [],
  });

  const [coordinateInput, setCoordinateInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or ruas changes
  useEffect(() => {
    if (isOpen) {
      if (ruas) {
        // Edit mode
        setFormData({
          unit_id: ruas.unit_id,
          ruas_name: ruas.ruas_name,
          long: ruas.long,
          km_awal: ruas.km_awal,
          km_akhir: ruas.km_akhir,
          status: ruas.status,
          coordinates: ruas.coordinates?.map((c) => c.coordinates) || [],
        });
      } else {
        // Add mode
        setFormData({
          unit_id: 0,
          ruas_name: "",
          long: 0,
          km_awal: "",
          km_akhir: "",
          status: "1",
          coordinates: [],
        });
      }
      setCoordinateInput("");
      setErrors({});
    }
  }, [isOpen, ruas]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.unit_id || formData.unit_id === 0) {
      newErrors.unit_id = "Unit Kerja wajib dipilih";
    }
    if (!formData.ruas_name.trim()) {
      newErrors.ruas_name = "Nama Ruas wajib diisi";
    }
    if (!formData.long || formData.long <= 0) {
      newErrors.long = "Panjang ruas harus lebih dari 0";
    }
    if (!formData.km_awal.trim()) {
      newErrors.km_awal = "KM Awal wajib diisi";
    }
    if (!formData.km_akhir.trim()) {
      newErrors.km_akhir = "KM Akhir wajib diisi";
    }
    if (formData.coordinates.length < 2) {
      newErrors.coordinates = "Minimal 2 koordinat diperlukan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCoordinate = () => {
    if (!coordinateInput.trim()) return;

    // Validate coordinate format (lat,lng)
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordPattern.test(coordinateInput.trim())) {
      setErrors({
        ...errors,
        coordinate:
          "Format koordinat tidak valid. Gunakan format: lat,lng (contoh: -6.2088,106.8456)",
      });
      return;
    }

    setFormData({
      ...formData,
      coordinates: [...formData.coordinates, coordinateInput.trim()],
    });
    setCoordinateInput("");
    setErrors({ ...errors, coordinate: "" });
  };

  const handleRemoveCoordinate = (index: number) => {
    setFormData({
      ...formData,
      coordinates: formData.coordinates.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ruas ? "Edit Ruas" : "Tambah Ruas"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Nama Ruas */}
        <Input
          label="Nama Ruas *"
          type="text"
          placeholder="Contoh: Jakarta Bogor Ciawi"
          value={formData.ruas_name}
          onChange={(e) =>
            setFormData({ ...formData, ruas_name: e.target.value })
          }
          error={errors.ruas_name}
        />

        {/* Panjang Ruas */}
        <Input
          label="Panjang Ruas (km) *"
          type="number"
          placeholder="Contoh: 34"
          value={formData.long.toString()}
          onChange={(e) =>
            setFormData({ ...formData, long: Number(e.target.value) })
          }
          error={errors.long}
        />

        {/* KM Awal & Akhir */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="KM Awal *"
            type="text"
            placeholder="Contoh: 1"
            value={formData.km_awal}
            onChange={(e) =>
              setFormData({ ...formData, km_awal: e.target.value })
            }
            error={errors.km_awal}
          />
          <Input
            label="KM Akhir *"
            type="text"
            placeholder="Contoh: 34"
            value={formData.km_akhir}
            onChange={(e) =>
              setFormData({ ...formData, km_akhir: e.target.value })
            }
            error={errors.km_akhir}
          />
        </div>

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

        {/* Coordinates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Koordinat * (minimal 2)
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Format: lat,lng (contoh: -6.2088,106.8456)"
              value={coordinateInput}
              onChange={(e) => setCoordinateInput(e.target.value)}
              error={errors.coordinate}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCoordinate();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCoordinate}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          {errors.coordinates && (
            <p className="mt-1 text-sm text-red-600">{errors.coordinates}</p>
          )}

          {/* Coordinate List */}
          {formData.coordinates.length > 0 && (
            <div className="mt-2 space-y-2">
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {ruas ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
