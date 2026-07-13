"use client";

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
  results: Business[];
  isRunning: boolean;
}

export default function ResultsTable({ results, isRunning }: Props) {
  if (results.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p>
            {isRunning
              ? "Scraping in progress... results will appear here"
              : "Enter a search query above and hit Scrape to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Business Name</th>
            <th>Emails</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Address</th>
            <th>Rating</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {results.map((biz, i) => (
            <tr key={biz.id} className="row-entering">
              <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {i + 1}
              </td>
              <td className="cell-name" title={biz.name}>
                {biz.name || "—"}
              </td>
              <td>
                {biz.emails && biz.emails.length > 0 ? (
                  <div className="cell-email">
                    {biz.emails.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="email-badge"
                        title={email}
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                ) : (
                  <span className="cell-no-email">
                    {isRunning && !biz.emails?.length ? (
                      <span className="spinner" style={{ width: 12, height: 12 }} />
                    ) : (
                      "No email found"
                    )}
                  </span>
                )}
              </td>
              <td className="cell-phone" title={biz.phone}>
                {biz.phone || "—"}
              </td>
              <td className="cell-website">
                {biz.website ? (
                  <a href={biz.website} target="_blank" rel="noopener noreferrer" title={biz.website}>
                    {new URL(biz.website).hostname.replace("www.", "")}
                  </a>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </td>
              <td className="cell-address" title={biz.address}>
                {biz.address || "—"}
              </td>
              <td>
                {biz.rating ? (
                  <span className="cell-rating">
                    <span className="rating-star">⭐</span>
                    {biz.rating}
                    {biz.reviews && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 400 }}>
                        ({biz.reviews})
                      </span>
                    )}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </td>
              <td>
                {biz.category ? (
                  <span
                    style={{
                      background: "rgba(58, 80, 107, 0.3)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {biz.category}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
