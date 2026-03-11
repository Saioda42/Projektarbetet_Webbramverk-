import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function AccountSettings({ onLogout }) {
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const navigate = useNavigate();

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await api.get('/auth/export-data');
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mina-uppgifter.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Kunde inte exportera data');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Är du HELT säker? Detta raderar ditt konto och ALL din data permanent. Detta kan inte ångras.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'Sista chansen: Vill du verkligen radera allt? Skriv inte av dig — all data försvinner för alltid.'
    );
    if (!doubleConfirm) return;

    try {
      setDeleting(true);
      await api.delete('/auth/account');
      localStorage.removeItem('token');
      onLogout();
      navigate('/login');
    } catch (err) {
      alert('Kunde inte radera kontot');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-xl font-bold mb-8">Kontoinställningar</h2>

        {/* Exportera data */}
        <section className="bg-white p-6 rounded-xl shadow mb-5">
          <h3 className="font-semibold mt-0">Exportera min data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Ladda ner all din data i JSON-format. Detta inkluderar ditt konto, ansökningar, CV, kontakter och påminnelser.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className={`text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform ${exporting ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
          >
            {exporting ? 'Exporterar...' : 'Ladda ner min data'}
          </button>
        </section>

        {/* Integritetspolicy */}
        <section className="bg-white p-6 rounded-xl shadow mb-5">
          <h3 className="font-semibold mt-0">Integritet och data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Läs om hur vi hanterar din data och dina rättigheter enligt GDPR.
          </p>
          <a
            href="/privacy"
            className="text-blue-600 font-bold text-sm no-underline hover:underline"
          >
            Läs integritetspolicyn
          </a>
        </section>

        {/* Radera konto */}
        <section className="bg-white p-6 rounded-xl shadow border border-red-200">
          <h3 className="font-semibold mt-0 text-red-500">Radera konto</h3>
          <p className="text-sm text-gray-500 mb-4">
            När du raderar ditt konto tas ALL din data bort permanent — ansökningar, CV, kontakter och påminnelser. Detta kan inte ångras.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className={`text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform ${deleting ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 cursor-pointer'}`}
          >
            {deleting ? 'Raderar...' : 'Radera mitt konto'}
          </button>
        </section>

      </div>
    </div>
  );
}

export default AccountSettings;
