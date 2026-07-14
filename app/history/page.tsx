"use client";

import { useEffect, useState } from "react";
import ResultsTable from "@/components/ResultsTable";
import ExportButton from "@/components/ExportButton";
import Link from "next/link";

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

interface HistorySession {
  id: string;
  query: string;
  date: string;
  totalResults: number;
  data: Business[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear all history?")) return;
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
        setSelectedSession(null);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the session
    if (!confirm("Delete this session?")) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((s) => s.id !== id));
        if (selectedSession?.id === id) {
          setSelectedSession(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 0", textAlign: "center" }}>
        Loading history...
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">🗺️</div>
              <div className="logo-text">
                <h1>History</h1>
                <p>Your past scraping sessions</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/" className="btn-secondary">Back to Search</Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "2rem 0" }}>
        <div className="container">
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
              <p>No history found. Try scraping something first!</p>
              <br/>
              <Link href="/" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                Start Scraping
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <section className="history-list" style={{ flex: "1 1 300px", maxWidth: "400px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2>Past Sessions</h2>
                  <button onClick={clearHistory} className="btn-secondary" style={{ fontSize: "0.8rem", color: "red", borderColor: "red" }}>
                    Clear All
                  </button>
                </div>
                
                <div style={{ display: "grid", gap: "1rem" }}>
                  {history.map((session) => (
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedSession(session)}
                      style={{ 
                        padding: "1rem", 
                        border: `1px solid ${selectedSession?.id === session.id ? "#3b82f6" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: selectedSession?.id === session.id ? "#eff6ff" : "white"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: "4px", color: "#111827" }}>{session.query}</div>
                        <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                          {new Date(session.date).toLocaleString()} • {session.totalResults} results
                        </div>
                      </div>
                      <button 
                        onClick={(e) => deleteSession(session.id, e)}
                        style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "8px" }}
                        title="Delete session"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {selectedSession && (
                <section className="results-section" style={{ flex: "999 1 600px", minWidth: 0 }}>
                  <div className="results-header" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Results for "{selectedSession.query}"</h3>
                    <ExportButton data={selectedSession.data} />
                  </div>
                  <ResultsTable results={selectedSession.data} isRunning={false} />
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
