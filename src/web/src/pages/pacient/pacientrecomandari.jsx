import "./pacientrecomandari.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function PacientRecomandari() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm] = useState("");

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
        console.log("Eroare recomandări pacient:", error);
      }
    };

    loadData();
  }, []);

  const d = patient?.demographics || {};

  const fullName = [d.prenume, d.nume].filter(Boolean).join(" ") || "Pacient";

  const initials =
    `${(d.prenume || "")[0] || ""}${(d.nume || "")[0] || ""}`.toUpperCase() ||
    "P";

  const filteredRecommendations = recommendations.filter((rec) => {
    const text = `${rec.tipActivitate || ""} ${rec.alteIndicatii || ""}`
      .toLowerCase();

    return text.includes(searchTerm.toLowerCase());
  });

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
          <a href="/pacient/pacientfisa">
            📄 Fișa mea
          </a>
          <a href="/pacient/pacientvalori">📈 Valori senzori</a>
          <a href="/pacient/pacientrecomandari" className="active">🩺 Recomandări</a>
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
        <section className="recommendari-hero">
          <div>
            <p>RECOMANDĂRI MEDICALE</p>

            <h1>Indicațiile medicului</h1>

            <span>
              Vizualizează recomandările și indicațiile medicale active.
            </span>
          </div>
        </section>

        <section className="recommendari-list">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => (
              <div className="recommendari-card" key={rec.id}>
                <div className="recommendari-top">
                  <div>
                    <h2>{rec.tipActivitate || "Recomandare medicală"}</h2>
                    <span>{formatDate(rec.createdAt || rec.recordedAt)}</span>
                  </div>
                </div>

                <div className="recommendari-info">
                  <div>
                    <p>Durată recomandată</p>
                    <b>
                      {rec.durataZilnicaMinute
                        ? `${rec.durataZilnicaMinute} minute / zi`
                        : "Nespecificată"}
                    </b>
                  </div>
                </div>

                <div className="recommendari-text">
                  {rec.alteIndicatii || "Fără indicații suplimentare."}
                </div>
              </div>
            ))
          ) : (
            <div className="recommendari-card">
              <div className="recommendari-top">
                <div>
                  <h2>Nu există recomandări medicale</h2>
                  <span>-</span>
                </div>
              </div>

              <div className="recommendari-info">
                <div>
                  <p>Durată recomandată</p>
                  <b>-</b>
                </div>
              </div>

              <div className="recommendari-text">
                Recomandările vor apărea aici după ce medicul le salvează în
                sistem.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PacientRecomandari;