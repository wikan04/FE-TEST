import React from "react";
import { FileX, Search } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4">
        {icon || <FileX className="h-16 w-16" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export const SearchEmptyState: React.FC<{ searchQuery: string }> = ({
  searchQuery,
}) => {
  return (
    <EmptyState
      icon={<Search className="h-16 w-16" />}
      title="Tidak ada hasil"
      description={`Tidak ditemukan data dengan kata kunci "${searchQuery}". Coba kata kunci lain.`}
    />
  );
};
