import { Link } from "react-router-dom";

function Navbar({ onLogout }) {

  return (

    <nav className="bg-[#2c3e50] px-10 py-4 flex justify-between items-center text-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]">

      {/* Logo */}
      <Link
        to="/"
        className="text-lg font-bold text-white hover:text-gray-200 transition"
      >
        JobTracker
      </Link>

      {/* Navigation */}
      <div className="flex gap-7 items-center">

        <Link
          to="/"
          className="text-white text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Översikt
        </Link>

        <Link
          to="/contacts"
          className="text-white text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Kontakter
        </Link>

        <Link
          to="/cv"
          className="text-white text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Mitt CV
        </Link>

        <Link
          to="/reminders"
          className="text-white text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Påminnelser
        </Link>

        <Link
          to="/platsbanken"
          className="text-white text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Platsbanken
        </Link>

        <Link
          to="/settings"
          className="text-white text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Konto
        </Link>

        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:scale-105 transition-transform duration-150"
        >
          Logga ut
        </button>

      </div>

    </nav>

  );

}

export default Navbar;