// frontend/src/components/contacts/ContactList.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämta alla contacts när komponenten laddas
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
      // Ta bort från listan direkt
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (err) {
      alert('Kunde inte radera kontakt');
      console.error(err);
    }
  };

  if (loading) return <div>Laddar kontakter...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mina Kontakter</h1>
      
      {contacts.length === 0 ? (
        <p>Inga kontakter än. Skapa din första!</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3>{contact.name}</h3>
              <p><strong>Företag:</strong> {contact.company || 'Ej angivet'}</p>
              <p><strong>Roll:</strong> {contact.role || 'Ej angivet'}</p>
              <p><strong>Email:</strong> {contact.email || 'Ej angivet'}</p>
              <p><strong>Telefon:</strong> {contact.phone || 'Ej angivet'}</p>
              {contact.notes && (
                <p><strong>Anteckningar:</strong> {contact.notes}</p>
              )}
              
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Redigera
                </button>
                <button 
                  onClick={() => handleDelete(contact.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
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