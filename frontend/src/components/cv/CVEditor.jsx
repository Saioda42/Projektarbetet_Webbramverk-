import { useState, useEffect } from 'react';
import {
  getMyCV,
  createOrUpdateCV,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addSkill,
  deleteSkill
} from '../../services/cvApi';

function CVEditor() {
  const [cv, setCV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    summary: ''
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: ''
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const data = await getMyCV();
      setCV(data);
      setPersonalInfo({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        summary: data.summary || ''
      });
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Inget CV ännu. Skapa ett nedan!');
      } else {
        setError('Kunde inte hämta CV');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    try {
      const updated = await createOrUpdateCV(personalInfo);
      setCV(updated);
      alert('CV sparat!');
    } catch (err) {
      alert('Kunde inte spara CV');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      await addExperience({
        ...newExperience,
        end_date: newExperience.end_date || null
      });
      await fetchCV();
      setNewExperience({ company: '', role: '', start_date: '', end_date: '', description: '' });
    } catch (err) {
      alert('Kunde inte lägga till erfarenhet');
    }
  };

  const handleDeleteExperience = async (id) => {
    if (window.confirm('Ta bort denna erfarenhet?')) {
      try {
        await deleteExperience(id);
        await fetchCV();
      } catch (err) {
        alert('Kunde inte ta bort erfarenhet');
      }
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await addEducation({
        ...newEducation,
        end_date: newEducation.end_date || null
      });
      await fetchCV();
      setNewEducation({ school: '', degree: '', field: '', start_date: '', end_date: '' });
    } catch (err) {
      alert('Kunde inte lägga till utbildning');
    }
  };

  const handleDeleteEducation = async (id) => {
    if (window.confirm('Ta bort denna utbildning?')) {
      try {
        await deleteEducation(id);
        await fetchCV();
      } catch (err) {
        alert('Kunde inte ta bort utbildning');
      }
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await addSkill({ skill_name: newSkill });
      await fetchCV();
      setNewSkill('');
    } catch (err) {
      alert('Kunde inte lägga till färdighet');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSkill(id);
      await fetchCV();
    } catch (err) {
      alert('Kunde inte ta bort färdighet');
    }
  };

  if (loading) return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      Laddar CV...
    </div>
  );

  return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">

      <h2 className="mb-[30px]">Mitt CV</h2>

      {error && !cv && (
        <div className="bg-white px-5 py-[15px] rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5 text-[#f39c12] font-semibold">
          {error}
        </div>
      )}

      {/* Personal Info */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5">
        <h3 className="mt-0">Personlig Information</h3>
        <form onSubmit={handleSavePersonalInfo}>
          <input type="text" placeholder="Fullständigt namn" value={personalInfo.full_name} onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
          <input type="email" placeholder="E-post" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
          <input type="tel" placeholder="Telefon" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
          <textarea placeholder="Sammanfattning / Pitch" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} rows="3" className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border font-[inherit]" />
          <button type="submit" className="bg-[#2c7be5] text-white border-none px-[18px] py-2.5 rounded-lg cursor-pointer font-bold text-sm hover:scale-105 transition-transform duration-150">
            Spara
          </button>
        </form>
      </section>

      {/* Experiences */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5">
        <h3 className="mt-0">Arbetserfarenhet</h3>

        {cv?.experiences?.map((exp) => (
          <div
            key={exp.id}
            className="p-[15px] bg-[#f4f6f8] rounded-lg mb-2.5"
          >
            <h4 className="m-0 mb-[5px]">{exp.role} - {exp.company}</h4>
            <p className="text-sm text-[#777] m-0 mb-[5px]">
              {exp.start_date} till {exp.end_date || 'Nuvarande'}
            </p>
            {exp.description && <p className="text-sm text-[#666] m-0 mb-2.5">{exp.description}</p>}
            <button onClick={() => handleDeleteExperience(exp.id)} className="bg-[#e74c3c] text-white border-none px-3 py-1.5 rounded-lg cursor-pointer font-semibold text-[13px] hover:scale-105 transition-transform duration-150">
              Ta bort
            </button>
          </div>
        ))}

        <h4 className="text-[#2c3e50]">Lägg till ny</h4>
        <form onSubmit={handleAddExperience}>
          <div className="grid grid-cols-2 gap-2.5">
            <input type="text" placeholder="Företag" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <input type="text" placeholder="Roll" value={newExperience.role} onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <input type="date" value={newExperience.start_date} onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <input type="date" value={newExperience.end_date} onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })} className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
          </div>
          <textarea placeholder="Beskrivning" value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} rows="2" className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border font-[inherit]" />
          <button type="submit" className="bg-[#2c7be5] text-white border-none px-[18px] py-2.5 rounded-lg cursor-pointer font-bold text-sm hover:scale-105 transition-transform duration-150">Lägg till</button>
        </form>
      </section>

      {/* Education */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5">
        <h3 className="mt-0">Utbildning</h3>

        {cv?.educations?.map((edu) => (
          <div
            key={edu.id}
            className="p-[15px] bg-[#f4f6f8] rounded-lg mb-2.5"
          >
            <h4 className="m-0 mb-[5px]">{edu.degree} i {edu.field}</h4>
            <p className="text-sm text-[#666] m-0 mb-[3px]">{edu.school}</p>
            <p className="text-sm text-[#777] m-0 mb-2.5">
              {edu.start_date} till {edu.end_date || 'Pågående'}
            </p>
            <button onClick={() => handleDeleteEducation(edu.id)} className="bg-[#e74c3c] text-white border-none px-3 py-1.5 rounded-lg cursor-pointer font-semibold text-[13px] hover:scale-105 transition-transform duration-150">
              Ta bort
            </button>
          </div>
        ))}

        <h4 className="text-[#2c3e50]">Lägg till ny</h4>
        <form onSubmit={handleAddEducation}>
          <div className="grid grid-cols-2 gap-2.5">
            <input type="text" placeholder="Skola" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <input type="text" placeholder="Examen (t.ex. Bachelor)" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <input type="text" placeholder="Ämne (t.ex. Datavetenskap)" value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <div></div>
            <input type="date" value={newEducation.start_date} onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })} required className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
            <input type="date" value={newEducation.end_date} onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })} className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border" />
          </div>
          <button type="submit" className="bg-[#2c7be5] text-white border-none px-[18px] py-2.5 rounded-lg cursor-pointer font-bold text-sm hover:scale-105 transition-transform duration-150">Lägg till</button>
        </form>
      </section>

      {/* Skills */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5">
        <h3 className="mt-0">Färdigheter</h3>

        <div className="flex flex-wrap gap-2.5 mb-5">
          {cv?.skills?.map((skill) => (
            <div
              key={skill.id}
              className="px-3.5 py-2 bg-[#2c7be5] text-white rounded-full flex items-center gap-2 text-sm font-medium"
            >
              {skill.skill_name}
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                className="bg-transparent border-none text-white cursor-pointer text-base p-0 leading-none"
              >
                x
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Ny färdighet (t.ex. Python)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="w-full p-2.5 rounded-md border border-[#ccc] text-sm box-border flex-1"
          />
          <button type="submit" className="bg-[#2c7be5] text-white border-none px-[18px] py-2.5 rounded-lg cursor-pointer font-bold text-sm hover:scale-105 transition-transform duration-150">
            Lägg till
          </button>
        </form>
      </section>
    </div>
  );
}

export default CVEditor;
