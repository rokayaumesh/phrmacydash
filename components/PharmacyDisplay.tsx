"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import SearchBar from "./SearchBar";
import QRCodeCard from "./QRCodeCard";

interface Medicine {
  generic_name: string;
  list_price: number;
  total_free_qty: number;
  availability: string;
}

function available(value: string) {
  const v = value.toLowerCase();
  return v.includes("yes") || v.includes("available");
}

/**
 * Group rows by EXACT generic_name (trimmed).
 * Within each group:
 *  - if any row has total_free_qty > 0, keep only those rows (drop the zero-qty dupes)
 *  - if none have qty > 0, keep a single representative row so it still shows as out of stock
 * Rows with an empty generic_name are left alone (not merged together).
 */
function dedupeByGenericName(meds: Medicine[]): Medicine[] {
  const groups = new Map<string, Medicine[]>();
  let emptyIndex = 0;

  for (const m of meds) {
    const trimmed = (m.generic_name ?? "").trim();
    const key = trimmed === "" ? `__empty_${emptyIndex++}` : trimmed;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  const result: Medicine[] = [];

  for (const rows of groups.values()) {
    const withQty = rows.filter((r) => r.total_free_qty > 0);

    if (withQty.length > 0) {
      result.push(...withQty);
    } else {
      // none of the duplicates have quantity, keep one so it still appears as "Out of Stock"
      result.push(rows[0]);
    }
  }

  return result;
}

export default function PharmacyDisplay() {
  const [data, setData] = useState<Medicine[]>([]);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  async function loadExcel() {
    try {
      const res = await fetch("/api/excel/active", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const blob = await res.blob();

      if (blob.size === 0) return;

      const arrayBuffer = await blob.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      });

      const [, ...rows] = json as any[];

      let medicines: Medicine[] = rows.map((r: any[]) => ({
        generic_name: r?.[1] ?? "",
        list_price: Number(r?.[2] ?? 0),
        total_free_qty: Number(r?.[3] ?? 0),
        availability: r?.[4] ?? "",
      }));

      // Dedupe exact generic_name duplicates, preferring rows that have quantity
      medicines = dedupeByGenericName(medicines);

      medicines.sort(() => Math.random() - 0.5);

      setData(medicines);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    loadExcel();

    const refresh = setInterval(loadExcel, 5000);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const rotate = setInterval(() => {
      setIndex((i) => (i + 1) % data.length);
    }, 2000);

    return () => clearInterval(rotate);
  }, [data]);

  // Overall available / unavailable counts across the full (deduped) dataset
  const stats = useMemo(() => {
    const total = data.length;
    const availableCount = data.filter((m) => available(m.availability)).length;
    const unavailableCount = total - availableCount;
    return { total, availableCount, unavailableCount };
  }, [data]);

  const visible = useMemo(() => {
    let medicines = [...data];

    if (search.trim()) {
      const q = search.toLowerCase().trim();

      return medicines.filter((m) =>
        [
          m.generic_name,
          m.list_price,
          m.total_free_qty,
          m.availability,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Normal display (auto-rotating)
    const slice = medicines.slice(index, index + 30);

    const result: Medicine[] = [];
    let out = 0;

    for (const row of slice) {
      const ok = available(row.availability);

      if (!ok) {
        if (out >= 1) continue;
        out++;
      }

      result.push(row);

      if (result.length === 8) break;
    }

    return result;
  }, [data, index, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-3 sm:p-6">

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">

        <div className="flex-1 w-full">

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white rounded-2xl border p-3 sm:p-5 shadow">

            <Image
              src="/logogp.png"
              alt="logo"
              width={80}
              height={80}
              priority
              className="w-14 h-14 sm:w-20 sm:h-20"
            />

            <div className="flex-1 text-center">

              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-blue-900 leading-tight">

                कर्णाली स्वास्थ्य बिज्ञान प्रतिष्ठान 

              </h1>

              <p className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base">

                चन्दननाथ - ०४, जुम्ला | फोन: ०८७-५२०३५५ | Website:
                kahs.edu.np

              </p>

              <div className="mt-3 sm:mt-4">

                <span className="bg-blue-100 text-blue-900 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold text-sm sm:text-base">

                  फार्मेसीमा उपलब्ध औषधिहरू को सूचीहरु

                </span>

              </div>

            </div>

          </div>

          <div className="text-black mt-5">

            <SearchBar
              value={search}
              onChange={setSearch}
            />

          </div>

        </div>

        <QRCodeCard />

      </div>

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs sm:text-sm">
        <div className="flex gap-3">
          <span className="text-gray-600">
            Total: <span className="font-semibold text-gray-800">{stats.total}</span>
          </span>
          <span className="text-green-700">
            In Stock: <span className="font-semibold">{stats.availableCount}</span>
          </span>
          <span className="text-red-700">
            Out of Stock: <span className="font-semibold">{stats.unavailableCount}</span>
          </span>
        </div>
        <div className="text-right text-gray-500">
          Last Updated : {lastUpdate}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-blue-900 text-white rounded-xl mt-6 px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base sticky top-0 z-20">

        <div>Medicine</div>

        <div>Quantity</div>

        <div>Price</div>

        <div>Status</div>

      </div>

      <div className="space-y-3 sm:space-y-4 mt-4">

        {visible.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-6 sm:p-10 text-center text-gray-500">

            No medicines found.

          </div>

        ) : (

          visible.map((row, i) => {

            const ok = available(row.availability);

            return (

              <div
                key={i}
                className={`grid grid-cols-4 gap-2 sm:gap-4 items-center rounded-2xl shadow border px-3 sm:px-6 py-3 sm:py-5 transition-all duration-300
                ${
                  ok
                    ? "bg-white border-gray-200"
                    : "bg-red-50 border-red-300"
                }`}
              >

                <div className="text-black text-sm sm:text-lg font-semibold break-words">

                  {row.generic_name}

                </div>

                <div className="text-black text-sm sm:text-lg">

                  {Math.max(0, row.total_free_qty)}

                </div>

                <div className="text-black text-sm sm:text-lg">

                  Rs {row.list_price}

                </div>

                <div>

                  {ok ? (

                    <span className="bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-base whitespace-nowrap">

                      In Stock

                    </span>

                  ) : (

                    <span className="bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-base whitespace-nowrap">

                      Out of Stock

                    </span>

                  )}

                </div>

              </div>

            );

          })

        )}

      </div>

      <div className="mt-10 text-center text-gray-600 font-medium text-sm sm:text-base px-2">

        💡 Please ask pharmacy staff for unavailable medicines or alternatives.

      </div>

    </div>

  );

}