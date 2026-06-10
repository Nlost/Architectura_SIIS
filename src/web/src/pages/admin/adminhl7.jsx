import "./adminhl7.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "../../api";
import { FhirXmlBuilder } from "../../utils/fhirXmlBuilder";

function AdminHl7() {
  const navigate = useNavigate();

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
    <div className="ahl7-app">
      <aside className="ahl7-sidebar">
        <div className="ahl7-brand">
          <div className="ahl7-logo">SW</div>
          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>
            📊 Dashboard
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminutilizatori"); }}>
            👥 Utilizatori
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminroluri"); }}>
            🛡️ Roluri
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminaudit"); }}>
            📝 Audit
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminstatus"); }}>
            🟢 Status sistem
          </a>
          <a href="#" className="active" onClick={(e) => e.preventDefault()}>
            🔗 HL7 FHIR
          </a>
        </nav>

        <div className="ahl7-profile">
          <div>A</div>
          <span>
            <b>Administrator</b>
            {localStorage.getItem("sw_email") || "admin@seniorwatch.com"}
          </span>
        </div>
      </aside>

      <main className="ahl7-main">
        <section className="ahl7-hero">
          <div>
            <p>INTEROPERABILITATE</p>
            <h1>Export pacienți — HL7 FHIR R4</h1>
            <span>Toți pacienții activi din sistem, ca Bundle FHIR R4 (XML)</span>
          </div>
          <div className="ahl7-heroBtns">
            <button
              className="ahl7-btn regen"
              type="button"
              onClick={loadAndBuild}
              disabled={loading}
            >
              ↻ Regenerează
            </button>
            <button
              className="ahl7-btn copy"
              type="button"
              onClick={handleCopy}
              disabled={loading || !xml}
            >
              {copied ? "✓ Copiat" : "Copiază XML"}
            </button>
            <button
              className="ahl7-btn download"
              type="button"
              onClick={handleDownload}
              disabled={loading || !xml}
            >
              ⬇ Descarcă .xml
            </button>
          </div>
        </section>

        <section className="ahl7-stats">
          <div className="ahl7-stat">
            <div className="ahl7-statIcon purple">🔗</div>
            <div>
              <p>Standard</p>
              <h2>FHIR R4</h2>
              <span>HL7 FHIR Release 4 (XML)</span>
            </div>
          </div>
          <div className="ahl7-stat">
            <div className="ahl7-statIcon green">👥</div>
            <div>
              <p>Pacienți exportați</p>
              <h2>{loading ? "…" : patients.length}</h2>
              <span>resurse Patient în Bundle</span>
            </div>
          </div>
          <div className="ahl7-stat">
            <div className="ahl7-statIcon violet">🕒</div>
            <div>
              <p>Generat la</p>
              <h2>{generatedAt ? generatedAt.toLocaleTimeString("ro-RO") : "—"}</h2>
              <span>{generatedAt ? generatedAt.toLocaleDateString("ro-RO") : "în așteptare"}</span>
            </div>
          </div>
        </section>

        <section className="ahl7-panel">
          {loading && (
            <div className="ahl7-status">Se încarcă pacienții de pe server…</div>
          )}

          {!loading && error && (
            <div className="ahl7-status ahl7-error">
              <b>Eroare:</b> {error}
            </div>
          )}

          {!loading && !error && (
            <pre className="ahl7-xml-preview">
              <code>{xml}</code>
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminHl7;
