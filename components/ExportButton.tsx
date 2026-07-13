"use client";

import { useState } from "react";

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: string;
  reviews: string;
  website: string;
  category: string;
  emails: string[];
}

interface Props {
  data: Business[];
  disabled?: boolean;
}

export default function ExportButton({ data, disabled }: Props) {
  const [loading, setLoading] = useState<"csv" | "excel" | null>(null);

  const handleExport = async (format: "csv" | "excel") => {
    if (!data.length) return;
    setLoading(format);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, format }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maps-emails-${Date.now()}.${format === "excel" ? "xlsx" : "csv"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="export-row">
      <button
        className="btn-secondary"
        onClick={() => handleExport("csv")}
        disabled={disabled || !data.length || loading !== null}
        title="Download as CSV"
      >
        {loading === "csv" ? (
          <span className="spinner" style={{ width: 14, height: 14 }} />
        ) : (
          "📄"
        )}
        CSV
      </button>
      <button
        className="btn-secondary"
        onClick={() => handleExport("excel")}
        disabled={disabled || !data.length || loading !== null}
        title="Download as Excel"
        style={{
          borderColor: loading === "excel" ? "var(--highlight)" : undefined,
        }}
      >
        {loading === "excel" ? (
          <span className="spinner" style={{ width: 14, height: 14 }} />
        ) : (
          "📊"
        )}
        Excel
      </button>
    </div>
  );
}
