import {
  getApplications,
  deleteApplication,
  getApplicationStats
} from "../../services/applicationsApi";

import api from "../../services/api";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

function Dashboard() {

  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    rejected: 0
  });

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    try {

      const apps = await getApplications();
      setApplications(apps);

      const statsData = await getApplicationStats();
      setStats(statsData);

    } catch (error) {

      console.error("Error loading dashboard:", error);

    } finally {

      setLoading(false);

    }

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Ta bort denna ansökan?")) return;

    try {

      await deleteApplication(id);

      setApplications(prev =>
        prev.filter(app => app.id !== id)
      );

      loadData();

    } catch (error) {

      console.error("Delete failed:", error);

    }

  };

  const handleStatusChange = async (id, newStatus) => {

    try {

      await api.put(`/applications/${id}`, {
        status: newStatus
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === id
            ? { ...app, status: newStatus }
            : app
        )
      );

      loadData();

    } catch (error) {

      console.error("Status update failed:", error);

    }

  };

  const filteredApplications = applications.filter(
    app =>
      filter === "all" ||
      app.status?.toLowerCase() === filter
  );

  const chartData = [
    { name: "Ansökt", value: stats.applied },
    { name: "Intervju", value: stats.interview },
    { name: "Avslag", value: stats.rejected }
  ];

  const COLORS = ["#3498db", "#f39c12", "#e74c3c"];

  return (

    <div
      style={{
        padding: "40px",
        background: "#f4f6f8",
        minHeight: "100vh"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px"
        }}
      >

        <h2 style={{ margin: 0 }}>Översikt</h2>

        <button
          onClick={() => navigate("/applications/new")}
          style={{
            background: "#2c7be5",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "transform 0.15s"
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          + Lägg till ansökan
        </button>

      </div>

      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
          marginBottom: "30px"
        }}
      >

        <StatCard title="Totalt" value={stats.total} color="#2c3e50" />
        <StatCard title="Ansökt" value={stats.applied} color="#3498db" />
        <StatCard title="Intervju" value={stats.interview} color="#f39c12" />
        <StatCard title="Avslag" value={stats.rejected} color="#e74c3c" />

      </div>

      {/* MAIN DASHBOARD GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: "30px"
        }}
      >

        {/* CHART */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            height: "fit-content"
          }}
        >

          <h3 style={{ marginBottom: "20px" }}>
            Ansökningsstatus
          </h3>

          <PieChart width={300} height={250}>

            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={90}
              label
            >

              {chartData.map((entry, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index]}
                />

              ))}

            </Pie>

            <Tooltip />
            <Legend />

          </PieChart>

        </div>

        {/* APPLICATION LIST */}

        <div>

          {/* FILTER */}

          <div style={{ marginBottom: "20px" }}>

            <label style={{ marginRight: "10px" }}>
              Filtrera:
            </label>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Alla</option>
              <option value="applied">Ansökt</option>
              <option value="interview">Intervju</option>
              <option value="rejected">Avslag</option>
            </select>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,260px)",
              gap: "20px"
            }}
          >

            {!loading &&
              filteredApplications.map(app => (

                <div
                  key={app.id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-4px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >

                  <h3 style={{ marginTop: 0 }}>
                    {app.company}
                  </h3>

                  <p>
                    <strong>Roll:</strong> {app.role}
                  </p>

                  <p style={{ fontSize: "14px", color: "#666" }}>
                    {new Date(app.applied_date).toLocaleDateString()}
                  </p>

                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app.id, e.target.value)
                    }
                    style={{
                      marginTop: "10px",
                      padding: "6px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  >

                    <option value="applied">Ansökt</option>
                    <option value="interview">Intervju</option>
                    <option value="rejected">Avslag</option>

                  </select>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "10px"
                    }}
                  >

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

              ))}

          </div>

        </div>

      </div>

    </div>

  );

}

function StatCard({ title, value, color }) {

  return (

    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.15s"
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-3px)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "translateY(0)")
      }
    >

      <p style={{ color: "#777", marginBottom: "5px" }}>
        {title}
      </p>

      <h2 style={{ color, margin: 0 }}>
        {value}
      </h2>

    </div>

  );

}

export default Dashboard;