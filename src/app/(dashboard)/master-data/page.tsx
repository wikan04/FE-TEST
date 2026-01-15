"use client";

import { useEffect, useState } from "react";
import { Button, SearchInput, Table, Pagination } from "@/components/ui";
import { ruasApi, unitApi } from "@/lib/api";
import { Ruas } from "@/types/ruas";
import { Unit } from "@/types/unit";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { RuasFormModal } from "@/components/forms/RuasFormModal";
import { DeleteConfirmModal } from "@/components/forms/DeleteConfirmModal";
import { RuasDetailModal } from "@/components/forms/RuasDetailModal";

export default function MasterDataPage() {
  const [ruasData, setRuasData] = useState<Ruas[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

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
    }
  };

  const fetchRuasData = async () => {
    setIsLoading(true);
    try {
      const response = await ruasApi.getAll(currentPage, perPage);

      // Fetch detail for each ruas to get unit and coordinates
      const ruasWithDetails = await Promise.all(
        response.data.map(async (ruas) => {
          try {
            const detail = await ruasApi.getOne(ruas.id);
            return detail.data;
          } catch (error) {
            return ruas;
          }
        })
      );

      setRuasData(ruasWithDetails);
      setTotalPages(response.last_page);
      setTotalData(response.total);
    } catch (error) {
      console.error("Error fetching ruas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRuas = async (formData: any) => {
    try {
      await ruasApi.create(formData);
      await fetchRuasData();
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error adding ruas:", error);
      throw error;
    }
  };

  const handleEditRuas = async (formData: any) => {
    if (!selectedRuas) return;

    try {
      await ruasApi.update(selectedRuas.id, formData);
      await fetchRuasData();
      setIsFormModalOpen(false);
      setSelectedRuas(null);
    } catch (error) {
      console.error("Error updating ruas:", error);
      throw error;
    }
  };

  const handleDeleteRuas = async () => {
    if (!selectedRuas) return;

    setIsDeleting(true);
    try {
      await ruasApi.delete(selectedRuas.id);
      await fetchRuasData();
      setIsDeleteModalOpen(false);
      setSelectedRuas(null);
    } catch (error) {
      console.error("Error deleting ruas:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetail = async (ruas: Ruas) => {
    try {
      const detail = await ruasApi.getOne(ruas.id);
      setSelectedRuas(detail.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching ruas detail:", error);
    }
  };

  // Filter data based on search
  const filteredData = ruasData.filter((ruas) =>
    ruas.ruas_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "no",
      label: "No",
      render: (_: Ruas, index: number) =>
        (currentPage - 1) * perPage + index + 1,
      className: "text-center",
    },
    {
      key: "ruas_name",
      label: "Ruas",
    },
    {
      key: "unit",
      label: "Unit Kerja",
      render: (ruas: Ruas) => ruas.unit?.unit || "-",
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
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Lihat Detail"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedRuas(ruas);
              setIsFormModalOpen(true);
            }}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedRuas(ruas);
              setIsDeleteModalOpen(true);
            }}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-center",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Master Data Ruas
            </h1>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedRuas(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama ruas..."
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
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
