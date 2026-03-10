// frontend/src/App.jsx

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/applications/Dashboard";
import ApplicationForm from "./components/applications/ApplicationForm";

import Login from "./components/Login";
import Register from "./components/Register";
import ContactList from "./components/contacts/ContactList";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CVEditor from "./components/cv/CVEditor";
import Reminders from "./components/reminders/Reminders";
import JobSearch from "./components/platsbanken/JobSearch";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>

      {isLoggedIn && <Navbar onLogout={handleLogout} />}

      <Routes>

        {/* Auth */}
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />

        <Route
          path="/register"
          element={<Register onLogin={handleLogin} />}
        />

        {/* Dashboard */}
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

        {/* Add application */}
        <Route
          path="/applications/new"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ApplicationForm />
            </ProtectedRoute>
          }
        />

        {/* Contacts */}
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
        <Route
          path="/reminders"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Reminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/platsbanken"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <JobSearch />
            </ProtectedRoute>
          }
        />
        {/* Redirect alla andra routes till login om inte inloggad */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </div>
  );
}
