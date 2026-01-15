"use client";

import { Modal } from "@/components/ui";
import { Ruas } from "@/types/ruas";
import { MapPin } from "lucide-react";

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
  if (!ruas) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Ruas" size="lg">
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Nama Ruas
            </label>
            <p className="mt-1 text-base text-gray-900">{ruas.ruas_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Unit Kerja
            </label>
            <p className="mt-1 text-base text-gray-900">
              {ruas.unit?.unit || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Panjang Ruas
            </label>
            <p className="mt-1 text-base text-gray-900">{ruas.long} km</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              KM Awal
            </label>
            <p className="mt-1 text-base text-gray-900">{ruas.km_awal}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              KM Akhir
            </label>
            <p className="mt-1 text-base text-gray-900">{ruas.km_akhir}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">
            Status
          </label>
          <p className="mt-1">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                ruas.status === "1"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {ruas.status === "1" ? "Aktif" : "Tidak Aktif"}
            </span>
          </p>
        </div>

        {/* Coordinates */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Koordinat ({ruas.coordinates?.length || 0} titik)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {ruas.coordinates?.map((coord, index) => (
              <div
                key={coord.id}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md"
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {index + 1}. {coord.coordinates}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Dibuat
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(ruas.created_at).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Diperbarui
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(ruas.updated_at).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
