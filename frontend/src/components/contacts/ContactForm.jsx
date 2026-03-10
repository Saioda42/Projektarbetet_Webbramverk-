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

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-8">
      <h3 className="font-semibold mt-0">
        {isEditing ? 'Redigera Kontakt' : 'Skapa Ny Kontakt'}
      </h3>

      {errors.submit && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-5 text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              Namn (För- och efternamn) *
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="t.ex. Anna Andersson" className={`w-full border rounded px-3 py-2 text-sm ${errors.name ? "border-2 border-red-500" : ""}`} />
            {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              E-post *
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="namn@exempel.se" className={`w-full border rounded px-3 py-2 text-sm ${errors.email ? "border-2 border-red-500" : ""}`} />
            {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              Telefonnummer *
            </label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="t.ex. 070-123 45 67" className={`w-full border rounded px-3 py-2 text-sm ${errors.phone ? "border-2 border-red-500" : ""}`} />
            {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              Företag *
            </label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="t.ex. Spotify AB" className={`w-full border rounded px-3 py-2 text-sm ${errors.company ? "border-2 border-red-500" : ""}`} />
            {errors.company && <span className="text-red-500 text-xs">{errors.company}</span>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-sm text-gray-700">
              Roll *
            </label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="t.ex. Recruiter" className={`w-full border rounded px-3 py-2 text-sm ${errors.role ? "border-2 border-red-500" : ""}`} />
            {errors.role && <span className="text-red-500 text-xs">{errors.role}</span>}
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-1 font-semibold text-sm text-gray-700">
            Anteckningar (frivilligt)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Eventuella anteckningar..."
            className="w-full border rounded px-3 py-2 text-sm font-[inherit]"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            type="submit"
            disabled={loading}
            className={`text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#2c7be5] cursor-pointer"}`}
          >
            {loading ? 'Sparar...' : (isEditing ? 'Uppdatera' : 'Skapa')}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
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
