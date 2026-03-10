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
    <div className="min-h-screen flex justify-center items-center bg-[#f4f6f8]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] w-[380px]"
      >
        <h2 className="mb-6 text-center">Logga in</h2>

        {error && (
          <div className="bg-[#ffebee] text-[#e74c3c] p-3 rounded-lg mb-5 text-center text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2.5 mb-4 border border-[#ccc] rounded-md text-sm box-border"
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2.5 mb-5 border border-[#ccc] rounded-md text-sm box-border"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2.5 border-none text-white font-bold rounded-lg text-sm transition-transform duration-150 ${loading ? "bg-[#ccc] cursor-not-allowed" : "bg-[#2c7be5] cursor-pointer hover:scale-105"}`}
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        <p className="mt-5 text-center text-[#777] text-sm">
          Inget konto än?{" "}
          <Link
            to="/register"
            className="text-[#2c7be5] no-underline font-bold"
          >
            Skapa konto här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
