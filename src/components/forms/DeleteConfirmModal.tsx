"use client";

import { Modal, Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus" size="sm">
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Hapus Data Ruas?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Apakah Anda yakin ingin menghapus ruas{" "}
          <span className="font-semibold">"{itemName}"</span>? Tindakan ini
          tidak dapat dibatalkan.
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  );
};
