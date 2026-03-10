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
        className="w-105 bg-white p-7.5 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] flex flex-col gap-3.75 h-fit"
      >
        <h2 className="mt-0">
          Lägg till ansökan
        </h2>

        <input
          name="company"
          placeholder="Företag"
          value={formData.company}
          onChange={handleChange}
          required
          className="p-2.5 rounded-md border border-[#ccc] text-sm"
        />

        <input
          name="role"
          placeholder="Roll"
          value={formData.role}
          onChange={handleChange}
          required
          className="p-2.5 rounded-md border border-[#ccc] text-sm"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="p-2.5 rounded-md border border-[#ccc] text-sm"
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
          className="p-2.5 rounded-md border border-[#ccc] text-sm"
        />

        <textarea
          name="notes"
          placeholder="Anteckningar"
          value={formData.notes}
          onChange={handleChange}
          className="p-2.5 rounded-md border border-[#ccc] text-sm min-h-20 font-[inherit]"
        />

        <button
          type="submit"
          className="bg-[#2c7be5] text-white border-none p-2.5 rounded-lg font-bold cursor-pointer text-sm hover:scale-105 transition-transform duration-150"
        >
          Lägg till ansökan
        </button>
      </form>
    </div>
  );
}