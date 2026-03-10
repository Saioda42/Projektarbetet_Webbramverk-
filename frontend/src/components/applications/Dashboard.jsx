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
const statusBorder = {
  applied: "border-l-4 border-blue-500 bg-blue-50/30",
  interview: "border-l-4 border-yellow-500 bg-yellow-50/30",
  offer: "border-l-4 border-green-500 bg-green-50/30",
  rejected: "border-l-4 border-red-500 bg-red-50/30"
};

  return (

    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      <div className="max-w-7xl mx-auto">

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

      <div className="grid grid-cols-5 gap-6 mb-8">

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

      {/* Pipeline */}

      <div className="bg-white p-4 rounded-xl shadow mb-10">

        <div className="flex flex-wrap items-center justify-center gap-6 text-center">

          <div>
            <p className="text-xs text-gray-500">Ansökt</p>
            <p className="text-lg font-bold text-blue-600">
              {stats.applied}
            </p>
          </div>

          <div className="text-gray-400">→</div>

          <div>
            <p className="text-xs text-gray-500">Intervju</p>
            <p className="text-lg font-bold text-yellow-600">
              {stats.interview}
            </p>
          </div>

          <div className="text-gray-400">→</div>

          <div>
            <p className="text-xs text-gray-500">Erbjudande</p>
            <p className="text-lg font-bold text-green-600">
              {stats.offer}
            </p>
          </div>

        </div>

      </div>

      {/* Main grid */}

      <div className="grid grid-cols-[360px_1fr] gap-8">

        {/* Chart */}

        <div className="bg-white p-6 rounded-xl shadow">

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
                  className={`bg-white p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${statusBorder[app.status]}`}
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

                  <div className="mt-2">
                    <StatusBadge status={app.status} />
                  </div>

                  <StatusProgress status={app.status} />

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
  ;</div>

  );

}

/* --- Components --- */

function StatCard({ title, value, icon, color }) {

  return (

    <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between hover:-translate-y-1 transition">

      <div>

        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {title}
        </p>

        <p className="text-3xl font-bold">
          {value}
        </p>

      </div>

      <div className={`${color} bg-gray-100 p-3 rounded-lg`}>
        {icon}
      </div>

    </div>

  );

}

function StatusBadge({ status }) {

  const styles = {
    applied: "bg-blue-100 text-blue-700",
    interview: "bg-yellow-100 text-yellow-700",
    offer: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700"
  };

  const labels = {
    applied: "Ansökt",
    interview: "Intervju",
    offer: "Erbjudande",
    rejected: "Avslag"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );

}

function StatusProgress({ status }) {

  const steps = ["applied", "interview", "offer", "rejected"];

  const currentIndex = steps.indexOf(status);

  const progress = status === "rejected"
  ? 100
  : ((currentIndex + 1) / steps.length) * 100;

  const colors = {
  applied: "bg-gradient-to-r from-blue-400 to-blue-600",
  interview: "bg-gradient-to-r from-yellow-400 to-orange-500",
  offer: "bg-gradient-to-r from-green-400 to-green-600",
  rejected: "bg-gradient-to-r from-red-400 to-red-600"
};

  return (

    <div className="mt-3">

      <div className="w-full bg-gray-200 rounded-full h-2">

        <div
  className={`h-2 rounded-full transition-all duration-300 ${colors[status]}`}
  style={{ width: `${progress}%` }}
/>

      </div>

    </div>

  );

}