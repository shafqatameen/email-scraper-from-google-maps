"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import ResultsTable from "@/components/ResultsTable";
import ExportButton from "@/components/ExportButton";
import StatsBadge from "@/components/StatsBadge";

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

type Status = "idle" | "running" | "done" | "error";

export default function Home() {
  const [results, setResults] = useState<Business[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [limit, setLimit] = useState(20);
  const abortRef = useRef<AbortController | null>(null);

  const emailCount = results.reduce((acc, b) => acc + (b.emails?.length || 0), 0);
  const progress = limit > 0 ? (results.length / limit) * 100 : 0;

  const handleStart = useCallback(async (input: string, resultLimit: number) => {
    // Reset
    setResults([]);
    setStatus("running");
    setStatusMessage("Connecting to Google Maps...");
    setLimit(resultLimit);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, limit: resultLimit }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to connect to scraper");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);

            if (event.type === "start") {
              setStatusMessage(event.message);
            } else if (event.type === "progress") {
              setStatusMessage(event.message);
            } else if (event.type === "result") {
              setResults((prev) => [...prev, event.data]);
              setStatusMessage(`Found: ${event.data.name}`);
            } else if (event.type === "done") {
              setStatus("done");
              setStatusMessage("");
            } else if (event.type === "error") {
              setStatus("error");
              setStatusMessage(event.message);
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      setStatus((s) => (s === "running" ? "done" : s));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("done");
        setStatusMessage("");
      } else {
        setStatus("error");
        setStatusMessage(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    }
  }, []);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setStatus("done");
    setStatusMessage("");
  }, []);

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">🗺️</div>
              <div className="logo-text">
                <h1>Maps Email Scraper</h1>
                <p>Extract business contacts from Google Maps</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <Link href="/history" className="btn-secondary" style={{ textDecoration: "none" }}>View History</Link>
              <div className="header-badge">Powered by Playwright</div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div className="container">
          {/* Hero */}
          <section className="hero">
            <div className="hero-eyebrow">
              <span>✦</span> Real-time business data extraction
            </div>
            <h2>Find Emails from<br />Google Maps Listings</h2>
            <p>
              Search by business category &amp; city, or paste a Google Maps URL.
              We&apos;ll scrape business details and extract emails from their websites.
            </p>
          </section>

          {/* Search */}
          <SearchForm
            onStart={handleStart}
            onStop={handleStop}
            isRunning={status === "running"}
          />

          {/* Results */}
          <section className="results-section">
            <div className="results-header">
              <h3>
                {results.length > 0
                  ? `${results.length} businesses found`
                  : "Results"}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {results.length > 0 && (
                  <button
                    className="btn-secondary"
                    onClick={() => setResults([])}
                    disabled={status === "running"}
                    style={{ fontSize: "0.8rem" }}
                  >
                    🗑 Clear
                  </button>
                )}
                <ExportButton
                  data={results}
                  disabled={status === "running" || results.length === 0}
                />
              </div>
            </div>

            {/* Stats */}
            {status !== "idle" && (
              <StatsBadge
                businesses={results.length}
                emails={emailCount}
                status={status}
                message={statusMessage}
                progress={progress}
                limit={limit}
              />
            )}

            {/* Table */}
            <ResultsTable results={results} isRunning={status === "running"} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            Maps Email Scraper — For educational &amp; personal use only. Respect
            websites&apos; robots.txt and terms of service.
          </p>
        </div>
      </footer>
    </div>
  );
}
