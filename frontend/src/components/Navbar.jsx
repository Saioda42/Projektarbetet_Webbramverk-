import { Link } from "react-router-dom";

function Navbar({ onLogout }) {

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    opacity: 0.9,
    transition: "opacity 0.2s"
  };

  const handleHover = (e) => {
    e.target.style.opacity = 1;
  };

  const handleLeave = (e) => {
    e.target.style.opacity = 0.9;
  };

  return (

    <nav
      style={{
        background: "#2c3e50",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}
    >

      <h1
        style={{
          margin: 0,
          fontSize: "22px",
          fontWeight: "700"
        }}
      >
        JobTracker
      </h1>

      <div
        style={{
          display: "flex",
          gap: "28px",
          alignItems: "center"
        }}
      >

        <Link
          to="/"
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Översikt
        </Link>

        <Link
          to="/contacts"
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Kontakter
        </Link>

        <Link
          to="/cv"
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Mitt CV
        </Link>

        <Link
          to="/reminders"
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Påminnelser
        </Link>

        <button
          onClick={onLogout}
          style={{
            background: "#e74c3c",
            border: "none",
            color: "white",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "transform 0.15s"
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          Logga ut
        </button>

      </div>

    </nav>

  );

}

export default Navbar;