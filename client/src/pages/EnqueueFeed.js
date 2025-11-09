import React, { useState } from "react";
import axios from "axios";

function EnqueueFeed() {
  const [feedUrl, setFeedUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:4000/api/import/enqueue", { feedUrl });
      setMessage(`✅ Enqueued successfully: ${res.data.queued || 0} jobs`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to enqueue feed");
    }
  };

  return (
    <div>
      <h2>Enqueue New Feed</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Enter Feed URL"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
          required
        />
        <button type="submit">Enqueue</button>
      </form>
      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}

export default EnqueueFeed;
