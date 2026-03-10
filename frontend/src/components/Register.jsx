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

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        email,
        password
      });

      localStorage.setItem("token", response.data.access_token);
      onLogin();
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.detail ||
        "Kunde inte skapa konto. E-postadressen kanske redan finns."
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
        background: "#f4f6f8",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
          width: "380px",
        }}
      >
        <h2 style={{ marginBottom: "25px", textAlign: "center" }}>
          Skapa konto
        </h2>

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
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Lösenord (minst 6 tecken)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Bekräfta lösenord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ ...inputStyle, marginBottom: "20px" }}
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
            marginBottom: "15px",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {loading ? "Skapar konto..." : "Skapa konto"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Har du redan ett konto?{" "}
          <Link
            to="/login"
            style={{
              color: "#2c7be5",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Logga in här
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

export default Register;
