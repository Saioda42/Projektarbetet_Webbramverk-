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

    <div className="p-10 bg-[#f4f6f8] min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between mb-[30px]">

        <h2 className="m-0">Översikt</h2>

        <button
          onClick={() => navigate("/applications/new")}
          className="bg-[#2c7be5] text-white border-none px-[18px] py-2.5 rounded-lg cursor-pointer font-bold transition-transform duration-150 hover:scale-105"
        >
          + Lägg till ansökan
        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-5 mb-[30px]">

        <StatCard title="Totalt" value={stats.total} color="#2c3e50" />
        <StatCard title="Ansökt" value={stats.applied} color="#3498db" />
        <StatCard title="Intervju" value={stats.interview} color="#f39c12" />
        <StatCard title="Avslag" value={stats.rejected} color="#e74c3c" />

      </div>

      {/* MAIN DASHBOARD GRID */}

      <div className="grid grid-cols-[360px_1fr] gap-[30px]">

        {/* CHART */}

        <div className="bg-white p-[25px] rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] h-fit">

          <h3 className="mb-5">
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

          <div className="mb-5">

            <label className="mr-2.5">
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

          <div className="grid grid-cols-[repeat(auto-fill,260px)] gap-5">

            {!loading &&
              filteredApplications.map(app => (

                <div
                  key={app.id}
                  className="bg-white p-5 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-1"
                >

                  <h3 className="mt-0">
                    {app.company}
                  </h3>

                  <p>
                    <strong>Roll:</strong> {app.role}
                  </p>

                  <p className="text-sm text-[#666]">
                    {new Date(app.applied_date).toLocaleDateString()}
                  </p>

                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app.id, e.target.value)
                    }
                    className="mt-2.5 p-1.5 rounded-md border border-[#ccc]"
                  >

                    <option value="applied">Ansökt</option>
                    <option value="interview">Intervju</option>
                    <option value="rejected">Avslag</option>

                  </select>

                  <div className="flex justify-end mt-2.5">

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="bg-none border-none cursor-pointer text-lg text-[#e74c3c]"
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

    <div className="bg-white p-5 rounded-xl text-center shadow-[0_3px_8px_rgba(0,0,0,0.04)] transition-transform duration-150 hover:-translate-y-[3px]">

      <p className="text-[#777] mb-[5px]">
        {title}
      </p>

      <h2 className="m-0" style={{ color }}>
        {value}
      </h2>

    </div>

  );

}

export default Dashboard;
