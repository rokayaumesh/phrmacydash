"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [username,setUsername]=useState("");

  const [password,setPassword]=useState("");

  async function login() {
  console.log("Logging in...");

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  console.log("Status:", res.status);

  const json = await res.json();

  console.log("Response:", json);

  if (json.success) {
  setTimeout(() => {
     window.location.replace("/admin/dashboard");
  }, 50);
}

//   console.log("Redirecting...");

//   window.location.href = "/admin/dashboard";
}

  return(

    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white rounded-xl shadow-xl w-[420px] p-8">

        <h1 className="text-black text-3xl font-bold mb-8 text-center">

          Admin Login

        </h1>

        <input

          className="text-black border w-full mb-4 p-3 rounded"

          placeholder="Username"

          value={username}

          onChange={(e)=>setUsername(e.target.value)}

        />

        <input

          type="password"

          className="text-black border w-full mb-6 p-3 rounded"

          placeholder="Password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />

        <button

          onClick={login}

          className="bg-blue-700 text-white rounded w-full py-3"

        >

          Login

        </button>

      </div>

    </div>

  );

}