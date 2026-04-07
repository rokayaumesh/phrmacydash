import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelDashboard() {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 h-screen bg-gray-100 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Excel Live Dashboard</h1>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />

      <div className="overflow-hidden flex-1 bg-white rounded-2xl shadow">
        <div className="animate-scroll">
          {[...data, ...data].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 border-b px-4 py-2 text-sm"
            >
              {row.map((cell, j) => (
                <div key={j} className="truncate">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-scroll {
          display: flex;
          flex-direction: column;
          animation: scroll 20s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}
