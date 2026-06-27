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

      const medicines: Medicine[] = rows.map((r: any[]) => ({
        generic_name: r?.[1] ?? "",
        list_price: Number(r?.[2] ?? 0),
        total_free_qty: Number(r?.[3] ?? 0),
        availability: r?.[4] ?? "",
      }));

      medicines.sort(() => Math.random() - 0.5);

      setData(medicines);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    loadExcel();

    const refresh = setInterval(loadExcel,5000);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const rotate = setInterval(() => {
      setIndex((i) => (i + 1) % data.length);
    }, 2000);

    return () => clearInterval(rotate);
  }, [data]);

  function available(value: string) {
    const v = value.toLowerCase();

    return (
      v.includes("yes") ||
      v.includes("available")
    );
  }

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

    if (result.length === 5) break;
  }

  return result;
}, [data, index, search]);
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">

      <div className="flex justify-between items-start gap-6">

        <div className="flex-1">

          <div className="flex items-center gap-4 bg-white rounded-2xl border p-5 shadow">

            <Image
              src="/logogp.png"
              alt="logo"
              width={80}
              height={80}
              priority
            />

            <div className="flex-1 text-center">

              <h1 className="text-4xl font-bold text-blue-900">

                जी.पी. कोइराला राष्ट्रिय श्वासप्रश्वास उपचार केन्द्र

              </h1>

              <p className="text-gray-600 mt-2">

                दुलेगौँडा, तनहुँ | फोन: ०६५–५७१४५५ | Website:
                gprespiratory.org

              </p>

              <div className="mt-4">

                <span className="bg-blue-100 text-blue-900 px-6 py-2 rounded-full font-semibold">

                  फार्मेसीमा उपलब्ध औषधिहरू

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

      <div className="mt-2 text-right text-sm text-gray-500">

        Last Updated : {lastUpdate}

      </div>
            <div className="grid grid-cols-4 gap-4 bg-blue-900 text-white rounded-xl mt-6 px-6 py-4 font-bold sticky top-0 z-20">

        <div>Medicine</div>

        <div>Quantity</div>

        <div>Price</div>

        <div>Status</div>

      </div>

      <div className="space-y-4 mt-4">

        {visible.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

            No medicines found.

          </div>

        ) : (

          visible.map((row, i) => {

            const ok = available(row.availability);

            return (

              <div
                key={i}
                className={`grid grid-cols-4 gap-4 items-center rounded-2xl shadow border px-6 py-5 transition-all duration-300
                ${
                  ok
                    ? "bg-white border-gray-200"
                    : "bg-red-50 border-red-300"
                }`}
              >

                <div className="text-black text-lg font-semibold">

                  {row.generic_name}

                </div>

                <div className="text-black text-lg">

                  {row.total_free_qty}

                </div>

                <div className="text-black text-lg">

                  Rs {row.list_price}

                </div>

                <div>

                  {ok ? (

                    <span className="bg-green-600 text-white px-4 py-2 rounded-full">

                      In Stock

                    </span>

                  ) : (

                    <span className="bg-red-600 text-white px-4 py-2 rounded-full">

                      Out of Stock

                    </span>

                  )}

                </div>

              </div>

            );

          })

        )}

      </div>

      <div className="mt-10 text-center text-gray-600 font-medium">

        💡 Please ask pharmacy staff for unavailable medicines or alternatives.

      </div>

    </div>

  );

}