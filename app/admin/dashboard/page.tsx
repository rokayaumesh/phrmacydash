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

        <div className="flex justify-between items-center mb-8">

    <h1 className="text-4xl font-bold">

        Pharmacy Admin Dashboard

    </h1>

    <button
        onClick={logout}
        className="bg-red-600 text-white px-5 py-2 rounded-xl"
    >
        Logout
    </button>
    <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-6">

    <b>Current Active Excel</b>

    <br/>

    {active || "None"}

</div>

                <div className="grid grid-cols-3 gap-8">

                    <div className="col-span-2">

                        <div className="bg-white rounded-xl shadow p-8">

                            <h2 className="text-2xl font-bold mb-6">

                                Upload New Excel

                            </h2>

                            <input

                                type="file"

                                accept=".xlsx,.xls"

                                onChange={(e)=>{

                                    if(e.target.files){

                                        setFile(e.target.files[0]);

                                    }

                                }}

                            />

                            <button

                                onClick={upload}

                                disabled={loading}

                                className="mt-6 bg-blue-700 text-white px-8 py-3 rounded-xl"

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

                        <div className="mt-8">

                            <UploadHistory

                                history={history}

                                onRestore={restore}

                            />

                        </div>

                    </div>

                    <QRCodeCard/>

                </div>

            </div>


    );

}