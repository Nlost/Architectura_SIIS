import "./pacient.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatientMe, getRecommendationsByPatient } from "../../api";

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildAlerts = (sample) => {
  if (!sample) return [];

  const alerts = [];

  if (sample.puls && Number(sample.puls) > 100) {
    alerts.push({
      title: "Puls ridicat",
      value: `${sample.puls} bpm`,
      message: "Valoarea pulsului este peste limita normală.",
      type: "danger",
    });
  }

  if (sample.temperatura && Number(sample.temperatura) >= 37.5) {
    alerts.push({
      title: "Temperatură crescută",
      value: `${sample.temperatura}°C`,
      message: "Temperatura este peste limita recomandată.",
      type: "warning",
    });
  }

  if (sample.umiditate && Number(sample.umiditate) > 70) {
    alerts.push({
      title: "Umiditate crescută",
      value: `${sample.umiditate}%`,
      message: "Umiditatea înregistrată este peste limita recomandată.",
      type: "warning",
    });
  }

  return alerts;
};

function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const patientData = await getPatientMe();
        console.log(patientData)
        setPatient(patientData);

        if (patientData?.id) {
          const recommendationsData = await getRecommendationsByPatient(
            patientData.id
          );
          setRecommendations(recommendationsData);
        }
      } catch (error) {
        console.log("Eroare date pacient:", error);
      }
    };

    loadData();
  }, []);

  const d = patient?.demographics || {};
  const sample = patient?.latestSample || null;
  const alerts = buildAlerts(sample);

  const fullName = [d.prenume, d.nume].filter(Boolean).join(" ") || "Pacient";
  const firstName = d.prenume || "Pacient";

  const initials =
    `${(d.prenume || "")[0] || ""}${(d.nume || "")[0] || ""}`.toUpperCase() ||
    "P";

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
          <a href="#" className="active" onClick={(e) => e.preventDefault()}>
            📊 Dashboard
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/pacient/pacientfisa");
            }}
          >
            📄 Fișa mea
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/pacient/pacientvalori");
            }}
          >
            📈 Valori senzori
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/pacient/pacientrecomandari");
            }}
          >
            🩺 Recomandări
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/pacient/pacientalerte");
            }}
          >
            🚨 Alerte
          </a>
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
        <section className="hero">
          <div className="heroText">
            <p>MONITORIZARE PERSONALĂ</p>
            <h1>Bun venit, {firstName}!</h1>
            <span>
              Aici poți vedea valorile tale medicale, recomandările medicului și
              istoricul alertelor.
            </span>
          </div>
        </section>

        <section className="stats">
          <div className="stat">
            <div className="icon purple">HR</div>
            <div>
              <p>Puls</p>
              <h2>{sample?.puls ? `${sample.puls} bpm` : "-"}</h2>
              <span>ultima valoare înregistrată</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">TEMP</div>
            <div>
              <p>Temperatură</p>
              <h2>{sample?.temperatura ? `${sample.temperatura}°C` : "-"}</h2>
              <span>ultima valoare înregistrată</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">UM</div>
            <div>
              <p>Umiditate</p>
              <h2>{sample?.umiditate ? `${sample.umiditate}%` : "-"}</h2>
              <span>ultima valoare înregistrată</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">AL</div>
            <div>
              <p>Alerte</p>
              <h2>{alerts.length}</h2>
              <span>generate din valorile senzorilor</span>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="panel">
            <div className="panelHead">
              <div>
                <p>RECOMANDĂRI MEDICALE</p>
                <h2>Indicații de la medic</h2>
              </div>

              <button onClick={() => navigate("/pacient/pacientrecomandari")}>
                Vezi toate
              </button>
            </div>

            <div className="recommendationTable">
              <div className="recommendationHeader">
                <span>Recomandare</span>
                <span>Durată</span>
                <span>Data</span>
              </div>

              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((rec) => (
                  <div className="recommendationRow" key={rec.id}>
                    <div>
                      <b>{rec.tipActivitate || "Recomandare medicală"}</b>
                      <small>{rec.alteIndicatii || "Fără indicații suplimentare"}</small>
                    </div>

                    <span>
                      {rec.durataZilnicaMinute
                        ? `${rec.durataZilnicaMinute} min`
                        : "-"}
                    </span>

                    <span>{formatDate(rec.createdAt || rec.recordedAt)}</span>
                  </div>
                ))
              ) : (
                <div className="recommendationRow">
                  <div>
                    <b>Nu există recomandări recente</b>
                    <small>Recomandările vor apărea aici după consultație.</small>
                  </div>
                  <span>-</span>
                  <span>-</span>
                </div>
              )}
            </div>
          </div>

          <div className="right">
            <div className="panel">
              <div className="panelHead">
                <div>
                  <p>ALERTE</p>
                  <h2>Istoric recent</h2>
                </div>
              </div>

              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div className={`alert ${alert.type}`} key={index}>
                    <b>{alert.title}</b>
                    <span>{alert.value}</span>
                    <small>{alert.message}</small>
                  </div>
                ))
              ) : (
                <div className="alert info">
                  <b>Nu există alerte recente</b>
                  <span>-</span>
                  <small>Valorile tale sunt în limite normale.</small>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;