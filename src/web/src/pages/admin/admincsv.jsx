import "./admincsv.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients, logReportExport, logoutUser } from "../../api";
import { PatientCsvBuilder } from "../../utils/patientCsvBuilder";

const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};

function AdminCsv() {
  const navigate = useNavigate();

  const [csv, setCsv] = useState("");
  const [exportCount, setExportCount] = useState(0);
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
      const builder = new PatientCsvBuilder(data);
      const rows = builder.getExportRows();

      setCsv(builder.toCsvString());
      setExportCount(rows.length);
      setGeneratedAt(new Date());
    } catch (err) {
      setError(err.message || "Nu s-au putut încărca pacienții de pe server.");
      setCsv("");
      setExportCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndBuild();
  }, [loadAndBuild]);

  const handleDownload = async () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Pacienti-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      await logReportExport();
    } catch {
      // exportul a reușit; auditul e secundar
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Nu s-a putut copia în clipboard.");
    }
  };

  return (
    <div className="acsv-app">
      <aside className="acsv-sidebar">
        <div className="acsv-brand">
          <div className="acsv-logo">SW</div>
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
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminhl7"); }}>
            🔗 HL7 FHIR
          </a>
          <a href="#" className="active" onClick={(e) => e.preventDefault()}>
            📁 Export CSV
          </a>
        </nav>

        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>

        <div className="acsv-profile">
          <div>A</div>
          <span>
            <b>Administrator</b>
            {localStorage.getItem("sw_email") || "admin@seniorwatch.com"}
          </span>
        </div>
      </aside>

      <main className="acsv-main">
        <section className="acsv-hero">
          <div>
            <p>CLASIFICARE</p>
            <h1>Export pacienți — CSV</h1>
            <span>
              Date de antrenare în format Iris: Puls, SpO2, Temperatură, Umiditate, StareSanatate
            </span>
          </div>
          <div className="acsv-heroBtns">
            <button
              className="acsv-btn regen"
              type="button"
              onClick={loadAndBuild}
              disabled={loading}
            >
              ↻ Regenerează
            </button>
            <button
              className="acsv-btn copy"
              type="button"
              onClick={handleCopy}
              disabled={loading || !csv}
            >
              {copied ? "✓ Copiat" : "Copiază CSV"}
            </button>
            <button
              className="acsv-btn download"
              type="button"
              onClick={handleDownload}
              disabled={loading || !csv}
            >
              ⬇ Descarcă Pacienti.csv
            </button>
          </div>
        </section>

        <section className="acsv-stats">
          <div className="acsv-stat">
            <div className="acsv-statIcon purple">📁</div>
            <div>
              <p>Format</p>
              <h2>CSV</h2>
              <span>compatibil cu tutorial-pacienti-exemplu.py</span>
            </div>
          </div>
          <div className="acsv-stat">
            <div className="acsv-statIcon green">👥</div>
            <div>
              <p>Rânduri exportate</p>
              <h2>{loading ? "…" : exportCount}</h2>
              <span>valori lipsă exportate ca 0</span>
            </div>
          </div>
          <div className="acsv-stat">
            <div className="acsv-statIcon violet">🕒</div>
            <div>
              <p>Generat la</p>
              <h2>{generatedAt ? generatedAt.toLocaleTimeString("ro-RO") : "—"}</h2>
              <span>{generatedAt ? generatedAt.toLocaleDateString("ro-RO") : "în așteptare"}</span>
            </div>
          </div>
        </section>

        <section className="acsv-panel">
          {loading && (
            <div className="acsv-status">Se încarcă pacienții de pe server…</div>
          )}

          {!loading && error && (
            <div className="acsv-status acsv-error">
              <b>Eroare:</b> {error}
            </div>
          )}

          {!loading && !error && exportCount === 0 && (
            <div className="acsv-status acsv-warn">
              Nu există pacienți în sistem pentru export.
            </div>
          )}

          {!loading && !error && csv && (
            <pre className="acsv-preview">
              <code>{csv}</code>
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminCsv;
