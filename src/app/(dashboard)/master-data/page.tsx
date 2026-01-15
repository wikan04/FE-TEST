"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, SearchInput, Table, Pagination } from "@/components/ui";
import { TableLoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState, SearchEmptyState } from "@/components/ui/EmptyState";
import { ruasApi, unitApi } from "@/lib/api";
import { Ruas } from "@/types/ruas";
import { Unit } from "@/types/unit";
import { Eye, Pencil, Plus, Trash2, FileX, AlertCircle } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import toast from "react-hot-toast";

const RuasFormModal = dynamic(
  () =>
    import("@/components/forms/RuasFormModal").then((mod) => mod.RuasFormModal),
  { ssr: false }
);
const DeleteConfirmModal = dynamic(
  () =>
    import("@/components/forms/DeleteConfirmModal").then(
      (mod) => mod.DeleteConfirmModal
    ),
  { ssr: false }
);
const RuasDetailModal = dynamic(
  () =>
    import("@/components/forms/RuasDetailModal").then(
      (mod) => mod.RuasDetailModal
    ),
  { ssr: false }
);

export default function MasterDataPage() {
  const [ruasData, setRuasData] = useState<Ruas[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [error, setError] = useState("");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRuas, setSelectedRuas] = useState<Ruas | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchRuasData();
  }, [currentPage, perPage]);

  const fetchUnits = async () => {
    try {
      const response = await unitApi.getAll();
      setUnits(response.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Gagal memuat data unit kerja");
    }
  };

  const fetchRuasData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await ruasApi.getAll(currentPage, perPage);

      // Fetch detail for each ruas to get unit and coordinates
      const ruasWithDetails = await Promise.all(
        response.data.map(async (ruas) => {
          try {
            const detail = await ruasApi.getOne(ruas.id);
            return detail.data;
          } catch (error) {
            console.error(`Error fetching ruas ${ruas.id}:`, error);
            return ruas;
          }
        })
      );

      setRuasData(ruasWithDetails);
      setTotalPages(response.last_page);
      setTotalData(response.total);
    } catch (error: any) {
      console.error("Error fetching ruas:", error);
      setError("Gagal memuat data ruas");
      toast.error("Gagal memuat data ruas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRuas = async (formData: any) => {
    const loadingToast = toast.loading("Menambah data ruas...");
    try {
      await ruasApi.create(formData);
      await fetchRuasData();
      setIsFormModalOpen(false);
      toast.success("Data ruas berhasil ditambahkan!", { id: loadingToast });
    } catch (error: any) {
      console.error("Error adding ruas:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menambah data ruas";
      toast.error(errorMessage, { id: loadingToast });
      throw error;
    }
  };

  const handleEditRuas = async (formData: any) => {
    if (!selectedRuas) return;

    const loadingToast = toast.loading("Mengupdate data ruas...");
    try {
      await ruasApi.update(selectedRuas.id, formData);
      await fetchRuasData();
      setIsFormModalOpen(false);
      setSelectedRuas(null);
      toast.success("Data ruas berhasil diupdate!", { id: loadingToast });
    } catch (error: any) {
      console.error("Error updating ruas:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal mengupdate data ruas";
      toast.error(errorMessage, { id: loadingToast });
      throw error;
    }
  };

  const handleDeleteRuas = async () => {
    if (!selectedRuas) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Menghapus data ruas...");
    try {
      await ruasApi.delete(selectedRuas.id);
      await fetchRuasData();
      setIsDeleteModalOpen(false);
      setSelectedRuas(null);
      toast.success("Data ruas berhasil dihapus!", { id: loadingToast });
    } catch (error: any) {
      console.error("Error deleting ruas:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus data ruas";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetail = async (ruas: Ruas) => {
    const loadingToast = toast.loading("Memuat detail ruas...");
    try {
      const detail = await ruasApi.getOne(ruas.id);
      setSelectedRuas(detail.data);
      setIsDetailModalOpen(true);
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Error fetching ruas detail:", error);
      toast.error("Gagal memuat detail ruas", { id: loadingToast });
    }
  };

  // Filter data based on debounced search
  const filteredData = ruasData.filter((ruas) =>
    ruas.ruas_name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const columns = [
    {
      key: "no",
      label: "No",
      render: (_: Ruas, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      className: "text-center w-16",
    },
    {
      key: "ruas_name",
      label: "Ruas",
      render: (ruas: Ruas) => (
        <div className="font-medium text-gray-900">{ruas.ruas_name}</div>
      ),
    },
    {
      key: "unit",
      label: "Unit Kerja",
      render: (ruas: Ruas) => (
        <div className="text-gray-700">{ruas.unit?.unit || "-"}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (ruas: Ruas) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            ruas.status === "1"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {ruas.status === "1" ? "Aktif" : "Tidak Aktif"}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "actions",
      label: "Aksi",
      render: (ruas: Ruas) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewDetail(ruas)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Lihat Detail"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedRuas(ruas);
              setIsFormModalOpen(true);
            }}
            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedRuas(ruas);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-center w-32",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Master Data Ruas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola data ruas jalan tol
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedRuas(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Ruas
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama ruas..."
            />
            {debouncedSearch && (
              <p className="text-sm text-gray-500">
                Mencari: <span className="font-medium">{debouncedSearch}</span>
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <TableLoadingSkeleton />
        ) : error ? (
          <div className="p-6">
            <EmptyState
              icon={<AlertCircle className="h-16 w-16 text-red-400" />}
              title="Gagal Memuat Data"
              description={error}
              action={{
                label: "Coba Lagi",
                onClick: fetchRuasData,
              }}
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-6">
            {debouncedSearch ? (
              <SearchEmptyState searchQuery={debouncedSearch} />
            ) : (
              <EmptyState
                icon={<FileX className="h-16 w-16" />}
                title="Belum Ada Data Ruas"
                description="Tambahkan data ruas jalan tol untuk mulai mengelola data."
                action={{
                  label: "Tambah Ruas",
                  onClick: () => {
                    setSelectedRuas(null);
                    setIsFormModalOpen(true);
                  },
                }}
              />
            )}
          </div>
        ) : (
          <>
            <Table
              data={filteredData}
              columns={columns}
              keyExtractor={(ruas) => ruas.id.toString()}
              emptyMessage="Tidak ada data ruas"
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <RuasFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedRuas(null);
        }}
        onSubmit={selectedRuas ? handleEditRuas : handleAddRuas}
        ruas={selectedRuas}
        units={units}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRuas(null);
        }}
        onConfirm={handleDeleteRuas}
        itemName={selectedRuas?.ruas_name || ""}
        isDeleting={isDeleting}
      />

      <RuasDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRuas(null);
        }}
        ruas={selectedRuas}
      />
    </div>
  );
}
