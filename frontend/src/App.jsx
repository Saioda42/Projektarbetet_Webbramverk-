import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/applications/Dashboard";
import Login from "./components/Login";

export default function App() {
  return (
    <div>
      <h1 style={{ padding: "20px" }}>
        Job Application Tracker
      </h1>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}