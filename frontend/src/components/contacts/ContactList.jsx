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
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>
      Laddar kontakter...
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh", color: "#e74c3c" }}>
      {error}
    </div>
  );

  return (
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ margin: 0 }}>Mina Kontakter</h2>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#2c7be5",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
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
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            textAlign: "center",
            color: "#777",
          }}
        >
          Inga kontakter än. Skapa din första!
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 280px)",
            gap: "20px",
          }}
        >
          {contacts.map(contact => (
            <div
              key={contact.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <h3 style={{ marginTop: 0 }}>{contact.name}</h3>
              <p style={{ fontSize: "14px", color: "#666", margin: "6px 0" }}>
                <strong>Företag:</strong> {contact.company || 'Ej angivet'}
              </p>
              <p style={{ fontSize: "14px", color: "#666", margin: "6px 0" }}>
                <strong>Roll:</strong> {contact.role || 'Ej angivet'}
              </p>
              <p style={{ fontSize: "14px", color: "#666", margin: "6px 0" }}>
                <strong>Email:</strong> {contact.email || 'Ej angivet'}
              </p>
              <p style={{ fontSize: "14px", color: "#666", margin: "6px 0" }}>
                <strong>Telefon:</strong> {contact.phone || 'Ej angivet'}
              </p>
              {contact.notes && (
                <p style={{ fontSize: "14px", color: "#666", margin: "6px 0" }}>
                  <strong>Anteckningar:</strong> {contact.notes}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={() => handleEdit(contact)}
                  style={{
                    background: "#2c7be5",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Redigera
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContactList;
