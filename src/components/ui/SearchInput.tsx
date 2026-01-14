import React from "react";
import { Search } from "lucide-react";
import { Input } from "./Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Cari...",
}) => {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      leftIcon={<Search className="h-5 w-5 text-gray-400" />}
      className="max-w-xs"
    />
  );
};
