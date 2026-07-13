"use client";

interface Props {
  businesses: number;
  emails: number;
  status: "idle" | "running" | "done" | "error";
  message?: string;
  progress: number; // 0–100
  limit: number;
}

export default function StatsBadge({
  businesses,
  emails,
  status,
  message,
  progress,
  limit,
}: Props) {
  return (
    <div>
      {/* Progress bar */}
      {status === "running" && (
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      <div className="stats-bar">
        {/* Status pill */}
        {status !== "idle" && (
          <div className={`status-pill ${status}`}>
            {status === "running" && <span className="pulse-dot" />}
            {status === "done" && "✓"}
            {status === "error" && "✕"}
            <span>
              {status === "running"
                ? message || "Scraping..."
                : status === "done"
                ? "Completed"
                : "Error"}
            </span>
          </div>
        )}

        {/* Stats chips */}
        <div className="stat-chip">
          <span className="stat-icon">🏢</span>
          <span className="stat-label">Businesses</span>
          <span className="stat-value">{businesses}</span>
          {status === "running" && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              / {limit}
            </span>
          )}
        </div>

        <div className="stat-chip">
          <span className="stat-icon">📧</span>
          <span className="stat-label">Emails</span>
          <span className="stat-value">{emails}</span>
        </div>

        {businesses > 0 && (
          <div className="stat-chip">
            <span className="stat-icon">📈</span>
            <span className="stat-label">Email rate</span>
            <span className="stat-value">
              {Math.round((emails > 0 ? businesses : 0) > 0
                ? (emails / businesses) * 100
                : 0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
