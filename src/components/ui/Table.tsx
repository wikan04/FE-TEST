import React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Tidak ada data",
  className,
}: TableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider",
                  column.className
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
