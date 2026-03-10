import {
  getApplications,
  deleteApplication,
  getApplicationStats
} from "../../services/applicationsApi";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
  total: 0,
  applied: 0,
  interview: 0,
  rejected: 0
});
  
  useEffect(() => {
  const fetchData = async () => {
    try {

      const apps = await getApplications();
      setApplications(apps);

      const statsData = await getApplicationStats();
      setStats(statsData);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

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

  const filteredApplications = applications.filter(
    app =>
      filter === "all" ||
      app.status?.toLowerCase() === filter
  );

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this application?"
    );

    if (!confirmDelete) return;

    try {

      await deleteApplication(id);

      setApplications(prev =>
        prev.filter(app => app.id !== id)
      );

    } catch (error) {

      console.error("Delete failed:", error);

    }
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#f4f6f8",
        minHeight: "100vh"
      }}
    >

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >
        <h2>Dashboard</h2>

        <button
          onClick={() => navigate("/applications/new")}
          style={{
            background: "#2c7be5",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          + Add Application
        </button>

      </div>

      {/* Statistik */}
      {/* Statistik */}
<div
  style={{
    display: "flex",
    gap: "20px",
    marginBottom: "30px"
  }}
>

  <StatCard title="Total" value={stats.total} color="#2c3e50" />
  <StatCard title="Applied" value={stats.applied} color="#3498db" />
  <StatCard title="Interview" value={stats.interview} color="#f39c12" />
  <StatCard title="Rejected" value={stats.rejected} color="#e74c3c" />

</div>

      {/* Filter */}

      <div style={{ marginBottom: "25px" }}>

        <label style={{ marginRight: "10px" }}>
          Filter by status:
        </label>

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

      {loading && <p>Loading...</p>}

      {!loading && filteredApplications.length === 0 && (
        <div
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "10px",
            textAlign: "center"
          }}
        >
          No applications found.
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >

        {!loading &&
          filteredApplications.map(app => {

            const normalizedStatus = normalizeStatus(app.status);

            return (

              <div
                key={app.id}
                style={{
                  width: "260px",
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                }}
              >

                <h3>{app.company}</h3>

                <p>
                  <strong>Role:</strong> {app.role}
                </p>

                <p style={{ fontSize: "14px", color: "#666" }}>
                  {new Date(app.applied_date).toLocaleDateString()}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    alignItems: "center"
                  }}
                >

                  <span
                    style={{
                      background: getStatusColor(app.status),
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "20px",
                      fontSize: "12px"
                    }}
                  >
                    {normalizedStatus}
                  </span>

                  <button
                    onClick={() => handleDelete(app.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#e74c3c"
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

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        background: "white",
        borderRadius: "12px",
        textAlign: "center"
      }}
    >
      <p style={{ color: "#777" }}>{title}</p>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );
}

export default Dashboard;