import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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

  /* =========================
     Statistik
  ========================= */

  const total = applications.length;

  const applied = applications.filter(
    app => app.status?.toLowerCase() === "applied"
  ).length;

  const interview = applications.filter(
    app => app.status?.toLowerCase() === "interview"
  ).length;

  const rejected = applications.filter(
    app => app.status?.toLowerCase() === "rejected"
  ).length;

  /* =========================
     Status normalisering
  ========================= */

  const normalizeStatus = (status) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
      case "Applied":
        return "#3498db";
      case "Interview":
        return "#f39c12";
      case "Rejected":
        return "#e74c3c";
      default:
        return "#555";
    }
  };

  /* =========================
     Filter
  ========================= */

  const filteredApplications = applications.filter(
    app =>
      filter === "all" ||
      app.status?.toLowerCase() === filter
  );

  /* =========================
     Delete
  ========================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:8000/applications/${id}`, {
        method: "DELETE",
      });

      setApplications(applications.filter(app => app.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  /* =========================
     Render
  ========================= */

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh"
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
      <button
  onClick={() => {
    localStorage.removeItem("token");
    navigate("/login");
  }}
  style={{
    marginBottom: "20px",
    padding: "8px 12px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  Logout
</button>

      {/* Statistik */}
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
          filteredApplications.map(app => {
            const normalizedStatus = normalizeStatus(app.status);

            return (
              <div
  key={app.id}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.12)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.08)";
  }}
  style={{
    borderRadius: "12px",
    padding: "20px",
    width: "260px",
    backgroundColor: "white",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    cursor: "default"
  }}
>
                <h3 style={{ marginBottom: "10px" }}>{app.company}</h3>

                <p style={{ margin: "6px 0" }}>
                  <strong>Role:</strong> {app.role}
                </p>

                <p style={{ margin: "6px 0", color: "#666", fontSize: "14px" }}>
                  <strong>Applied:</strong>{" "}
                  {new Date(app.applied_date).toLocaleDateString()}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginTop: "15px"
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      backgroundColor: getStatusColor(app.status),
                      color: "white"
                    }}
                  >
                    {normalizedStatus}
                  </span>

                  <button
  onClick={() => handleDelete(app.id)}
  style={{
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "22px",
    color: "#e74c3c",
    padding: 0
  }}
>
  🗑
</button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* Statistik-card */
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