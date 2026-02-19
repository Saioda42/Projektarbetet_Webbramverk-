import { useEffect, useState } from "react";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <ul>
        {applications.map((app) => (
          <li key={app.id}>
            {app.company} – {app.role}
          </li>
        ))}
      </ul>
    </div>
  );
}