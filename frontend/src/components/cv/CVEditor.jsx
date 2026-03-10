// frontend/src/components/cv/CVEditor.jsx

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
  
  // Form states
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

  // Hämta CV vid start
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
      setNewExperience({
        company: '',
        role: '',
        start_date: '',
        end_date: '',
        description: ''
      });
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
      setNewEducation({
        school: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: ''
      });
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
      alert('Kunde inte lägga till skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSkill(id);
      await fetchCV();
    } catch (err) {
      alert('Kunde inte ta bort skill');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Laddar CV...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Mitt CV</h1>

      {error && !cv && (
        <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Personal Info */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Personlig Information</h2>
        <form onSubmit={handleSavePersonalInfo}>
          <input
            type="text"
            placeholder="Fullständigt namn"
            value={personalInfo.full_name}
            onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="tel"
            placeholder="Telefon"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <textarea
            placeholder="Sammanfattning / Pitch"
            value={personalInfo.summary}
            onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
            rows="3"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Spara
          </button>
        </form>
      </section>

      {/* Experiences */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Arbetserfarenhet</h2>
        
        {cv?.experiences?.map((exp) => (
          <div key={exp.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
            <h3>{exp.role} - {exp.company}</h3>
            <p><small>{exp.start_date} till {exp.end_date || 'Nuvarande'}</small></p>
            {exp.description && <p>{exp.description}</p>}
            <button onClick={() => handleDeleteExperience(exp.id)} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Ta bort
            </button>
          </div>
        ))}

        <h3>Lägg till ny</h3>
        <form onSubmit={handleAddExperience}>
          <input type="text" placeholder="Företag" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="text" placeholder="Roll" value={newExperience.role} onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="date" placeholder="Startdatum" value={newExperience.start_date} onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="date" placeholder="Slutdatum (tomt = nuvarande)" value={newExperience.end_date} onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <textarea placeholder="Beskrivning" value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} rows="2" style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Lägg till</button>
        </form>
      </section>

      {/* Education */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Utbildning</h2>
        
        {cv?.educations?.map((edu) => (
          <div key={edu.id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
            <h3>{edu.degree} i {edu.field}</h3>
            <p>{edu.school}</p>
            <p><small>{edu.start_date} till {edu.end_date || 'Pågående'}</small></p>
            <button onClick={() => handleDeleteEducation(edu.id)} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Ta bort
            </button>
          </div>
        ))}

        <h3>Lägg till ny</h3>
        <form onSubmit={handleAddEducation}>
          <input type="text" placeholder="Skola" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="text" placeholder="Examen (t.ex. Bachelor)" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="text" placeholder="Ämne (t.ex. Datavetenskap)" value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="date" value={newEducation.start_date} onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="date" placeholder="Slutdatum (tomt = pågående)" value={newEducation.end_date} onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Lägg till</button>
        </form>
      </section>

      {/* Skills */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Skills</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          {cv?.skills?.map((skill) => (
            <div key={skill.id} style={{ padding: '8px 12px', backgroundColor: '#2196F3', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {skill.skill_name}
              <button onClick={() => handleDeleteSkill(skill.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
                ×
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Ny skill (t.ex. Python)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Lägg till
          </button>
        </form>
      </section>
    </div>
  );
}

export default CVEditor;