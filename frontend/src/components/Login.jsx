import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", response.data.access_token);
      onLogin();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Fel e-post eller lösenord");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
          width: "380px",
        }}
      >
        <h2 style={{ marginBottom: "25px", textAlign: "center" }}>Logga in</h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#e74c3c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#ccc" : "#2c7be5",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: "8px",
            fontSize: "14px",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#777",
            fontSize: "14px",
          }}
        >
          Inget konto än?{" "}
          <Link
            to="/register"
            style={{
              color: "#2c7be5",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Skapa konto här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
