import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login({ onLogin }) {  // Lägg till onLogin prop här
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
      // Skicka login request till backend
      const params = new URLSearchParams();

params.append("username", email);
params.append("password", password);

const response = await api.post("/auth/login", params);

console.log("LOGIN RESPONSE:", response.data);

localStorage.setItem("token", response.data.access_token);
      
      // Uppdatera state
      onLogin();
      
      // Gå till dashboard
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Fel email eller lösenord");
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
        backgroundColor: "#f5f7fa"
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          width: "350px"
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Login</h2>

        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "16px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "16px"
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#3498db",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: "6px",
            fontSize: "16px"
          }}
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        <p style={{ 
          marginTop: "20px", 
          textAlign: "center",
          color: "#666",
          fontSize: "14px"
        }}>
          Inget konto än?{" "}
          <Link 
            to="/register" 
            style={{ 
              color: "#3498db", 
              textDecoration: "none",
              fontWeight: "bold"
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