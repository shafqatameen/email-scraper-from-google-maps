"use client";

import { useState, useRef } from "react";

interface Props {
  onStart: (input: string, limit: number) => void;
  onStop: () => void;
  isRunning: boolean;
}

export default function SearchForm({ onStart, onStop, isRunning }: Props) {
  const [mode, setMode] = useState<"query" | "url">("query");
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [limit, setLimit] = useState(20);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = mode === "url" ? url.trim() : query.trim();
    if (!input) return;
    onStart(input, limit);
  };

  return (
    <div className="search-card">
      {/* Mode Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${mode === "query" ? "active" : ""}`}
          onClick={() => setMode("query")}
          type="button"
        >
          🔍 Category + City
        </button>
        <button
          className={`tab-btn ${mode === "url" ? "active" : ""}`}
          onClick={() => setMode("url")}
          type="button"
        >
          🔗 Maps URL
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          {mode === "query" ? (
            <div className="form-group" style={{ gridColumn: "1" }}>
              <label htmlFor="query-input">Search Query</label>
              <input
                id="query-input"
                ref={inputRef}
                type="text"
                className="form-input"
                placeholder='e.g. "digital marketing agencies in Mumbai"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isRunning}
                autoComplete="off"
              />
            </div>
          ) : (
            <div className="form-group" style={{ gridColumn: "1" }}>
              <label htmlFor="url-input">Google Maps URL</label>
              <input
                id="url-input"
                ref={inputRef}
                type="url"
                className="form-input"
                placeholder="https://www.google.com/maps/search/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isRunning}
              />
            </div>
          )}

          {/* Limit selector */}
          <div className="form-group">
            <label htmlFor="limit-select">Max Results</label>
            <select
              id="limit-select"
              className="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={isRunning}
            >
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
              <option value={100}>100 results</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="form-group">
            <label style={{ visibility: "hidden" }}>Action</label>
            {isRunning ? (
              <button
                type="button"
                className="btn-primary"
                onClick={onStop}
                style={{ background: "linear-gradient(135deg, #f87171, #dc4545)" }}
              >
                <span className="spinner" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={mode === "query" ? !query.trim() : !url.trim()}
              >
                <span>🚀</span>
                Scrape
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
