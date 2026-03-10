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

  const validateName = (name) => {
    if (!name.trim()) return 'Namn är obligatoriskt';
    if (/\d/.test(name)) return 'Namn får inte innehålla siffror';
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return 'Ange både för- och efternamn';
    return null;
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'E-post är obligatoriskt';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ange en giltig e-postadress';
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Telefonnummer är obligatoriskt';
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^(\+|0)[0-9]{7,15}$/;
    if (!phoneRegex.test(cleanPhone)) return 'Ange ett giltigt telefonnummer (minst 8 siffror)';
    return null;
  };

  const validateCompany = (company) => {
    if (!company.trim()) return 'Företag är obligatoriskt';
    if (company.trim().length < 2) return 'Företagsnamn måste vara minst 2 tecken';
    return null;
  };

  const validateRole = (role) => {
    if (!role.trim()) return 'Roll är obligatoriskt';
    if (role.trim().length < 2) return 'Roll måste vara minst 2 tecken';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
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
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/contacts/${editContact.id}`, formData);
        onContactUpdated && onContactUpdated();
      } else {
        await api.post('/contacts/', formData);
        onContactCreated && onContactCreated();
      }
      setFormData({ name: '', email: '', phone: '', company: '', role: '', notes: '' });
      setErrors({});
    } catch (err) {
      setErrors({ submit: 'Kunde inte spara kontakt. Försök igen.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: errors[fieldName] ? "2px solid #e74c3c" : "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  });

  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
        marginBottom: "30px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        {isEditing ? 'Redigera Kontakt' : 'Skapa Ny Kontakt'}
      </h3>

      {errors.submit && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#e74c3c",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              Namn (För- och efternamn) *
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="t.ex. Anna Andersson" style={inputStyle("name")} />
            {errors.name && <span style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.name}</span>}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              E-post *
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="namn@exempel.se" style={inputStyle("email")} />
            {errors.email && <span style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.email}</span>}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              Telefonnummer *
            </label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="t.ex. 070-123 45 67" style={inputStyle("phone")} />
            {errors.phone && <span style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.phone}</span>}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              Företag *
            </label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="t.ex. Spotify AB" style={inputStyle("company")} />
            {errors.company && <span style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.company}</span>}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
              Roll *
            </label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="t.ex. Recruiter" style={inputStyle("role")} />
            {errors.role && <span style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.role}</span>}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2c3e50" }}>
            Anteckningar (frivilligt)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Eventuella anteckningar..."
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

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "#2c7be5",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? 'Sparar...' : (isEditing ? 'Uppdatera' : 'Skapa')}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
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
