import "./hl7export.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "../../api";
import { FhirXmlBuilder } from "../../utils/fhirXmlBuilder";

function Hl7Export() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    setPreview(null);
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

  const calcAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const buildXmlFor = (list) => new FhirXmlBuilder(list).toXmlString();

  const patientSlug = (p) => {
    const d = p.demographics || {};
    return (
      [d.nume, d.prenume].filter(Boolean).join("-").toLowerCase() || p.id
    );
  };

  const downloadXml = (xmlString, slug) => {
    const blob = new Blob([xmlString], { type: "application/fhir+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-fhir-r4-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPatient = (p) => {
    downloadXml(buildXmlFor([p]), patientSlug(p));
  };

  const handlePreviewPatient = (p) => {
    setPreview({ patient: p, xml: buildXmlFor([p]), at: new Date() });
    setCopied(false);
  };

  const handleExportAll = () => {
    downloadXml(buildXmlFor(patients), "pacienti");
  };

  const handleCopy = async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Nu s-a putut copia în clipboard.");
    }
  };

  const previewName = preview
    ? [preview.patient.demographics?.nume, preview.patient.demographics?.prenume]
        .filter(Boolean)
        .join(" ") || preview.patient.id
    : "";

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
          <a onClick={() => navigate("/medic")}>📊 Dashboard</a>
          <a onClick={() => navigate("/medic/pacienti")}>👥 Pacienți</a>
          <a onClick={() => navigate("/medic/consultatii")}>🩺 Consultații</a>
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
          <a onClick={() => navigate("/medic/alerte")}>🔔 Alerte</a>
          <a onClick={() => navigate("/medic/rapoarte")}>📋 Rapoarte</a>
          <a className="active">🔗 HL7 FHIR</a>
        </nav>

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
              <p>Pacienți disponibili</p>
              <h2>{loading ? "…" : patients.length}</h2>
              <span>asociați medicului curent</span>
            </div>
          </div>
          <div className="stat">
            <div className="icon violet">🕒</div>
            <div>
              <p>Ultimul raport</p>
              <h2>{preview ? preview.at.toLocaleTimeString("ro-RO") : "—"}</h2>
              <span>{preview ? previewName : "niciun raport generat"}</span>
            </div>
          </div>
        </section>

        <section className="content hl7-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Export pacienți — HL7 FHIR R4</h1>
              </div>
              <div className="hl7-tools">
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
                  onClick={handleExportAll}
                  disabled={loading || patients.length === 0}
                >
                  ⬇ Exportă toți ({patients.length})
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
              <div className="hl7-status">
                Niciun pacient disponibil pentru acest medic.
              </div>
            )}

            {!loading && !error && patients.length > 0 && (
              <div className="table">
                <div className="tableRow tableHeader hl7-row">
                  <span>Pacient</span>
                  <span>CNP</span>
                  <span>Vârstă</span>
                  <span>Telefon</span>
                  <span>Acțiuni</span>
                </div>
                {patients.map((p) => {
                  const d = p.demographics || {};
                  const fullName = [d.nume, d.prenume].filter(Boolean).join(" ");
                  const initials =
                    `${(d.nume || "")[0] || ""}${(d.prenume || "")[0] || ""}`.toUpperCase() || "?";
                  const age = d.dataNasterii ? `${calcAge(d.dataNasterii)} ani` : "—";
                  return (
                    <div className="tableRow hl7-row" key={p.id}>
                      <span className="patientName">
                        <b>{initials}</b>
                        {fullName || "—"}
                      </span>
                      <span className="cnpText">{d.cnp || "—"}</span>
                      <span>{age}</span>
                      <span>{d.telefon || "—"}</span>
                      <span className="hl7-rowActions">
                        <button
                          className="hl7-rowBtn view"
                          type="button"
                          onClick={() => handlePreviewPatient(p)}
                        >
                          Vezi XML
                        </button>
                        <button
                          className="hl7-rowBtn export"
                          type="button"
                          onClick={() => handleExportPatient(p)}
                        >
                          ⬇ Export HL7
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !error && preview && (
              <div className="hl7-previewBlock">
                <div className="hl7-previewHead">
                  <h2>Raport HL7 FHIR R4 — {previewName}</h2>
                  <div className="hl7-tools">
                    <button className="hl7-btn copy" type="button" onClick={handleCopy}>
                      {copied ? "✓ Copiat" : "Copiază XML"}
                    </button>
                    <button
                      className="hl7-btn download"
                      type="button"
                      onClick={() => handleExportPatient(preview.patient)}
                    >
                      ⬇ Descarcă .xml
                    </button>
                    <button
                      className="hl7-btn regen"
                      type="button"
                      onClick={() => setPreview(null)}
                    >
                      × Închide
                    </button>
                  </div>
                </div>
                <pre className="hl7-xml-preview">
                  <code>{preview.xml}</code>
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
