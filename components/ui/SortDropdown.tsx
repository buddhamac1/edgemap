"use client";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const sortOptions = [
    { value: "edge", label: "Edge Size" },
    { value: "confidence", label: "Confidence" },
    { value: "recency", label: "Recency" },
    { value: "volume", label: "Volume" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent hover:border-zinc-600 transition-colors"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
