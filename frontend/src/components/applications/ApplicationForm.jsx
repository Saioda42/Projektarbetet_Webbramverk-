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

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        background: "#f4f6f8",
        minHeight: "100vh"
      }}
    >

      <form
        onSubmit={handleSubmit}
        style={{
          width: "420px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 5px 12px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}
      >

        <h2 style={{ marginTop: 0 }}>
          Add Application
        </h2>

        <input
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <select name="status" value={formData.status} onChange={handleChange}>
  <option value="applied">Ansökt</option>
  <option value="interview">Intervju</option>
  <option value="offer">Erbjudande</option>
  <option value="rejected">Avslag</option>
</select>

        <input
          name="source"
          placeholder="Source"
          value={formData.source}
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          style={{
            ...inputStyle,
            minHeight: "80px"
          }}
        />

        <button
          type="submit"
          style={{
            background: "#2c7be5",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Add Application
        </button>

      </form>

    </div>

  );

}

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "15px"
};