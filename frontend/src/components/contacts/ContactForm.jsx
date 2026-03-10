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
    <div className="bg-white p-[25px] rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-[30px]">
      <h3 className="mt-0">
        {isEditing ? 'Redigera Kontakt' : 'Skapa Ny Kontakt'}
      </h3>

      {errors.submit && (
        <div className="bg-[#ffebee] text-[#e74c3c] p-3 rounded-lg mb-5 text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[15px] mb-[15px]">
          <div>
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              Namn (För- och efternamn) *
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="t.ex. Anna Andersson" className={`w-full p-2.5 rounded-md text-sm box-border ${errors.name ? "border-2 border-[#e74c3c]" : "border border-[#ccc]"}`} />
            {errors.name && <span className="text-[#e74c3c] text-xs">{errors.name}</span>}
          </div>

          <div>
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              E-post *
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="namn@exempel.se" className={`w-full p-2.5 rounded-md text-sm box-border ${errors.email ? "border-2 border-[#e74c3c]" : "border border-[#ccc]"}`} />
            {errors.email && <span className="text-[#e74c3c] text-xs">{errors.email}</span>}
          </div>

          <div>
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              Telefonnummer *
            </label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="t.ex. 070-123 45 67" className={`w-full p-2.5 rounded-md text-sm box-border ${errors.phone ? "border-2 border-[#e74c3c]" : "border border-[#ccc]"}`} />
            {errors.phone && <span className="text-[#e74c3c] text-xs">{errors.phone}</span>}
          </div>

          <div>
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              Företag *
            </label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="t.ex. Spotify AB" className={`w-full p-2.5 rounded-md text-sm box-border ${errors.company ? "border-2 border-[#e74c3c]" : "border border-[#ccc]"}`} />
            {errors.company && <span className="text-[#e74c3c] text-xs">{errors.company}</span>}
          </div>

          <div>
            <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
              Roll *
            </label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="t.ex. Recruiter" className={`w-full p-2.5 rounded-md text-sm box-border ${errors.role ? "border-2 border-[#e74c3c]" : "border border-[#ccc]"}`} />
            {errors.role && <span className="text-[#e74c3c] text-xs">{errors.role}</span>}
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-[5px] font-semibold text-sm text-[#2c3e50]">
            Anteckningar (frivilligt)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Eventuella anteckningar..."
            className="w-full p-2.5 rounded-md border border-[#ccc] text-sm font-[inherit] box-border"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            type="submit"
            disabled={loading}
            className={`text-white border-none px-[18px] py-2.5 rounded-lg font-bold text-sm hover:scale-105 transition-transform duration-150 ${loading ? "bg-[#ccc] cursor-not-allowed" : "bg-[#2c7be5] cursor-pointer"}`}
          >
            {loading ? 'Sparar...' : (isEditing ? 'Uppdatera' : 'Skapa')}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-[#6c757d] text-white border-none px-[18px] py-2.5 rounded-lg cursor-pointer font-bold text-sm hover:scale-105 transition-transform duration-150"
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
