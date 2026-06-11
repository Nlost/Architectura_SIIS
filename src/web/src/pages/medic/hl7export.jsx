import "./hl7export.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "../../api";
import { FhirXmlBuilder } from "../../utils/fhirXmlBuilder";

function Hl7Export() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState("all");
  const [xml, setXml] = useState("");
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPatients();
      setPatients(data);
      setSelectedId((prev) =>
        prev === "all" || data.some((p) => p.id === prev) ? prev : "all"
      );
    } catch (err) {
      setError(err.message || "Nu s-au putut încărca pacienții de pe server.");
      setPatients([]);
      setXml("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const selectedPatients =
    selectedId === "all" ? patients : patients.filter((p) => p.id === selectedId);

  useEffect(() => {
    if (loading || error) return;
    const builder = new FhirXmlBuilder(
      selectedId === "all" ? patients : patients.filter((p) => p.id === selectedId)
    );
    setXml(builder.toXmlString());
    setGeneratedAt(new Date());
    setCopied(false);
  }, [loading, error, patients, selectedId]);

  const patientLabel = (p) => {
    const d = p.demographics || {};
    const name = [d.nume, d.prenume].filter(Boolean).join(" ") || p.id;
    return d.cnp ? `${name} — ${d.cnp}` : name;
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: "application/fhir+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const single = selectedId !== "all" && selectedPatients[0];
    const slug = single
      ? [single.demographics?.nume, single.demographics?.prenume]
          .filter(Boolean)
          .join("-")
          .toLowerCase() || single.id
      : "pacienti";
    link.download = `${slug}-fhir-r4-${new Date().toISOString().slice(0, 10)}.xml`;
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
              <p>Pacienți exportați</p>
              <h2>{loading ? "…" : selectedPatients.length}</h2>
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
                <select
                  className="hl7-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={loading || patients.length === 0}
                >
                  <option value="all">Toți pacienții ({patients.length})</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {patientLabel(p)}
                    </option>
                  ))}
                </select>
                <button
                  className="hl7-btn regen"
                  type="button"
                  onClick={loadPatients}
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
