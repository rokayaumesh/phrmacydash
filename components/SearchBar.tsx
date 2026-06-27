"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative">

      <input
        type="text"
        value={value}
        placeholder="🔍 Search medicine..."
        onChange={(e) => onChange(e.target.value)}
        className="w-half rounded-xl border border-gray-300 px-5 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
        >
          ✕
        </button>
      )}

    </div>
  );
}