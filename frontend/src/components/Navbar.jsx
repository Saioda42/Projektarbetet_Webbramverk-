import { Link } from "react-router-dom";

function Navbar({ onLogout }) {

  return (

    <nav
      className="bg-[#2c3e50] px-10 py-[18px] flex justify-between items-center text-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
    >

      <h1
        className="m-0 text-[22px] font-bold"
      >
        JobTracker
      </h1>

      <div
        className="flex gap-7 items-center"
      >

        <Link
          to="/"
          className="text-white no-underline text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Översikt
        </Link>

        <Link
          to="/contacts"
          className="text-white no-underline text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Kontakter
        </Link>

        <Link
          to="/cv"
          className="text-white no-underline text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Mitt CV
        </Link>

        <Link
          to="/reminders"
          className="text-white no-underline text-base font-medium opacity-90 hover:opacity-100 transition-opacity duration-200"
        >
          Påminnelser
        </Link>

        <button
          onClick={onLogout}
          className="bg-[#e74c3c] border-none text-white px-3.5 py-2 rounded-md cursor-pointer font-semibold transition-transform duration-150 hover:scale-105"
        >
          Logga ut
        </button>

      </div>

    </nav>

  );

}

export default Navbar;
