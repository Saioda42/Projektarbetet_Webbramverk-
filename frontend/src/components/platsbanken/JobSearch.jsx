import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  searchJobs,
  getAd,
  saveApplication,
  saveReminder,
  matchCV,
} from '../../services/platsbankenApi';

function JobSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedAd, setExpandedAd] = useState(null);
  const [loadingAd, setLoadingAd] = useState(false);

  // Save states
  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [saveMessage, setSaveMessage] = useState(null);

  // Reminder states
  const [showReminderForm, setShowReminderForm] = useState(null);
  const [reminderData, setReminderData] = useState({ title: '', remind_date: '', description: '' });
  const [reminderMessage, setReminderMessage] = useState(null);

  // CV match states
  const [matchResult, setMatchResult] = useState(null);
  const [matchingId, setMatchingId] = useState(null);
  const [matchError, setMatchError] = useState(null);

  const LIMIT = 10;

  const handleSearch = async (newOffset = 0) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs(query, newOffset, LIMIT);
      setResults(res.data.hits || []);
      setTotal(res.data.total?.value || 0);
      setOffset(newOffset);
      setExpandedId(null);
      setExpandedAd(null);
      setMatchResult(null);
    } catch {
      setError('Kunde inte söka jobb. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedAd(null);
      setMatchResult(null);
      return;
    }
    setExpandedId(id);
    setExpandedAd(null);
    setMatchResult(null);
    setLoadingAd(true);
    try {
      const res = await getAd(id);
      setExpandedAd(res.data);
    } catch {
      setExpandedAd(null);
    } finally {
      setLoadingAd(false);
    }
  };

  const handleSave = async (hit) => {
    setSavingId(hit.id);
    setSaveMessage(null);
    try {
      await saveApplication({
        platsbanken_ad_id: hit.id,
        company: hit.employer?.name || 'Okänt företag',
        role: hit.headline || 'Okänd roll',
        source: 'Platsbanken',
        notes: hit.application_details?.url || '',
        contact_name: hit.application_details?.email ? (hit.employer?.name || '') : null,
        contact_email: hit.application_details?.email || null,
        contact_phone: null,
      });
      setSavedIds((prev) => new Set(prev).add(hit.id));
      setSaveMessage({ id: hit.id, text: 'Sparad!', type: 'success' });
    } catch {
      setSaveMessage({ id: hit.id, text: 'Kunde inte spara.', type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const handleOpenReminder = (hit) => {
    const deadline = hit.last_publication_date || hit.application_deadline;
    let defaultDate = '';
    if (deadline) {
      const d = new Date(deadline);
      d.setDate(d.getDate() - 3);
      defaultDate = d.toISOString().slice(0, 16);
    }
    setReminderData({
      title: `Sök ${hit.headline} på ${hit.employer?.name || ''}`,
      remind_date: defaultDate,
      description: '',
    });
    setShowReminderForm(hit.id);
    setReminderMessage(null);
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    try {
      await saveReminder({
        title: reminderData.title,
        description: reminderData.description,
        remind_date: reminderData.remind_date,
      });
      setReminderMessage({ text: 'Påminnelse skapad!', type: 'success' });
      setShowReminderForm(null);
    } catch {
      setReminderMessage({ text: 'Kunde inte skapa påminnelse.', type: 'error' });
    }
  };

  const handleMatch = async (adId) => {
    setMatchingId(adId);
    setMatchResult(null);
    setMatchError(null);
    try {
      const res = await matchCV(adId);
      setMatchResult(res.data);
    } catch (err) {
      setMatchError(err.response?.data?.detail || 'Kunde inte matcha mot CV.');
    } finally {
      setMatchingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getMatchColor = (pct) => {
    if (pct >= 70) return '#27ae60';
    if (pct >= 40) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">

      <h2 className="mb-[30px]">Jobbannonser - Platsbanken</h2>

      {/* Sökfält */}
      <section className="bg-white p-6 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(0); }}
          className="flex gap-2.5"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök jobb, t.ex. 'React utvecklare Stockholm'"
            className="flex-1 p-2.5 rounded-md border border-[#ccc] text-sm box-border"
          />
          <button
            type="submit"
            disabled={loading}
            className={`border-none py-2.5 px-5 rounded-lg font-bold text-sm text-white transition-transform duration-150 ${
              loading ? 'bg-[#ccc] cursor-not-allowed' : 'bg-[#2c7be5] cursor-pointer hover:scale-105'
            }`}
          >
            {loading ? 'Söker...' : 'Sök'}
          </button>
        </form>

        {total > 0 && (
          <p className="mt-2.5 mb-0 text-sm text-[#777]">
            {total.toLocaleString()} jobb hittade
          </p>
        )}
      </section>

      {error && (
        <div className="bg-white px-5 py-[15px] rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] mb-5 text-[#e74c3c]">
          {error}
        </div>
      )}

      {/* Resultatlista */}
      <div className="grid gap-4">
        {results.map((hit) => (
          <div key={hit.id}>
            {/* Kort */}
            <div
              onClick={() => handleExpand(hit.id)}
              className={`bg-white p-5 rounded-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200 ${
                expandedId === hit.id ? 'ring-2 ring-[#2c7be5]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="m-0 mb-1 text-lg">{hit.headline}</h3>
                  <p className="m-0 text-[#2c7be5] font-semibold text-sm">
                    {hit.employer?.name || 'Okänt företag'}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#777]">
                    {hit.workplace_address?.municipality && (
                      <span>{hit.workplace_address.municipality}</span>
                    )}
                    {hit.employment_type?.label && (
                      <span>{hit.employment_type.label}</span>
                    )}
                    {hit.working_hours_type?.label && (
                      <span>{hit.working_hours_type.label}</span>
                    )}
                    {hit.publication_date && (
                      <span>Publicerad: {formatDate(hit.publication_date)}</span>
                    )}
                  </div>
                </div>
                {savedIds.has(hit.id) && (
                  <span className="text-xs font-bold text-[#27ae60] whitespace-nowrap ml-2">
                    Sparad
                  </span>
                )}
              </div>

              {hit.description?.text && (
                <p className="mt-2.5 mb-0 text-sm text-[#666] leading-relaxed">
                  {hit.description.text.slice(0, 200)}...
                </p>
              )}

              {hit.last_publication_date && (
                <p className="mt-2 mb-0 text-xs text-[#f39c12] font-semibold">
                  Sista ansökningsdag: {formatDate(hit.last_publication_date)}
                </p>
              )}
            </div>

            {/* Expanderad vy */}
            {expandedId === hit.id && (
              <div className="bg-white p-6 rounded-b-xl shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-t border-[#eee] -mt-1">
                {loadingAd ? (
                  <p className="text-[#777]">Laddar annons...</p>
                ) : expandedAd ? (
                  <>
                    {/* Full beskrivning */}
                    <div className="mb-5">
                      <h4 className="mt-0 mb-2 text-[#2c3e50]">Beskrivning</h4>
                      <p className="text-sm text-[#666] leading-relaxed whitespace-pre-line">
                        {expandedAd.description?.text || 'Ingen beskrivning tillgänglig.'}
                      </p>
                    </div>

                    {/* Krav - must have */}
                    {expandedAd.must_have?.skills?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mt-0 mb-2 text-[#2c3e50]">Krav</h4>
                        <div className="flex flex-wrap gap-2">
                          {expandedAd.must_have.skills.map((s, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-[#2c7be5] text-white rounded-full text-xs font-medium"
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meriterande - nice to have */}
                    {expandedAd.nice_to_have?.skills?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mt-0 mb-2 text-[#2c3e50]">Meriterande</h4>
                        <div className="flex flex-wrap gap-2">
                          {expandedAd.nice_to_have.skills.map((s, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-[#f39c12] text-white rounded-full text-xs font-medium"
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kontaktinfo */}
                    {expandedAd.application_details?.email && (
                      <p className="text-sm text-[#666] mb-4">
                        <strong>Kontakt:</strong> {expandedAd.application_details.email}
                      </p>
                    )}

                    {/* Ansökningslänk */}
                    {expandedAd.application_details?.url && (
                      <a
                        href={expandedAd.application_details.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mb-5 text-[#2c7be5] font-semibold text-sm hover:underline"
                      >
                        Öppna ansökningslänk &rarr;
                      </a>
                    )}

                    {/* Åtgärdsknappar */}
                    <div className="flex flex-wrap gap-2.5 pt-4 border-t border-[#eee]">
                      {!savedIds.has(hit.id) ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(hit); }}
                          disabled={savingId === hit.id}
                          className={`border-none py-2 px-4 rounded-lg font-bold text-sm text-white transition-transform duration-150 ${
                            savingId === hit.id
                              ? 'bg-[#ccc] cursor-not-allowed'
                              : 'bg-[#27ae60] cursor-pointer hover:scale-105'
                          }`}
                        >
                          {savingId === hit.id ? 'Sparar...' : 'Spara som ansökan'}
                        </button>
                      ) : (
                        <span className="py-2 px-4 text-[#27ae60] font-bold text-sm">
                          Sparad! <Link to="/" className="text-[#2c7be5] ml-1">Visa i Översikt</Link>
                        </span>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenReminder(hit); }}
                        className="bg-[#2c7be5] text-white border-none py-2 px-4 rounded-lg font-bold text-sm cursor-pointer hover:scale-105 transition-transform duration-150"
                      >
                        Skapa påminnelse
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleMatch(hit.id); }}
                        disabled={matchingId === hit.id}
                        className={`border-none py-2 px-4 rounded-lg font-bold text-sm text-white transition-transform duration-150 ${
                          matchingId === hit.id
                            ? 'bg-[#ccc] cursor-not-allowed'
                            : 'bg-[#8e44ad] cursor-pointer hover:scale-105'
                        }`}
                      >
                        {matchingId === hit.id ? 'Matchar...' : 'Matcha mot mitt CV'}
                      </button>
                    </div>

                    {/* Spara-meddelande */}
                    {saveMessage?.id === hit.id && (
                      <p className={`mt-2.5 mb-0 text-sm font-semibold ${
                        saveMessage.type === 'success' ? 'text-[#27ae60]' : 'text-[#e74c3c]'
                      }`}>
                        {saveMessage.text}
                      </p>
                    )}

                    {/* Påminnelse-formulär */}
                    {showReminderForm === hit.id && (
                      <form
                        onSubmit={handleSaveReminder}
                        className="mt-4 p-4 bg-[#f4f6f8] rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4 className="mt-0 mb-2.5 text-[#2c3e50]">Ny påminnelse</h4>
                        <input
                          type="text"
                          value={reminderData.title}
                          onChange={(e) => setReminderData({ ...reminderData, title: e.target.value })}
                          required
                          placeholder="Titel"
                          className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border"
                        />
                        <input
                          type="datetime-local"
                          value={reminderData.remind_date}
                          onChange={(e) => setReminderData({ ...reminderData, remind_date: e.target.value })}
                          required
                          className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border"
                        />
                        <textarea
                          value={reminderData.description}
                          onChange={(e) => setReminderData({ ...reminderData, description: e.target.value })}
                          placeholder="Beskrivning (valfritt)"
                          rows="2"
                          className="w-full p-2.5 mb-2.5 rounded-md border border-[#ccc] text-sm box-border font-[inherit]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-[#2c7be5] text-white border-none py-2 px-4 rounded-lg font-bold text-sm cursor-pointer hover:scale-105 transition-transform duration-150"
                          >
                            Spara påminnelse
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReminderForm(null)}
                            className="bg-[#ccc] text-[#333] border-none py-2 px-4 rounded-lg font-bold text-sm cursor-pointer hover:scale-105 transition-transform duration-150"
                          >
                            Avbryt
                          </button>
                        </div>
                      </form>
                    )}

                    {reminderMessage && showReminderForm === null && (
                      <p className={`mt-2.5 mb-0 text-sm font-semibold ${
                        reminderMessage.type === 'success' ? 'text-[#27ae60]' : 'text-[#e74c3c]'
                      }`}>
                        {reminderMessage.text}
                      </p>
                    )}

                    {/* CV-matchning resultat */}
                    {matchResult && expandedId === hit.id && (
                      <div className="mt-4 p-4 bg-[#f4f6f8] rounded-lg">
                        <div className="flex items-center gap-4 mb-3">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: getMatchColor(matchResult.match_percentage) }}
                          >
                            {matchResult.match_percentage}%
                          </div>
                          <div>
                            <h4 className="m-0 text-[#2c3e50]">CV-matchning</h4>
                            <p className="m-0 text-sm text-[#777]">
                              {matchResult.matched_skills.length} av {matchResult.matched_skills.length + matchResult.missing_skills.length} färdigheter matchar
                            </p>
                          </div>
                        </div>

                        {matchResult.message && (
                          <p className="text-sm text-[#777] mb-2">{matchResult.message}</p>
                        )}

                        {matchResult.matched_skills.length > 0 && (
                          <div className="mb-2.5">
                            <p className="text-sm font-semibold text-[#2c3e50] mb-1.5">Matchade färdigheter:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {matchResult.matched_skills.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-[#27ae60] text-white rounded-full text-xs font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {matchResult.missing_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-[#2c3e50] mb-1.5">Saknade färdigheter:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {matchResult.missing_skills.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-[#e74c3c] text-white rounded-full text-xs font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {matchError && expandedId === hit.id && (
                      <p className="mt-2.5 mb-0 text-sm text-[#e74c3c] font-semibold">
                        {matchError}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[#e74c3c]">Kunde inte ladda annonsdetaljer.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {results.length > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => handleSearch(Math.max(0, offset - LIMIT))}
            disabled={offset === 0}
            className={`border-none py-2.5 px-5 rounded-lg font-bold text-sm transition-transform duration-150 ${
              offset === 0
                ? 'bg-[#ccc] text-[#999] cursor-not-allowed'
                : 'bg-[#2c7be5] text-white cursor-pointer hover:scale-105'
            }`}
          >
            Föregående
          </button>
          <span className="py-2.5 text-sm text-[#777]">
            Visar {offset + 1}–{Math.min(offset + LIMIT, total)} av {total.toLocaleString()}
          </span>
          <button
            onClick={() => handleSearch(offset + LIMIT)}
            disabled={offset + LIMIT >= total}
            className={`border-none py-2.5 px-5 rounded-lg font-bold text-sm transition-transform duration-150 ${
              offset + LIMIT >= total
                ? 'bg-[#ccc] text-[#999] cursor-not-allowed'
                : 'bg-[#2c7be5] text-white cursor-pointer hover:scale-105'
            }`}
          >
            Nästa
          </button>
        </div>
      )}
    </div>
  );
}

export default JobSearch;
