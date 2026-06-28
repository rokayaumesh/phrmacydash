"use client";

import { useEffect } from "react";

export default function VersionChecker() {
  useEffect(() => {
    let currentVersion = "";

    async function checkVersion() {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!currentVersion) {
          currentVersion = data.version;
          return;
        }

        if (currentVersion !== data.version) {
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkVersion();

    const interval = setInterval(checkVersion, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}