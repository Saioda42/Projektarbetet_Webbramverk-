import { Link, useNavigate } from "react-router-dom";

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // Uppdatera state i App
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#2196F3",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1976D2")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          📊 Dashboard
        </Link>

        <Link
          to="/contacts"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1976D2")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          👥 Kontakter
        </Link>

        <Link
          to="/cv"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1976D2")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          📄 Mitt CV
        </Link>

        <Link
          to="/reminders"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1976D2")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          📧 Påminnelser
        </Link>
      </div>

      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        🚪 Logga ut
      </button>
    </nav>
  );
}

export default Navbar;
