import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ApplicationForm() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "applied",
    source: "",
    notes: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/applications/", formData);
      navigate("/");
    } catch (error) {
      console.error("Failed to create application:", error);
    }
  };

  return (
    <div className="flex justify-center p-10 bg-[#f4f6f8] min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow flex flex-col gap-4 h-fit"
      >
        <h2 className="text-xl font-bold mt-0">
          Lägg till ansökan
        </h2>

        <input
          name="company"
          placeholder="Företag"
          value={formData.company}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          name="role"
          placeholder="Roll"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="applied">Ansökt</option>
          <option value="interview">Intervju</option>
          <option value="offer">Erbjudande</option>
          <option value="rejected">Avslag</option>
        </select>

        <input
          name="source"
          placeholder="Källa"
          value={formData.source}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <textarea
          name="notes"
          placeholder="Anteckningar"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm min-h-20 font-[inherit]"
        />

        <button
          type="submit"
          className="bg-[#2c7be5] text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
        >
          Lägg till ansökan
        </button>
      </form>
    </div>
  );
}
