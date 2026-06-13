import "./pacientfisa.css";
import { useEffect, useState } from "react";
import { getPatientMe, getRecommendationsByPatient } from "../../api";

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const calculateAge = (birthDate) => {
  if (!birthDate) return "-";

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return "-";

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return `${age} ani`;
};

function PacientFisa() {
  const [patient, setPatient] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState("fisa");

  useEffect(() => {
    const loadData = async () => {
      try {
        const patientData = await getPatientMe();
        setPatient(patientData);

        if (patientData?.id) {
          const recs = await getRecommendationsByPatient(patientData.id);
          setRecommendations(recs);
        }
      } catch (error) {
        console.log("Eroare fișă pacient:", error);
      }
    };

    loadData();
  }, []);

  const d = patient?.demographics || {};
  const sample = patient?.latestSample || {};

  const fullName = [d.prenume, d.nume].filter(Boolean).join(" ") || "Pacient";

  const initials =
    `${(d.prenume || "")[0] || ""}${(d.nume || "")[0] || ""}`.toUpperCase() ||
    "P";

  const age = calculateAge(d.dataNasterii);

  const address =
    [d.strada, d.localitate, d.judet, d.tara].filter(Boolean).join(", ") || "-";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Pacient Panel</p>
          </div>
        </div>

        <nav>
          <a href="/pacient">📊 Dashboard</a>
          <a href="/pacient/pacientfisa" className="active">
            📄 Fișa mea
          </a>
          <a href="/pacient/pacientvalori">📈 Valori senzori</a>
          <a href="/pacient/pacientrecomandari">🩺 Recomandări</a>
          <a href="/pacient/pacientalerte">🚨 Alerte</a>
        </nav>

        <div className="profile">
          <div>{initials}</div>
          <span>
            <b>{fullName}</b>
            Pacient
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="pacient-fisa-wrapper">
          <div className="pacient-fisa-top-card">
            <div className="pacient-fisa-avatar">{initials}</div>

            <div className="pacient-fisa-title">
              <p>FIȘĂ PACIENT</p>
              <h1>{fullName}</h1>
              <span>
                ▫ CNP: {d.cnp || "-"} · ☎ Telefon: {d.telefon || "-"} · 🎂{" "}
                {age}
              </span>
            </div>
          </div>

          <div className="pacient-tabs">
            <button
              className={activeTab === "fisa" ? "active" : ""}
              onClick={() => setActiveTab("fisa")}
            >
              Fișă medicală
            </button>

            <button
              className={activeTab === "istoric" ? "active" : ""}
              onClick={() => setActiveTab("istoric")}
            >
              Istoric consultații
            </button>
          </div>

          {activeTab === "fisa" && (
            <div className="pacient-tab-content">
              <div className="pacient-fisa-section">
                <h2>Date generale</h2>

                <div className="pacient-fisa-grid">
                  <label>
                    Nume
                    <input value={d.nume || "-"} readOnly />
                  </label>

                  <label>
                    Prenume
                    <input value={d.prenume || "-"} readOnly />
                  </label>

                  <label>
                    Sex
                    <input value={d.sex || "-"} readOnly />
                  </label>

                  <label>
                    Vârstă
                    <input value={age} readOnly />
                  </label>

                  <label>
                    Telefon
                    <input value={d.telefon || "-"} readOnly />
                  </label>

                  <label>
                    Email
                    <input value={d.email || "-"} readOnly />
                  </label>

                  <label>
                    Data nașterii
                    <input value={formatDate(d.dataNasterii)} readOnly />
                  </label>

                  <label>
                    CNP
                    <input value={d.cnp || "-"} readOnly />
                  </label>

                  <label className="wide">
                    Adresă
                    <input value={address} readOnly />
                  </label>

                  <label>
                    Profesie
                    <input value={d.profesie || "-"} readOnly />
                  </label>

                  <label>
                    Loc de muncă
                    <input value={d.locDeMunca || "-"} readOnly />
                  </label>
                </div>
              </div>

              <div className="pacient-fisa-section">
                <h2>Date clinice</h2>

                <div className="pacient-fisa-grid">
                  <label>
                    Puls
                    <input
                      value={sample?.puls ? `${sample.puls} bpm` : "-"}
                      readOnly
                    />
                  </label>

                  <label>
                    Temperatură
                    <input
                      value={
                        sample?.temperatura ? `${sample.temperatura}°C` : "-"
                      }
                      readOnly
                    />
                  </label>

                  <label>
                    Umiditate
                    <input
                      value={sample?.umiditate ? `${sample.umiditate}%` : "-"}
                      readOnly
                    />
                  </label>

                  <label>
                    Ultima măsurătoare
                    <input value={formatDate(sample?.ts)} readOnly />
                  </label>

                  <label className="wide">
                    Tratament / Recomandări
                    <textarea
                      value={
                        recommendations.length > 0
                          ? recommendations
                              .map(
                                (r) =>
                                  `${r.tipActivitate || "Recomandare"} - ${
                                    r.alteIndicatii ||
                                    "fără indicații suplimentare"
                                  }`
                              )
                              .join("\n")
                          : "Nu există tratament sau recomandări active."
                      }
                      readOnly
                    />
                  </label>
                </div>
              </div>

              <div className="pacient-fisa-section">
                <h2>Recomandări medicale</h2>

                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div className="pacient-fisa-grid recomandare-grid" key={rec.id}>
                      <label>
                        Tip recomandare
                        <input
                          value={rec.tipActivitate || "Recomandare medicală"}
                          readOnly
                        />
                      </label>

                      <label>
                        Data
                        <input
                          value={formatDate(rec.createdAt || rec.recordedAt)}
                          readOnly
                        />
                      </label>

                      <label>
                        Durată
                        <input
                          value={
                            rec.durataZilnicaMinute
                              ? `${rec.durataZilnicaMinute} minute / zi`
                              : "Durată nespecificată"
                          }
                          readOnly
                        />
                      </label>

                      <label className="wide">
                        Indicații
                        <textarea
                          value={
                            rec.alteIndicatii || "Fără indicații suplimentare."
                          }
                          readOnly
                        />
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="pacient-fisa-grid">
                    <label className="wide">
                      Recomandări
                      <textarea
                        value="Nu există recomandări medicale. Recomandările vor apărea aici după consultație."
                        readOnly
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "istoric" && (
            <div className="pacient-tab-content">
              <div className="pacient-fisa-section">
                <h2>Istoric consultații</h2>

                <div className="istoric-empty">
                  <h3>Istoricul consultațiilor nu este disponibil momentan</h3>
                  <p>
                    Pentru afișarea consultațiilor pacientului este nevoie de un
                    endpoint separat în backend pentru rolul PATIENT.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PacientFisa;