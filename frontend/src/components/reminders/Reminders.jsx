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

      <h2 className="mb-[30px]">E-postpåminnelser</h2>

      <div className="bg-white px-5 py-[15px] rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5 text-[#2c7be5] text-sm">
        <strong>Tips:</strong> Välj datum och tid i din lokala tidszon. Påminnelser skickas automatiskt via e-post!
      </div>

      {error && (
        <div className="bg-white px-5 py-[15px] rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5 text-[#e74c3c]">
          {error}
        </div>
      )}

      {/* Create reminder form */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5">
        <h3 className="mt-0">Skapa ny påminnelse</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-[15px]">
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="t.ex. Följ upp ansökan till Spotify"
              required
              className="w-full p-2.5 rounded-md border border-[#ccc] text-sm box-border"
            />
          </div>

          <div className="mb-[15px]">
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              Beskrivning
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vad vill du bli påmind om?"
              rows="3"
              className="w-full p-2.5 rounded-md border border-[#ccc] text-sm font-[inherit] box-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-[15px] mb-5">
            <div>
              <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
                Datum *
              </label>
              <input
                type="date"
                value={formData.remind_date}
                onChange={(e) => setFormData({ ...formData, remind_date: e.target.value })}
                required
                className="w-full p-2.5 rounded-md border border-[#ccc] text-sm box-border"
              />
            </div>
            <div>
              <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
                Tid (lokal tid) *
              </label>
              <input
                type="time"
                value={formData.remind_time}
                onChange={(e) => setFormData({ ...formData, remind_time: e.target.value })}
                required
                className="w-full p-2.5 rounded-md border border-[#ccc] text-sm box-border"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#2c7be5] text-white border-none py-2.5 px-[18px] rounded-lg cursor-pointer font-bold text-sm hover:scale-105 transition-transform duration-150"
          >
            Skapa påminnelse
          </button>
        </form>
      </section>

      {/* Reminder list */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)]">
        <h3 className="mt-0">Mina påminnelser ({reminders.length})</h3>

        {reminders.length === 0 ? (
          <p className="text-[#777]">Inga påminnelser än. Skapa en ovan!</p>
        ) : (
          <div className="grid gap-[15px]">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-5 rounded-xl transition-all duration-200 ease-in-out ${
                  reminder.is_sent
                    ? "bg-[#f4f6f8]"
                    : isUpcoming(reminder.remind_date)
                      ? "bg-[#eef5ff]"
                      : "bg-[#fff8e1]"
                }`}
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h4 className="m-0 mb-[5px]">
                      {reminder.title}
                    </h4>
                    <p className="m-0 text-sm text-[#777]">
                      {formatDate(reminder.remind_date)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!reminder.is_sent && (
                      <button
                        onClick={() => handleMarkSent(reminder.id)}
                        className="bg-[#2c7be5] text-white border-none py-1.5 px-3 rounded-lg cursor-pointer font-semibold text-xs hover:scale-105 transition-transform duration-150"
                      >
                        Markera som skickad
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="bg-[#e74c3c] text-white border-none py-1.5 px-3 rounded-lg cursor-pointer font-semibold text-xs hover:scale-105 transition-transform duration-150"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>

                {reminder.description && (
                  <p className="mt-2.5 mb-0 text-[#666] text-sm">
                    {reminder.description}
                  </p>
                )}

                {reminder.is_sent && (
                  <p className="mt-2.5 mb-0 text-xs text-[#2c7be5] font-bold">
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
