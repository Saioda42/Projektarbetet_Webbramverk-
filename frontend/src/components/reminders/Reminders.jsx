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
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      Laddar påminnelser...
    </div>
  );

  return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      <div className="max-w-7xl mx-auto">

      <h2 className="text-xl font-bold mb-8">E-postpåminnelser</h2>

      <div className="bg-white p-4 rounded-xl shadow mb-5 text-blue-600 text-sm">
        <strong>Tips:</strong> Välj datum och tid i din lokala tidszon. Påminnelser skickas automatiskt via e-post!
      </div>

      {error && (
        <div className="bg-white p-4 rounded-xl shadow mb-5 text-red-500">
          {error}
        </div>
      )}

      {/* Create reminder form */}
      <section className="bg-white p-6 rounded-xl shadow mb-5">
        <h3 className="font-semibold mt-0">Skapa ny påminnelse</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="t.ex. Följ upp ansökan till Spotify"
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              Beskrivning
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vad vill du bli påmind om?"
              rows="3"
              className="w-full border rounded px-3 py-2 text-sm font-[inherit]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block mb-1 font-semibold text-sm text-gray-700">
                Datum *
              </label>
              <input
                type="date"
                value={formData.remind_date}
                onChange={(e) => setFormData({ ...formData, remind_date: e.target.value })}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm text-gray-700">
                Tid (lokal tid) *
              </label>
              <input
                type="time"
                value={formData.remind_time}
                onChange={(e) => setFormData({ ...formData, remind_time: e.target.value })}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#2c7be5] text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
          >
            Skapa påminnelse
          </button>
        </form>
      </section>

      {/* Reminder list */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mt-0">Mina påminnelser ({reminders.length})</h3>

        {reminders.length === 0 ? (
          <p className="text-gray-500">Inga påminnelser än. Skapa en ovan!</p>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-5 rounded-xl transition-all duration-200 ${
                  reminder.is_sent
                    ? "bg-gray-50"
                    : isUpcoming(reminder.remind_date)
                      ? "bg-blue-50/30"
                      : "bg-yellow-50/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h4 className="m-0 mb-1 font-semibold">
                      {reminder.title}
                    </h4>
                    <p className="m-0 text-sm text-gray-500">
                      {formatDate(reminder.remind_date)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!reminder.is_sent && (
                      <button
                        onClick={() => handleMarkSent(reminder.id)}
                        className="bg-[#2c7be5] text-white py-1.5 px-3 rounded-lg font-semibold text-xs hover:scale-105 transition-transform"
                      >
                        Markera som skickad
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-xs py-1.5 px-3"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>

                {reminder.description && (
                  <p className="mt-2.5 mb-0 text-gray-500 text-sm">
                    {reminder.description}
                  </p>
                )}

                {reminder.is_sent && (
                  <p className="mt-2.5 mb-0 text-xs text-blue-600 font-bold">
                    E-post skickat!
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      </div>
    </div>
  );
}

export default Reminders;
