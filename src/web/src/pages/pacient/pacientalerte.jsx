import "./pacientalerte.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatientMe } from "../../api";
import { logoutUser } from "../../api";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};
const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildPatientAlerts = (sample) => {
  if (!sample) return [];

  const alerts = [];

  if (sample.puls && Number(sample.puls) > 100) {
    alerts.push({
      title: "Puls ridicat",
      time: formatDateTime(sample.ts),
      message: `Valoarea pulsului este ${sample.puls} bpm, peste limita normală.`,
      type: "critical",
    });
  }

  if (sample.puls && Number(sample.puls) < 60) {
    alerts.push({
      title: "Puls scăzut",
      time: formatDateTime(sample.ts),
      message: `Valoarea pulsului este ${sample.puls} bpm, sub limita normală.`,
      type: "warning",
    });
  }

  if (sample.temperatura && Number(sample.temperatura) >= 37.5) {
    alerts.push({
      title: "Temperatură crescută",
      time: formatDateTime(sample.ts),
      message: `Temperatura este ${sample.temperatura}°C, peste limita recomandată.`,
      type: "warning",
    });
  }

  if (sample.umiditate && Number(sample.umiditate) > 70) {
    alerts.push({
      title: "Umiditate crescută",
      time: formatDateTime(sample.ts),
      message: `Umiditatea este ${sample.umiditate}%, peste limita recomandată.`,
      type: "warning",
    });
  }

  if (sample.umiditate && Number(sample.umiditate) < 30) {
    alerts.push({
      title: "Umiditate scăzută",
      time: formatDateTime(sample.ts),
      message: `Umiditatea este ${sample.umiditate}%, sub limita recomandată.`,
      type: "warning",
    });
  }

  return alerts;
};

function PacientAlerte() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await getPatientMe();
        setPatient(data);
      } catch (error) {
        console.log("Eroare alerte pacient:", error);
      }
    };

    loadPatient();
  }, []);

  const d = patient?.demographics || {};
  const sample = patient?.latestSample || null;
  const alerts = buildPatientAlerts(sample);

  const fullName = [d.prenume, d.nume].filter(Boolean).join(" ") || "Pacient";

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
          <a onClick={() => navigate("/pacient")}>📊 Dashboard</a>

          <a onClick={() => navigate("/pacient/pacientfisa")}>
            📄 Fișa mea
          </a>

          <a onClick={() => navigate("/pacient/pacientvalori")}>
            📈 Valori senzori
          </a>

          <a onClick={() => navigate("/pacient/pacientrecomandari")}>
            🩺 Recomandări
          </a>

          <a className="active">🚨 Alerte</a>
        </nav>
        <button className="logoutBtn" onClick={handleLogout}>
  Logout
</button>
        <div className="profile">
          <div>{initials}</div>

          <span>
            <b>{fullName}</b>
            Pacient
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="alerte-hero">
          <div>
            <p>ALERTE MEDICALE</p>

            <h1>Istoric alerte</h1>

            <span>
              Vizualizează notificările generate pe baza ultimelor valori ale
              senzorilor.
            </span>
          </div>

          <div className="alerte-status">
            <b>Status sistem</b>
            <span>{sample ? "Monitorizare activă" : "Fără date recente"}</span>
          </div>
        </section>

        <section className="alerte-list">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div className={`alerta-card ${alert.type}`} key={index}>
                <div className="alerta-top">
                  <div>
                    <h2>{alert.title}</h2>
                    <span>{alert.time}</span>
                  </div>
                </div>

                <div className="alerta-content">{alert.message}</div>
              </div>
            ))
          ) : (
            <div className="alerta-card info">
              <div className="alerta-top">
                <div>
                  <h2>Nu există alerte active</h2>
                  <span>{formatDateTime(sample?.ts)}</span>
                </div>
              </div>

              <div className="alerta-content">
                Valorile actuale ale senzorilor sunt în limite normale.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PacientAlerte;