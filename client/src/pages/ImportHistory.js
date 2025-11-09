import React, { useEffect, useState } from "react";
import axios from "axios";

function ImportHistory() {
  const [imports, setImports] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/import/history");
        setImports(res.data);
      } catch (err) {
        console.error("Error fetching import history:", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <h2>Import History</h2>
      {imports.length === 0 ? (
        <p>No imports yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Feed URL</th>
              <th>Status</th>
              <th>Imported Jobs</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((log) => (
              <tr key={log._id}>
                <td>{log.feedUrl}</td>
                <td>{log.status}</td>
                <td>{log.importedCount}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ImportHistory;
