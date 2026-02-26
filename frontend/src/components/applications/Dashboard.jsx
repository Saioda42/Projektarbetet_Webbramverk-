import { useEffect, useState } from "react";

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:8000/applications")
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(err => console.error(err));
  }, []);

  // Statistik
  const total = applications.length;
  const applied = applications.filter(
    app => app.status.toLowerCase() === "applied"
  ).length;
  const interview = applications.filter(
    app => app.status.toLowerCase() === "interview"
  ).length;
  const rejected = applications.filter(
    app => app.status.toLowerCase() === "rejected"
  ).length;

  // Färg beroende på status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "#3498db"; // blå
      case "interview":
        return "#f39c12"; // orange
      case "rejected":
        return "#e74c3c"; // röd
      default:
        return "#555";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {/* Statistik */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          fontWeight: "bold"
        }}
      >
        <div>Total: {total}</div>
        <div style={{ color: "#3498db" }}>Applied: {applied}</div>
        <div style={{ color: "#f39c12" }}>Interview: {interview}</div>
        <div style={{ color: "#e74c3c" }}>Rejected: {rejected}</div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Filter by status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        {applications
          .filter(
            app =>
              filter === "all" ||
              app.status.toLowerCase() === filter
          )
          .map(app => (
            <div
              key={app.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                width: "250px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                backgroundColor: "white"
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>
                {app.company}
              </h3>

              <p style={{ margin: "5px 0" }}>
                <strong>Role:</strong> {app.role}
              </p>

              <p
                style={{
                  margin: "5px 0",
                  fontWeight: "bold",
                  color: getStatusColor(app.status)
                }}
              >
                {app.status.charAt(0).toUpperCase() +
                  app.status.slice(1)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Dashboard;