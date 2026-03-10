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
    <div className="min-h-screen flex justify-center items-center bg-[#f4f6f8]">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-xl shadow w-96"
      >
        <h2 className="text-xl font-bold mb-6 text-center">
          Skapa konto
        </h2>

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
          placeholder="Lösenord (minst 6 tecken)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border rounded px-3 py-2 mb-4 text-sm"
        />

        <input
          type="password"
          placeholder="Bekräfta lösenord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-5 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 text-white font-bold rounded-lg text-sm hover:scale-105 transition-transform mb-4 ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 cursor-pointer"}`}
        >
          {loading ? "Skapar konto..." : "Skapa konto"}
        </button>

        <p className="text-center text-gray-500 text-sm m-0">
          Har du redan ett konto?{" "}
          <Link
            to="/login"
            className="text-blue-600 no-underline font-bold"
          >
            Logga in här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
