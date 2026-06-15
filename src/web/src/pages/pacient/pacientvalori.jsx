import "./pacientvalori.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatientMe, getEcgSeries } from "../../api";
import { logoutUser } from "../../api";
import EcgMonitor from "../../components/EcgMonitor";


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
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPulseInterpretation = (puls) => {
  if (!puls) return "-";
  const value = Number(puls);

  if (value > 100) return "Puls peste limita normală";
  if (value < 60) return "Puls sub limita normală";
  return "În limite normale";
};

const getTempInterpretation = (temperatura) => {
  if (!temperatura) return "-";
  const value = Number(temperatura);

  if (value >= 37.5) return "Temperatură crescută";
  if (value < 35.5) return "Temperatură scăzută";
  return "Valoare normală";
};

const getHumidityInterpretation = (umiditate) => {
  if (!umiditate) return "-";
  const value = Number(umiditate);

  if (value > 70) return "Umiditate crescută";
  if (value < 30) return "Umiditate scăzută";
  return "Valoare normală";
};

function PacientValori() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [ecg, setEcg] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await getPatientMe();
        setPatient(data);

        if (data?.id) {
          try {
            const series = await getEcgSeries(data.id);
            setEcg(series);
          } catch (ecgError) {
            console.log("Eroare ECG pacient:", ecgError);
            setEcg(null);
          }
        }
      } catch (error) {
        console.log("Eroare valori pacient:", error);
      }
    };

    loadPatient();
  }, []);

  const d = patient?.demographics || {};
  const sample = patient?.latestSample || {};

  const fullName = [d.prenume, d.nume].filter(Boolean).join(" ") || "Pacient";

  const initials =
    `${(d.prenume || "")[0] || ""}${(d.nume || "")[0] || ""}`.toUpperCase() ||
    "P";

  const puls = sample?.puls;
  const temperatura = sample?.temperatura;
  const umiditate = sample?.umiditate;

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
          <a onClick={() => navigate("/pacient/pacientfisa")}>📄 Fișa mea</a>
          <a className="active">📈 Valori senzori</a>
          <a onClick={() => navigate("/pacient/pacientrecomandari")}>
            🩺 Recomandări
          </a>
          <a onClick={() => navigate("/pacient/pacientalerte")}>🚨 Alerte</a>
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
        <section className="valori-hero">
          <div>
            <p>MONITORIZARE SENZORI</p>
            <h1>Valori medicale</h1>
            <span>Valorile tale curente preluate din baza de date.</span>
          </div>

          <div className="valori-sync-card">
            <b>Ultima sincronizare</b>
            <span>{formatDateTime(sample?.ts)}</span>
          </div>
        </section>

        <section className="valori-grid">
          <div className="valori-card">
            <div className="valori-icon purple">HR</div>
            <div>
              <p>Puls</p>
              <h2>{puls ? `${puls} bpm` : "-"}</h2>
              <span>{getPulseInterpretation(puls)}</span>
            </div>
          </div>

          <div className="valori-card">
            <div className="valori-icon green">TEMP</div>
            <div>
              <p>Temperatură</p>
              <h2>{temperatura ? `${temperatura}°C` : "-"}</h2>
              <span>{getTempInterpretation(temperatura)}</span>
            </div>
          </div>

          <div className="valori-card">
            <div className="valori-icon violet">UM</div>
            <div>
              <p>Umiditate</p>
              <h2>{umiditate ? `${umiditate}%` : "-"}</h2>
              <span>{getHumidityInterpretation(umiditate)}</span>
            </div>
          </div>
        </section>

        <section className="valori-ecg">
          <EcgMonitor
            bpm={puls ? Number(puls) : 72}
            samples={ecg?.samples || null}
            samplingHz={ecg?.samplingHz || 1000}
            baseline={ecg?.baseline ?? 2048}
            adcMax={ecg?.adcMax ?? 4095}
          />
        </section>

        <section className="valori-panel">
          <div className="valori-panel-head">
            <div>
              <p>DETALII SENZORI</p>
              <h2>Rezumat valori curente</h2>
            </div>
          </div>

          <div className="valori-table">
            <div className="valori-row valori-header">
              <span>Parametru</span>
              <span>Valoare</span>
              <span>Interpretare</span>
            </div>

            <div className="valori-row">
              <span>HR Puls</span>
              <span>{puls ? `${puls} bpm` : "-"}</span>
              <span>{getPulseInterpretation(puls)}</span>
            </div>

            <div className="valori-row">
              <span>TEMP Temperatură</span>
              <span>{temperatura ? `${temperatura}°C` : "-"}</span>
              <span>{getTempInterpretation(temperatura)}</span>
            </div>

            <div className="valori-row">
              <span>UM Umiditate</span>
              <span>{umiditate ? `${umiditate}%` : "-"}</span>
              <span>{getHumidityInterpretation(umiditate)}</span>
            </div>

            <div className="valori-row">
              <span>Ultima măsurătoare</span>
              <span>{formatDateTime(sample?.ts)}</span>
              <span>Sincronizare din backend</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PacientValori;