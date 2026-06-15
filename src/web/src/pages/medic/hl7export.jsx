import "./hl7export.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPatients,
  getConsultations,
  getAllergiesByPatient,
  getRecommendationsByPatient,
  getAlerts,
  logoutUser,
} from "../../api";
import { FhirXmlBuilder } from "../../utils/fhirXmlBuilder";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};

const calcAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

function Hl7Export() {

  const [patients, setPatients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [xml, setXml] = useState("");
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message || "Nu s-au putut încărca pacienții de pe server.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return patients.filter((p) => {
      const d = p.demographics || {};
      return (
        d.nume?.toLowerCase().includes(search) ||
        d.prenume?.toLowerCase().includes(search) ||
        d.cnp?.includes(search)
      );
    });
  }, [patients, searchTerm]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allFilteredSelected =
    filteredPatients.length > 0 &&
    filteredPatients.every((p) => selectedSet.has(p.id));

  const togglePatient = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredPatients.map((p) => p.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      setSelectedIds((prev) => {
        const merged = new Set(prev);
        filteredPatients.forEach((p) => merged.add(p.id));
        return [...merged];
      });
    }
  };

  const selectedPatients = useMemo(
    () => patients.filter((p) => selectedSet.has(p.id)),
    [patients, selectedSet]
  );

  const handleGenerate = async () => {
    setCopied(false);
    if (selectedPatients.length === 0) {
      setXml("");
      setGeneratedAt(null);
      setError("Selectează cel puțin un pacient pentru export.");
      return;
    }

    setError("");
    setGenerating(true);
    try {
      const allVisits = await getConsultations().catch(() => []);

      const records = await Promise.all(
        selectedPatients.map(async (p) => {
          const [allergies, recommendations, alerts] = await Promise.all([
            getAllergiesByPatient(p.id).catch(() => []),
            getRecommendationsByPatient(p.id).catch(() => []),
            getAlerts(p.id).catch(() => []),
          ]);

          const visits = (allVisits || []).filter((v) => v.patientId === p.id);

          return { patient: p, visits, allergies, recommendations, alerts };
        })
      );

      const builder = new FhirXmlBuilder(records);
      setXml(builder.toXmlString());
      setGeneratedAt(new Date());
    } catch (err) {
      setError(err.message || "Nu s-a putut genera exportul FHIR.");
      setXml("");
      setGeneratedAt(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: "application/fhir+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pacienti-fhir-r4-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Nu s-a putut copia în clipboard.");
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">SW</div>
          <div>
            <h2>SeniorWatch</h2>
            <p>Medical dashboard</p>
          </div>
        </div>

<nav>
  <a href="/medic">📊 Dashboard</a>
  <a href="/medic/pacienti">👥 Pacienți</a>
  <a href="/medic/consultatii">🩺 Consultații</a>
  <a href="/medic/monitorizare">📈 Monitorizare</a>
  <a href="/medic/alerte">🔔 Alerte</a>
  <a href="/medic/rapoarte">📋 Rapoarte</a>
  <a href="/medic/hl7" className="active">🔗 HL7 FHIR</a>
</nav>
        <button className="logoutBtn" onClick={handleLogout}>
  Logout
</button>
        <div className="profile">
          <div>AP</div>
          <span>
            <b>Dr. Andrei Popescu</b>
            Medic specialist
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="stats">
          <div className="stat">
            <div className="icon purple">🔗</div>
            <div>
              <p>Standard</p>
              <h2>FHIR R4</h2>
              <span>HL7 FHIR Release 4 (XML)</span>
            </div>
          </div>
          <div className="stat">
            <div className="icon green">👥</div>
            <div>
              <p>Pacienți selectați</p>
              <h2>{loading ? "…" : selectedIds.length}</h2>
              <span>din {patients.length} pacienți</span>
            </div>
          </div>
          <div className="stat">
            <div className="icon violet">🕒</div>
            <div>
              <p>Generat la</p>
              <h2>{generatedAt ? generatedAt.toLocaleTimeString("ro-RO") : "—"}</h2>
              <span>{generatedAt ? generatedAt.toLocaleDateString("ro-RO") : "în așteptare"}</span>
            </div>
          </div>
        </section>

        <section className="content hl7-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Export pacienți — HL7 FHIR R4</h1>
                <p className="hl7-subtitle">
                  Include date demografice, consultații, diagnostice, alergii,
                  recomandări, alerte și ultimele măsurători.
                </p>
              </div>
              <div className="hl7-tools">
                <div className="patients-search">
                  <span>⌕</span>
                  <input
                    type="text"
                    placeholder="Caută după nume, prenume sau CNP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="hl7-btn regen"
                  type="button"
                  onClick={loadPatients}
                  disabled={loading}
                >
                  ↻ Reîncarcă
                </button>
                <button
                  className="hl7-btn download"
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || generating || selectedIds.length === 0}
                >
                  {generating ? "Se generează…" : "⚙ Generează XML"}
                </button>
              </div>
            </div>

            {loading && (
              <div className="hl7-status">Se încarcă pacienții de pe server…</div>
            )}

            {!loading && error && (
              <div className="hl7-status hl7-error">
                <b>Eroare:</b> {error}
              </div>
            )}

            {!loading && !error && patients.length === 0 && (
              <div className="hl7-status">Niciun pacient înregistrat.</div>
            )}

            {!loading && patients.length > 0 && (
              <div className="hl7-table">
                <div className="hl7-row hl7-header">
                  <span className="hl7-check">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      aria-label="Selectează toți pacienții"
                    />
                  </span>
                  <span>Pacient</span>
                  <span>CNP</span>
                  <span>Vârstă</span>
                  <span>Sex</span>
                </div>

                {filteredPatients.length === 0 && (
                  <div className="hl7-row">
                    <span />
                    <span>Niciun pacient găsit pentru căutarea curentă.</span>
                  </div>
                )}

                {filteredPatients.map((p) => {
                  const d = p.demographics || {};
                  const fullName = [d.nume, d.prenume].filter(Boolean).join(" ");
                  const initials =
                    `${(d.nume || "")[0] || ""}${(d.prenume || "")[0] || ""}`.toUpperCase() ||
                    "?";
                  const age = d.dataNasterii ? `${calcAge(d.dataNasterii)} ani` : "—";
                  const checked = selectedSet.has(p.id);

                  return (
                    <label
                      className={`hl7-row${checked ? " selected" : ""}`}
                      key={p.id}
                    >
                      <span className="hl7-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePatient(p.id)}
                        />
                      </span>
                      <span className="patientName">
                        <b>{initials}</b>
                        {fullName || "—"}
                      </span>
                      <span className="cnpText">{d.cnp || "—"}</span>
                      <span>{age}</span>
                      <span>{d.sex || "—"}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {!loading && xml && (
              <div className="hl7-previewBlock">
                <div className="hl7-previewHead">
                  <h2>Previzualizare FHIR Bundle ({selectedPatients.length})</h2>
                  <div className="hl7-tools">
                    <button
                      className="hl7-btn copy"
                      type="button"
                      onClick={handleCopy}
                      disabled={!xml}
                    >
                      {copied ? "✓ Copiat" : "Copiază XML"}
                    </button>
                    <button
                      className="hl7-btn download"
                      type="button"
                      onClick={handleDownload}
                      disabled={!xml}
                    >
                      ⬇ Descarcă .xml
                    </button>
                  </div>
                </div>
                <pre className="hl7-xml-preview">
                  <code>{xml}</code>
                </pre>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Hl7Export;
