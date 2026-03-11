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
  ResponsiveContainer
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
  const [selectedApplication, setSelectedApplication] = useState(null);

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

  // ESC close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSelectedApplication(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
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
    applied: "border-l-4 border-blue-500",
    interview: "border-l-4 border-yellow-500",
    offer: "border-l-4 border-green-500",
    rejected: "border-l-4 border-red-500"
  };

  return (

    <div className="p-10 bg-[#f4f6f8] min-h-screen">

      <div className="max-w-7xl mx-auto">

      {/* HEADER */}

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

      {/* STATS */}

      <div className="grid grid-cols-5 gap-6 mb-8">

        <StatCard title="Totalt" value={stats.total} icon={<Briefcase size={26}/>} />
        <StatCard title="Ansökt" value={stats.applied} icon={<Send size={26}/>} />
        <StatCard title="Intervju" value={stats.interview} icon={<Users size={26}/>} />
        <StatCard title="Erbjudande" value={stats.offer} icon={<Briefcase size={26}/>} />
        <StatCard title="Avslag" value={stats.rejected} icon={<XCircle size={26}/>} />

      </div>

      {/* PIPELINE */}

      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow mb-10 border border-gray-100">

        <div className="flex items-center justify-center gap-8 text-center">

          <PipelineStep label="Ansökt" value={stats.applied} color="text-blue-600"/>
          <span className="text-gray-400">→</span>
          <PipelineStep label="Intervju" value={stats.interview} color="text-yellow-600"/>
          <span className="text-gray-400">→</span>
          <PipelineStep label="Erbjudande" value={stats.offer} color="text-green-600"/>

        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">

      {/* CHART */}

      <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">

        <h3 className="mb-4 font-semibold">
          Ansökningsstatus
        </h3>

        <ResponsiveContainer width="100%" height={250}>

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={90}
              innerRadius={50}
              label
            >

              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}

            </Pie>

            <Tooltip/>

          </PieChart>

        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm justify-items-center">

  {chartData.map((item, index) => (

    <div key={index} className="flex items-center gap-2 whitespace-nowrap">

      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: COLORS[index] }}
      />

      <span className="text-gray-600">
        {item.name}
      </span>

      <span className="font-semibold">
        {item.value}
      </span>

    </div>

  ))}

</div>

      </div>

      {/* APPLICATIONS */}

      <div>

        <div className="mb-5">

          <label className="mr-2">Filtrera:</label>

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

          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i}/>)
            : filteredApplications.map(app => (

            <div
              key={app.id}
              onClick={() => setSelectedApplication(app)}
              className={`bg-white p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 cursor-pointer ${statusBorder[app.status]}`}
            >

              <h3 className="font-semibold">{app.company}</h3>

              <p><strong>Roll:</strong> {app.role}</p>

              <p className="text-sm text-gray-500">
                {new Date(app.applied_date).toLocaleDateString()}
              </p>

              <StatusBadge status={app.status}/>
              <StatusProgress status={app.status}/>

            </div>

          ))}

        </div>

      </div>

      </div>

      </div>

      {/* MODAL */}

      {selectedApplication && (

      <div
        onClick={() => setSelectedApplication(null)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      >

        <div
          onClick={(e)=>e.stopPropagation()}
          className="bg-white rounded-xl p-6 w-[400px] shadow-xl animate-modalIn"
        >

          <h2 className="text-xl font-bold mb-4">
            {selectedApplication.company}
          </h2>

          <p><strong>Roll:</strong> {selectedApplication.role}</p>

          <p><strong>Status:</strong> {selectedApplication.status}</p>

          <p className="mb-2">
            <strong>Ansökt:</strong>{" "}
            {new Date(selectedApplication.applied_date).toLocaleDateString()}
          </p>

          {selectedApplication.source && (
            <p><strong>Källa:</strong> {selectedApplication.source}</p>
          )}

          {selectedApplication.notes && (
            <p className="mt-2">
              <strong>Anteckningar:</strong> {selectedApplication.notes}
            </p>
          )}

          <button
            onClick={()=>setSelectedApplication(null)}
            className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Stäng
          </button>

        </div>

      </div>

      )}

    </div>
  );
}


/* COMPONENTS */

function StatCard({ title, value, icon }) {

  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-200">

      <div>
        <p className="text-xs text-gray-400 uppercase">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>

      <div className="bg-gray-100 p-3 rounded-lg">
        {icon}
      </div>

    </div>
  );
}

function PipelineStep({label,value,color}){

  return(
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
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

  const steps = ["applied","interview","offer","rejected"];

  const index = steps.indexOf(status);
  const progress = ((index + 1) / steps.length) * 100;

  return (

    <div className="mt-3">

      <div className="w-full bg-gray-200 rounded-full h-2">

        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{width:`${progress}%`}}
        />

      </div>

    </div>

  );

}

function SkeletonCard(){

  return(
    <div className="bg-white p-5 rounded-xl shadow animate-pulse">

      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"/>

      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"/>

      <div className="h-3 bg-gray-200 rounded w-1/3"/>

    </div>
  )

}