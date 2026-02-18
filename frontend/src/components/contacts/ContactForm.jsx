// frontend/src/components/contacts/ContactForm.jsx

import { useState } from 'react';
import api from '../../services/api';

function ContactForm({ onContactCreated, editContact, onContactUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    name: editContact?.name || '',
    email: editContact?.email || '',
    phone: editContact?.phone || '',
    company: editContact?.company || '',
    role: editContact?.role || '',
    notes: editContact?.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!editContact;

  // Validera namn (får inte innehålla siffror, måste ha för- och efternamn)
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Namn är obligatoriskt';
    }
    
    // Kolla om det finns siffror
    if (/\d/.test(name)) {
      return 'Namn får inte innehålla siffror';
    }
    
    // Kolla att det finns minst två ord (för- och efternamn)
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return 'Ange både för- och efternamn';
    }
    
    return null;
  };

  // Validera email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email är obligatoriskt';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ange en giltig email-adress';
    }
    
    return null;
  };

  // Validera telefonnummer (internationellt format)
  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return 'Telefonnummer är obligatoriskt';
    }
    
    // Ta bort mellanslag, bindestreck och parenteser för validering
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Måste börja med + eller 0, följt av 7-15 siffror
    // Accepterar: +46701234567, 0701234567, +1-555-123-4567, etc.
    const phoneRegex = /^(\+|0)[0-9]{7,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return 'Ange ett giltigt telefonnummer (minst 8 siffror)';
    }
    
    return null;
  };

  // Validera företag
  const validateCompany = (company) => {
    if (!company.trim()) {
      return 'Företag är obligatoriskt';
    }
    
    if (company.trim().length < 2) {
      return 'Företagsnamn måste vara minst 2 tecken';
    }
    
    return null;
  };

  // Validera roll
  const validateRole = (role) => {
    if (!role.trim()) {
      return 'Roll är obligatoriskt';
    }
    
    if (role.trim().length < 2) {
      return 'Roll måste vara minst 2 tecken';
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Ta bort felmeddelande för detta fält när användaren börjar skriva
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const companyError = validateCompany(formData.company);
    if (companyError) newErrors.company = companyError;

    const roleError = validateRole(formData.role);
    if (roleError) newErrors.role = roleError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validera alla fält
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await api.put(`/contacts/${editContact.id}`, formData);
        onContactUpdated && onContactUpdated();
      } else {
        await api.post('/contacts/', formData);
        onContactCreated && onContactCreated();
      }

      // Rensa formuläret
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: '',
        notes: ''
      });
      setErrors({});

    } catch (err) {
      setErrors({ submit: 'Kunde inte spara kontakt. Försök igen.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
      marginBottom: '20px'
    }}>
      <h2>{isEditing ? 'Redigera Kontakt' : 'Skapa Ny Kontakt'}</h2>
      
      {errors.submit && (
        <div style={{
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Namn */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Namn (För- och efternamn) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="t.ex. Anna Andersson"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.name ? '2px solid #c62828' : '1px solid #ddd'
            }}
          />
          {errors.name && (
            <span style={{ color: '#c62828', fontSize: '14px' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="namn@example.com"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.email ? '2px solid #c62828' : '1px solid #ddd'
            }}
          />
          {errors.email && (
            <span style={{ color: '#c62828', fontSize: '14px' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Telefon */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Telefonnummer *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="t.ex. 070-123 45 67 eller +46 70 123 45 67"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.phone ? '2px solid #c62828' : '1px solid #ddd'
            }}
          />
          {errors.phone && (
            <span style={{ color: '#c62828', fontSize: '14px' }}>
              {errors.phone}
            </span>
          )}
        </div>

        {/* Företag */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Företag *
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="t.ex. Spotify AB"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.company ? '2px solid #c62828' : '1px solid #ddd'
            }}
          />
          {errors.company && (
            <span style={{ color: '#c62828', fontSize: '14px' }}>
              {errors.company}
            </span>
          )}
        </div>

        {/* Roll */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Roll *
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="t.ex. Recruiter, Hiring Manager"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.role ? '2px solid #c62828' : '1px solid #ddd'
            }}
          />
          {errors.role && (
            <span style={{ color: '#c62828', fontSize: '14px' }}>
              {errors.role}
            </span>
          )}
        </div>

        {/* Anteckningar (frivilligt) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Anteckningar (frivilligt)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Eventuella anteckningar..."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Sparar...' : (isEditing ? 'Uppdatera' : 'Skapa')}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Avbryt
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ContactForm;