// frontend/src/components/reminders/Reminders.jsx

import { useState, useEffect } from 'react';
import {
  getAllReminders,
  createReminder,
  deleteReminder,
  markReminderAsSent
} from '../../services/reminderApi';

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

    // Skapa Date-objekt från lokal tid
    const localDateTime = new Date(`${formData.remind_date}T${formData.remind_time}`);
    
    // Konvertera till UTC ISO-format
    const utcDateTime = localDateTime.toISOString();

    try {
      await createReminder({
        title: formData.title,
        description: formData.description,
        remind_date: utcDateTime,  // Skickar UTC-tid
        application_id: null
      });

      // Rensa formulär
      setFormData({
        title: '',
        description: '',
        remind_date: '',
        remind_time: ''
      });

      // Uppdatera lista
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
    // Visa i LOKAL tid för användaren
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

  if (loading) return <div style={{ padding: '20px' }}>Laddar påminnelser...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📧 Email-påminnelser</h1>

      <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        💡 <strong>Tips:</strong> Välj datum och tid i din lokala tidszon. Påminnelser skickas automatiskt via email!
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Formulär för att skapa påminnelse */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Skapa ny påminnelse</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="t.ex. Följ upp ansökan till Spotify"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Beskrivning
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vad vill du bli påmind om?"
              rows="3"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Datum *
              </label>
              <input
                type="date"
                value={formData.remind_date}
                onChange={(e) => setFormData({ ...formData, remind_date: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tid (lokal tid) *
              </label>
              <input
                type="time"
                value={formData.remind_time}
                onChange={(e) => setFormData({ ...formData, remind_time: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            📅 Skapa påminnelse
          </button>
        </form>
      </section>

      {/* Lista över påminnelser */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Mina påminnelser ({reminders.length})</h2>

        {reminders.length === 0 ? (
          <p style={{ color: '#666' }}>Inga påminnelser än. Skapa en ovan!</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  padding: '15px',
                  backgroundColor: reminder.is_sent ? '#f0f0f0' : isUpcoming(reminder.remind_date) ? '#e3f2fd' : '#fff3cd',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>
                      {reminder.is_sent ? '✅' : isUpcoming(reminder.remind_date) ? '⏰' : '⚠️'} {reminder.title}
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      📅 {formatDate(reminder.remind_date)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '5px' }}>
                    {!reminder.is_sent && (
                      <button
                        onClick={() => handleMarkSent(reminder.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Markera som skickad
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Ta bort
                    </button>
                  </div>
                </div>

                {reminder.description && (
                  <p style={{ margin: '10px 0 0 0', color: '#555' }}>
                    {reminder.description}
                  </p>
                )}

                {reminder.is_sent && (
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#4CAF50', fontWeight: 'bold' }}>
                    ✅ Email skickat!
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