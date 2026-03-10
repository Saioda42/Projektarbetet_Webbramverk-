import { useState, useEffect } from 'react';
import api from '../../services/api';
import ContactForm from './ContactForm';

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacts/');
      setContacts(response.data);
      setError(null);
    } catch (err) {
      setError('Kunde inte hämta kontakter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Är du säker på att du vill radera denna kontakt?')) {
      return;
    }

    try {
      await api.delete(`/contacts/${id}`);
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (err) {
      alert('Kunde inte radera kontakt');
      console.error(err);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleContactCreated = () => {
    fetchContacts();
    setShowForm(false);
  };

  const handleContactUpdated = () => {
    fetchContacts();
    setEditingContact(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setEditingContact(null);
    setShowForm(false);
  };

  if (loading) return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      Laddar kontakter...
    </div>
  );

  if (error) return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen text-red-500">
      {error}
    </div>
  );

  return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      <div className="max-w-7xl mx-auto">

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">Mina Kontakter</h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#2c7be5] text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          {showForm ? 'Dölj Formulär' : '+ Skapa Ny Kontakt'}
        </button>
      </div>

      {showForm && (
        <ContactForm
          editContact={editingContact}
          onContactCreated={handleContactCreated}
          onContactUpdated={handleContactUpdated}
          onCancel={handleCancel}
        />
      )}

      {contacts.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          Inga kontakter än. Skapa din första!
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,280px)] gap-5">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <h3 className="font-semibold mt-0">{contact.name}</h3>
              <p className="text-sm text-gray-500 my-1.5">
                <strong>Företag:</strong> {contact.company || 'Ej angivet'}
              </p>
              <p className="text-sm text-gray-500 my-1.5">
                <strong>Roll:</strong> {contact.role || 'Ej angivet'}
              </p>
              <p className="text-sm text-gray-500 my-1.5">
                <strong>E-post:</strong> {contact.email || 'Ej angivet'}
              </p>
              <p className="text-sm text-gray-500 my-1.5">
                <strong>Telefon:</strong> {contact.phone || 'Ej angivet'}
              </p>
              {contact.notes && (
                <p className="text-sm text-gray-500 my-1.5">
                  <strong>Anteckningar:</strong> {contact.notes}
                </p>
              )}

              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={() => handleEdit(contact)}
                  className="bg-[#2c7be5] text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:scale-105 transition-transform"
                >
                  Redigera
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-red-500 hover:text-red-700 font-semibold text-xs"
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  );
}

export default ContactList;
