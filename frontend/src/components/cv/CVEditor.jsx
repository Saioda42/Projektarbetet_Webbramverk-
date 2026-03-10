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

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const sectionStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};

const btnPrimary = {
  background: "#2c7be5",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "transform 0.15s",
};

const btnDanger = {
  background: "#e74c3c",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  transition: "transform 0.15s",
};

const btnSuccess = {
  background: "#2c7be5",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "transform 0.15s",
};

const hoverIn = (e) => (e.currentTarget.style.transform = "scale(1.05)");
const hoverOut = (e) => (e.currentTarget.style.transform = "scale(1)");

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
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>
      Laddar CV...
    </div>
  );

  return (
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>

      <h2 style={{ marginBottom: "30px" }}>Mitt CV</h2>

      {error && !cv && (
        <div
          style={{
            background: "white",
            padding: "15px 20px",
            borderRadius: "12px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            marginBottom: "20px",
            color: "#f39c12",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}

      {/* Personal Info */}
      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Personlig Information</h3>
        <form onSubmit={handleSavePersonalInfo}>
          <input type="text" placeholder="Fullständigt namn" value={personalInfo.full_name} onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })} required style={inputStyle} />
          <input type="email" placeholder="E-post" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} required style={inputStyle} />
          <input type="tel" placeholder="Telefon" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} style={inputStyle} />
          <textarea placeholder="Sammanfattning / Pitch" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} rows="3" style={{ ...inputStyle, fontFamily: "inherit" }} />
          <button type="submit" style={btnSuccess} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            Spara
          </button>
        </form>
      </section>

      {/* Experiences */}
      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Arbetserfarenhet</h3>

        {cv?.experiences?.map((exp) => (
          <div
            key={exp.id}
            style={{
              padding: "15px",
              background: "#f4f6f8",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            <h4 style={{ margin: "0 0 5px 0" }}>{exp.role} - {exp.company}</h4>
            <p style={{ fontSize: "14px", color: "#777", margin: "0 0 5px 0" }}>
              {exp.start_date} till {exp.end_date || 'Nuvarande'}
            </p>
            {exp.description && <p style={{ fontSize: "14px", color: "#666", margin: "0 0 10px 0" }}>{exp.description}</p>}
            <button onClick={() => handleDeleteExperience(exp.id)} style={btnDanger} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              Ta bort
            </button>
          </div>
        ))}

        <h4 style={{ color: "#2c3e50" }}>Lägg till ny</h4>
        <form onSubmit={handleAddExperience}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input type="text" placeholder="Företag" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} required style={inputStyle} />
            <input type="text" placeholder="Roll" value={newExperience.role} onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })} required style={inputStyle} />
            <input type="date" value={newExperience.start_date} onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })} required style={inputStyle} />
            <input type="date" value={newExperience.end_date} onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })} style={inputStyle} />
          </div>
          <textarea placeholder="Beskrivning" value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} rows="2" style={{ ...inputStyle, fontFamily: "inherit" }} />
          <button type="submit" style={btnPrimary} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>Lägg till</button>
        </form>
      </section>

      {/* Education */}
      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Utbildning</h3>

        {cv?.educations?.map((edu) => (
          <div
            key={edu.id}
            style={{
              padding: "15px",
              background: "#f4f6f8",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            <h4 style={{ margin: "0 0 5px 0" }}>{edu.degree} i {edu.field}</h4>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 3px 0" }}>{edu.school}</p>
            <p style={{ fontSize: "14px", color: "#777", margin: "0 0 10px 0" }}>
              {edu.start_date} till {edu.end_date || 'Pågående'}
            </p>
            <button onClick={() => handleDeleteEducation(edu.id)} style={btnDanger} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              Ta bort
            </button>
          </div>
        ))}

        <h4 style={{ color: "#2c3e50" }}>Lägg till ny</h4>
        <form onSubmit={handleAddEducation}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input type="text" placeholder="Skola" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} required style={inputStyle} />
            <input type="text" placeholder="Examen (t.ex. Bachelor)" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} required style={inputStyle} />
            <input type="text" placeholder="Ämne (t.ex. Datavetenskap)" value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} required style={inputStyle} />
            <div></div>
            <input type="date" value={newEducation.start_date} onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })} required style={inputStyle} />
            <input type="date" value={newEducation.end_date} onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })} style={inputStyle} />
          </div>
          <button type="submit" style={btnPrimary} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>Lägg till</button>
        </form>
      </section>

      {/* Skills */}
      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Färdigheter</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {cv?.skills?.map((skill) => (
            <div
              key={skill.id}
              style={{
                padding: "8px 14px",
                background: "#2c7be5",
                color: "white",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {skill.skill_name}
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Ny färdighet (t.ex. Python)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
          />
          <button type="submit" style={btnPrimary} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            Lägg till
          </button>
        </form>
      </section>
    </div>
  );
}

export default CVEditor;
