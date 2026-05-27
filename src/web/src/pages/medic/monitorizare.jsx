import "./monitorizare.css";
import { useNavigate } from "react-router-dom";

const monitoredPatients = [
  ["MI", "Maria Ionescu", "112 bpm", "37.9°C", "ECG instabil", "Alertă"],
  ["IP", "Ion Popescu", "78 bpm", "36.7°C", "ECG normal", "Stabil"],
  ["EM", "Elena Matei", "84 bpm", "36.5°C", "ECG normal", "Observație"],
  ["VR", "Victor Radu", "91 bpm", "37.1°C", "ECG normal", "Stabil",],
];

function MonitorizareMedic() {
  const navigate = useNavigate();

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
          <a className="active">📈 Monitorizare</a>
          <a onClick={() => navigate("/medic/alerte")}>🔔 Alerte</a>
          <a onClick={() => navigate("/medic/rapoarte")}>📋 Rapoarte</a>
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
            <div className="icon purple">📡</div>
            <div>
              <p>Pacienți online</p>
              <h2>84</h2>
              <span>transmit date în timp real</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">❤</div>
            <div>
              <p>Puls mediu</p>
              <h2>86 bpm</h2>
              <span>calculat din ultimele valori</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">🌡</div>
            <div>
              <p>Temperatură medie</p>
              <h2>36.9°C</h2>
              <span>în limite acceptabile</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">⚠</div>
            <div>
              <p>Alerte active</p>
              <h2>7</h2>
              <span>necesită verificare</span>
            </div>
          </div>
        </section>

        <section className="content monitorizare-content">
          <div className="panel live-panel">
            <div className="panelHead">
              <div>
                <h1>Valori pacienți</h1>
              </div>

              <div className="monitorizare-search">
                <span>⌕</span>
                <input placeholder="Caută pacient monitorizat..." />
                <button>Caută</button>
              </div>
            </div>

            <div className="live-grid">
              <div className="live-card danger">
                <div>
                  <span className="live-dot"></span>
                  <p>Maria Ionescu</p>
                </div>
                <h2>112 bpm</h2>
                <small>Puls peste limita normală</small>
              </div>

              <div className="live-card stable">
                <div>
                  <span className="live-dot"></span>
                  <p>Ion Popescu</p>
                </div>
                <h2>78 bpm</h2>
                <small>Valori stabile</small>
              </div>

              <div className="live-card warning-card">
                <div>
                  <span className="live-dot"></span>
                  <p>Elena Matei</p>
                </div>
                <h2>84 bpm</h2>
                <small>Monitorizare recomandată</small>
              </div>
            </div>
          </div>

          <div className="panel chart-panel">
            <div className="panelHead">
              <div>
                <p>EVOLUȚIE</p>
                <h2>Grafic puls - ultimele valori</h2>
              </div>
            </div>

            <div className="fake-chart">
              <span style={{ height: "45%" }}></span>
              <span style={{ height: "58%" }}></span>
              <span style={{ height: "40%" }}></span>
              <span style={{ height: "72%" }}></span>
              <span style={{ height: "55%" }}></span>
              <span style={{ height: "86%" }}></span>
              <span style={{ height: "62%" }}></span>
              <span style={{ height: "50%" }}></span>
            </div>
          </div>

          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <p>DATE SENZORI</p>
                <h2>Monitorizare pacienți</h2>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader monitorizare-row">
                <span>Pacient</span>
                <span>Puls</span>
                <span>Temperatură</span>
                <span>ECG</span>
                <span>Status</span>
                <span>Acțiuni</span>
              </div>

{monitoredPatients.map((p, index) => (
  <div className="tableRow monitorizare-row" key={index}>
    <span className="patientName">
      <b>{p[0]}</b>
      {p[1]}
    </span>

    <span className={p[2] === "112 bpm" ? "dangerText" : ""}>
      {p[2]}
    </span>

    <span>{p[3]}</span>

    <span>{p[4]}</span>

    <span className={`badge ${p[5]}`}>
      {p[5]}
    </span>

    <span className="monitorizareActions">
      <button>Detalii</button>
      <button>Grafic</button>
      <button>Alertă</button>
    </span>
  </div>
))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MonitorizareMedic;