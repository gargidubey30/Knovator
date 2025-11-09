import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [feedUrl, setFeedUrl] = useState("");
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch import history
  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/admin/imports");
      setImports(res.data);
    } catch (err) {
      console.error("Error fetching imports:", err);
    }
  };

  // Handle enqueue
  const handleEnqueue = async () => {
    if (!feedUrl) return alert("Please enter a feed URL!");
    setLoading(true);
    try {
      await axios.post("http://localhost:4000/api/import/enqueue", { feedUrl });
      alert("✅ Feed enqueued successfully!");
      setFeedUrl("");
      fetchImports();
    } catch (err) {
      alert("❌ Failed to enqueue feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow">
        <h1 className="text-center text-2xl font-bold tracking-wide">
          🚀 Knovator Job Importer
        </h1>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Enqueue Feed Section */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Enqueue Feed
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter feed URL (e.g. https://jobicy.com/?feed=job_feed)"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleEnqueue}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Enqueue"}
            </button>
          </div>
        </div>

        {/* Import History Section */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Import History
          </h2>

          {imports.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No imports yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 border">Feed URL</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Imported Jobs</th>
                    <th className="px-4 py-2 border">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {imports.map((log, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-2 border text-blue-600 break-all">
                        {log.fileName}
                      </td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            log.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status || "success"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {log.totalImported ?? 0}
                      </td>
                      <td className="px-4 py-2 border text-gray-600 text-center">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} Knovator | Job Importer System
      </footer>
    </div>
  );
}

export default App;
