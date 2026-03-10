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
        className="bg-white p-10 rounded-xl shadow w-96"
      >
        <h2 className="text-xl font-bold mb-6 text-center">Logga in</h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-5 text-center text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-4 text-sm"
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-5 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 text-white font-bold rounded-lg text-sm hover:scale-105 transition-transform ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 cursor-pointer"}`}
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        <p className="mt-5 text-center text-gray-500 text-sm">
          Inget konto än?{" "}
          <Link
            to="/register"
            className="text-blue-600 no-underline font-bold"
          >
            Skapa konto här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
