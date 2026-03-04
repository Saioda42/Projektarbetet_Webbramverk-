// frontend/src/components/Register.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validera att lösenorden matchar
    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    // Validera lösenordslängd
    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken");
      return;
    }

    setLoading(true);

    try {
      // Skicka register request till backend
      const response = await api.post("/auth/register", {
        email,
        password
      });

      // Spara token (backend ger token direkt vid registrering)
      localStorage.setItem("token", response.data.access_token);
      
      // Uppdatera state
      onLogin();
      
      // Gå till dashboard
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.detail || 
        "Kunde inte skapa konto. Email kanske redan finns."
      );
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
        onSubmit={handleRegister}
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          width: "350px"
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Skapa konto
        </h2>

        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
            textAlign: "center",
            fontSize: "14px"
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
          placeholder="Lösenord (minst 6 tecken)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
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
          placeholder="Bekräfta lösenord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: "6px",
            fontSize: "16px",
            marginBottom: "15px"
          }}
        >
          {loading ? "Skapar konto..." : "Skapa konto"}
        </button>

        <p style={{ 
          textAlign: "center",
          color: "#666",
          fontSize: "14px"
        }}>
          Har du redan ett konto?{" "}
          <Link 
            to="/login" 
            style={{ 
              color: "#3498db", 
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Logga in här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;