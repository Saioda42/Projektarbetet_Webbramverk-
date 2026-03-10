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
        className="bg-white p-10 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] w-[380px]"
      >
        <h2 className="mb-6 text-center">
          Skapa konto
        </h2>

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
          placeholder="Lösenord (minst 6 tecken)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full p-2.5 mb-4 border border-[#ccc] rounded-md text-sm box-border"
        />

        <input
          type="password"
          placeholder="Bekräfta lösenord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-2.5 mb-5 border border-[#ccc] rounded-md text-sm box-border"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2.5 border-none text-white font-bold rounded-lg text-sm transition-transform duration-150 mb-4 ${loading ? "bg-[#ccc] cursor-not-allowed" : "bg-[#2c7be5] cursor-pointer hover:scale-105"}`}
        >
          {loading ? "Skapar konto..." : "Skapa konto"}
        </button>

        <p className="text-center text-[#777] text-sm m-0">
          Har du redan ett konto?{" "}
          <Link
            to="/login"
            className="text-[#2c7be5] no-underline font-bold"
          >
            Logga in här
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
