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

import {
  Briefcase,
  Send,
  Users,
  XCircle
} from "lucide-react";

export default function Dashboard() {

  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });

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

      console.error("Kunde inte ladda data:", error);

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
    { name: "Erbjudande", value: stats.offer },
    { name: "Avslag", value: stats.rejected }
  ];

  const COLORS = [
    "#3b82f6",
    "#f59e0b",
    "#10b981",
    "#ef4444"
  ];

  return (

    <div className="p-10 bg-[#f4f6f8] min-h-screen">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-xl font-bold">
          Översikt
        </h2>

        <button
          onClick={() => navigate("/applications/new")}
          className="bg-[#2c7be5] text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          + Lägg till ansökan
        </button>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <StatCard
          title="Totalt"
          value={stats.total}
          icon={<Briefcase size={26} />}
          color="text-gray-700"
        />

        <StatCard
          title="Ansökt"
          value={stats.applied}
          icon={<Send size={26} />}
          color="text-blue-600"
        />

        <StatCard
          title="Intervju"
          value={stats.interview}
          icon={<Users size={26} />}
          color="text-yellow-600"
        />

        <StatCard
          title="Erbjudande"
          value={stats.offer}
          icon={<Briefcase size={26} />}
          color="text-green-600"
        />

        <StatCard
          title="Avslag"
          value={stats.rejected}
          icon={<XCircle size={26} />}
          color="text-red-600"
        />

      </div>

      {/* Main grid */}

      <div className="grid grid-cols-[360px_1fr] gap-8">

        {/* Chart */}

        <div className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)]">

          <h3 className="mb-4 font-semibold">
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

        {/* Applications */}

        <div>

          {/* Filter */}

          <div className="mb-5">

            <label className="mr-2">
              Filtrera:
            </label>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">Alla</option>
              <option value="applied">Ansökt</option>
              <option value="interview">Intervju</option>
              <option value="offer">Erbjudande</option>
              <option value="rejected">Avslag</option>
            </select>

          </div>

          <div className="grid grid-cols-[repeat(auto-fill,260px)] gap-5">

            {!loading &&
              filteredApplications.map(app => (

                <div
                  key={app.id}
                  className="bg-white p-5 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition"
                >

                  <h3 className="font-semibold">
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
                    className="mt-3 w-full border rounded px-2 py-1"
                  >

                    <option value="applied">Ansökt</option>
                    <option value="interview">Intervju</option>
                    <option value="offer">Erbjudande</option>
                    <option value="rejected">Avslag</option>

                  </select>

                  <div className="flex justify-end mt-3">

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-500 hover:text-red-700"
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

function StatCard({ title, value, icon, color }) {

  return (

    <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4 hover:-translate-y-1 transition">

      <div className={color}>
        {icon}
      </div>

      <div>

        <p className="text-sm text-gray-500">
          {title}
        </p>

        <p className="text-xl font-bold">
          {value}
        </p>

      </div>

    </div>

  );

}