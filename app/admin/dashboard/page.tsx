"use client";

import { useEffect, useState } from "react";
import UploadHistory from "@/components/UploadHistory";
import QRCodeCard from "@/components/QRCodeCard";

export default function Dashboard() {

    const [file,setFile]=useState<File|null>(null);

    interface HistoryItem {
        file: string;
        original: string;
        uploadedAt: string;
    }

const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading,setLoading]=useState(false);
    const [active,setActive]=useState("");

    async function loadHistory() {

    const res = await fetch("/api/excel/history", {

        cache: "no-store"

    });

    if (!res.ok) return;

    const json = await res.json();

    setHistory(json.history || []);

    setActive(json.active || "");

}

    useEffect(() => {
        loadHistory();
        }, []);

    async function upload() {
        console.log("UPLOAD START");

        const input = document.querySelector(
            "input[type=file]"
        ) as HTMLInputElement;

        const file = input?.files?.[0];

        console.log("FILE:", file);

        if (!file) {
            alert("Select file first");
            return;
        }

        const form = new FormData();
        form.append("file", file);

        setLoading(true);

        const res = await fetch("/api/excel/upload", {
            method: "POST",
            body: form,
        });

        setLoading(false);

        const data = await res.json();

        console.log("UPLOAD RESPONSE:", data);

        if (!res.ok) {
            alert("Upload failed");
            return;
        }

        alert("Upload success");
        }

    async function restore(name:string){

        const res=await fetch("/api/excel/restore",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                file:name

            })

        });

        if(res.ok){

            alert("Restored successfully.");

            loadHistory();

        }

    }
    async function logout() {

    await fetch("/api/auth/logout",{

        method:"POST"

    });

    location.href="/admin/login";

}

    return(

        <div className="min-h-screen bg-white text-black font-sans">

            <div className="max-w-6xl mx-auto px-8 py-10">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-black pb-6 mb-10">

                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-black/60 mb-1">
                            Internal Tools
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-black">
                            Pharmacy Admin Dashboard
                        </h1>
                    </div>

                    <button
                        onClick={logout}
                        className="border border-black text-black px-5 py-2 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                    >
                        Logout
                    </button>

                </div>

                {/* Active file status — styled like a label stamp */}
                <div className="mb-10 border border-black p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-black/60 mb-1">
                            Current Active Excel
                        </p>
                        <p className="text-lg font-mono">
                            {active || "None"}
                        </p>
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] border border-black px-3 py-1">
                        {active ? "Live" : "Empty"}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-10">

                    <div className="col-span-2 flex flex-col gap-10">

                        {/* Upload card */}
                        <div className="border border-black p-8">

                            <h2 className="text-xl font-semibold tracking-tight mb-1">
                                Upload New Excel
                            </h2>
                            <p className="text-sm text-black/60 mb-6">
                                Replaces the active file used across the system.
                            </p>

                            <input

                                type="file"

                                accept=".xlsx,.xls"

                                onChange={(e)=>{

                                    if(e.target.files){

                                        setFile(e.target.files[0]);

                                    }

                                }}

                                className="block w-full text-sm border border-black/40 p-3 file:mr-4 file:border-0 file:bg-black file:text-white file:px-4 file:py-2 file:uppercase file:text-xs file:tracking-wide"

                            />

                            <button

                                onClick={upload}

                                disabled={loading}

                                className="mt-6 bg-black text-white px-8 py-3 text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-black/80 transition-colors"

                            >

                                {

                                    loading

                                    ?

                                    "Uploading..."

                                    :

                                    "Upload"

                                }

                            </button>

                        </div>

                        {/* History */}
                        <div className="border border-black p-8">

                            <h2 className="text-xl font-semibold tracking-tight mb-6">
                                Upload History
                            </h2>

                            <UploadHistory

                                history={history}

                                onRestore={restore}

                            />

                        </div>

                    </div>

                    <div className="border border-black p-8">
                        <QRCodeCard/>
                    </div>

                </div>

            </div>

        </div>

    );

}
