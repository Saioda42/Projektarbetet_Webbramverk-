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
    <div style={{ padding: "30px" }}>
      <h2>Add Application</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <input
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          required
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          name="source"
          placeholder="Source"
          value={formData.source}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />

        <button type="submit">
          Add Application
        </button>

      </form>
    </div>
  );
}