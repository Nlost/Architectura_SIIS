import "./hl7export.css";
import { useCallback, useEffect, useState } from "react";
import { getPatients } from "../../api";
import { FhirXmlBuilder } from "../../utils/fhirXmlBuilder";
import { logoutUser } from "../../api";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};
function Hl7Export() {

  const [patients, setPatients] = useState([]);
  const [xml, setXml] = useState("");
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadAndBuild = useCallback(async () => {
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const data = await getPatients();
      const builder = new FhirXmlBuilder(data);
      setPatients(data);
      setXml(builder.toXmlString());
      setGeneratedAt(new Date());
    } catch (err) {
      setError(err.message || "Nu s-au putut încărca pacienții de pe server.");
      setPatients([]);
      setXml("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndBuild();
  }, [loadAndBuild]);

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
              <p>Pacienți exportați</p>
              <h2>{loading ? "…" : patients.length}</h2>
              <span>resurse Patient în Bundle</span>
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
              </div>
              <div className="hl7-tools">
                <button
                  className="hl7-btn regen"
                  type="button"
                  onClick={loadAndBuild}
                  disabled={loading}
                >
                  ↻ Regenerează
                </button>
                <button
                  className="hl7-btn copy"
                  type="button"
                  onClick={handleCopy}
                  disabled={loading || !xml}
                >
                  {copied ? "✓ Copiat" : "Copiază XML"}
                </button>
                <button
                  className="hl7-btn download"
                  type="button"
                  onClick={handleDownload}
                  disabled={loading || !xml}
                >
                  ⬇ Descarcă .xml
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

            {!loading && !error && (
              <pre className="hl7-xml-preview">
                <code>{xml}</code>
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Hl7Export;
