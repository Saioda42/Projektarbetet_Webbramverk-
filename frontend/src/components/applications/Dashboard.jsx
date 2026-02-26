import { useEffect, useState } from "react";

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/applications")
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "#3498db";
      case "interview":
        return "#f39c12";
      case "rejected":
        return "#e74c3c";
      default:
        return "#555";
    }
  };

  const filteredApplications = applications.filter(
    app => filter === "all" || app.status.toLowerCase() === filter
  );

  return (
    <div style={{ padding: "30px", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>

      {/* Statistik Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <StatCard title="Total" value={total} color="#2c3e50" />
        <StatCard title="Applied" value={applied} color="#3498db" />
        <StatCard title="Interview" value={interview} color="#f39c12" />
        <StatCard title="Rejected" value={rejected} color="#e74c3c" />
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>
          Filter by status:
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "5px 10px" }}
        >
          <option value="all">All</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Loading */}
      {loading && <p>Loading applications...</p>}

      {/* Empty state */}
      {!loading && filteredApplications.length === 0 && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
          }}
        >
          <p>No applications found.</p>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {!loading &&
          filteredApplications.map(app => (
            <div
              key={app.id}
              style={{
                borderRadius: "12px",
                padding: "20px",
                width: "260px",
                backgroundColor: "white",
                boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>{app.company}</h3>

              <p style={{ margin: "6px 0" }}>
                <strong>Role:</strong> {app.role}
              </p>

              <p
                style={{
                  marginTop: "10px",
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

/* Mini statistik-card komponent */
function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
        textAlign: "center"
      }}
    >
      <p style={{ margin: 0, color: "#777" }}>{title}</p>
      <h2 style={{ margin: "10px 0", color }}>{value}</h2>
    </div>
  );
}

export default Dashboard;