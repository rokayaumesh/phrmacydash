"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function QRCodeCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white p-4 rounded-xl">
      <h2>QR Code</h2>

      <QRCode value="your url" size={180} />
    </div>
  );
}