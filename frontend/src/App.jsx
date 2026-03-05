// frontend/src/App.jsx

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/applications/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import ContactList from "./components/contacts/ContactList";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CVEditor from "./components/cv/CVEditor";
import Reminders from "./components/reminders/Reminders";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Kolla om användaren är inloggad när appen startar
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Funktion för att logga ut
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // Funktion för att logga in
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {/* Visa bara Navbar om inloggad */}
      {isLoggedIn && <Navbar onLogout={handleLogout} />}

      <Routes>
        {/* Login & Register routes - alltid tillgängliga */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        {/* Skyddade routes - kräver inloggning */}
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ContactList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cv"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CVEditor />
            </ProtectedRoute>
          }
        />
        // I Routes:
        <Route
          path="/reminders"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Reminders />
            </ProtectedRoute>
          }
        />
        {/* Redirect alla andra routes till login om inte inloggad */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
