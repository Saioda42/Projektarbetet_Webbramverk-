import { useState, useEffect } from 'react';
import {
  getAllReminders,
  createReminder,
  deleteReminder,
  markReminderAsSent
} from '../../services/reminderApi';

const hoverIn = (e) => (e.currentTarget.style.transform = "scale(1.05)");
const hoverOut = (e) => (e.currentTarget.style.transform = "scale(1)");

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    remind_date: '',
    remind_time: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await getAllReminders();
      setReminders(data);
      setError(null);
    } catch (err) {
      setError('Kunde inte hämta påminnelser');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const localDateTime = new Date(`${formData.remind_date}T${formData.remind_time}`);
    const utcDateTime = localDateTime.toISOString();

    try {
      await createReminder({
        title: formData.title,
        description: formData.description,
        remind_date: utcDateTime,
        application_id: null
      });
      setFormData({ title: '', description: '', remind_date: '', remind_time: '' });
      await fetchReminders();
      alert('Påminnelse skapad!');
    } catch (err) {
      alert('Kunde inte skapa påminnelse');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ta bort denna påminnelse?')) {
      try {
        await deleteReminder(id);
        await fetchReminders();
      } catch (err) {
        alert('Kunde inte ta bort påminnelse');
      }
    }
  };

  const handleMarkSent = async (id) => {
    try {
      await markReminderAsSent(id);
      await fetchReminders();
    } catch (err) {
      alert('Kunde inte markera som skickad');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  if (loading) return (
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>
      Laddar påminnelser...
    </div>
  );

  return (
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>

      <h2 style={{ marginBottom: "30px" }}>E-postpåminnelser</h2>

      <div
        style={{
          background: "white",
          padding: "15px 20px",
          borderRadius: "12px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
          marginBottom: "20px",
          color: "#2c7be5",
          fontSize: "14px",
        }}
      >
        <strong>Tips:</strong> Välj datum och tid i din lokala tidszon. Påminnelser skickas automatiskt via e-post!
      </div>

      {error && (
        <div
          style={{
            background: "white",
            padding: "15px 20px",
            borderRadius: "12px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            marginBottom: "20px",
            color: "#e74c3c",
          }}
        >
          {error}
        </div>
      )}

      {/* Create reminder form */}
      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Skapa ny påminnelse</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="t.ex. Följ upp ansökan till Spotify"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              Beskrivning
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vad vill du bli påmind om?"
              rows="3"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
                Datum *
              </label>
              <input
                type="date"
                value={formData.remind_date}
                onChange={(e) => setFormData({ ...formData, remind_date: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
                Tid (lokal tid) *
              </label>
              <input
                type="time"
                value={formData.remind_time}
                onChange={(e) => setFormData({ ...formData, remind_time: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: "#2c7be5",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "transform 0.15s",
            }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            Skapa påminnelse
          </button>
        </form>
      </section>

      {/* Reminder list */}
      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Mina påminnelser ({reminders.length})</h3>

        {reminders.length === 0 ? (
          <p style={{ color: "#777" }}>Inga påminnelser än. Skapa en ovan!</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  padding: "20px",
                  background: reminder.is_sent
                    ? "#f4f6f8"
                    : isUpcoming(reminder.remind_date)
                      ? "#eef5ff"
                      : "#fff8e1",
                  borderRadius: "12px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 5px 0" }}>
                      {reminder.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
                      {formatDate(reminder.remind_date)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {!reminder.is_sent && (
                      <button
                        onClick={() => handleMarkSent(reminder.id)}
                        style={{
                          ...{
                            background: "#2c7be5",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "12px",
                            transition: "transform 0.15s",
                          },
                        }}
                        onMouseEnter={hoverIn}
                        onMouseLeave={hoverOut}
                      >
                        Markera som skickad
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      style={{
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "12px",
                        transition: "transform 0.15s",
                      }}
                      onMouseEnter={hoverIn}
                      onMouseLeave={hoverOut}
                    >
                      Ta bort
                    </button>
                  </div>
                </div>

                {reminder.description && (
                  <p style={{ margin: "10px 0 0 0", color: "#666", fontSize: "14px" }}>
                    {reminder.description}
                  </p>
                )}

                {reminder.is_sent && (
                  <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#2c7be5", fontWeight: "bold" }}>
                    E-post skickat!
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Reminders;
