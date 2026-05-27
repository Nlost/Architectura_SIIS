import "./pacientvalori.css";
import { useNavigate } from "react-router-dom";

function PacientValori() {
  const navigate = useNavigate();

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
<a onClick={() => navigate("/pacient/pacientalerte")}>
  🚨 Alerte
</a>
        </nav>

        <div className="profile">
          <div>MI</div>
          <span>
            <b>Maria Ionescu</b>
            Pacient
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="valori-hero">
          <div>
            <p>MONITORIZARE SENZORI</p>
            <h1>Valori medicale</h1>
            <span>Valorile tale curente preluate din fișa pacientului.</span>
          </div>

          <div className="valori-sync-card">
            <b>Ultima sincronizare</b>
            <span>acum 5 minute</span>
          </div>
        </section>

        <section className="valori-grid">
          <div className="valori-card">
            <div className="valori-icon purple">❤</div>
            <div>
              <p>Puls</p>
              <h2>78 bpm</h2>
              <span>în limite normale</span>
            </div>
          </div>

          <div className="valori-card">
            <div className="valori-icon green">🌡</div>
            <div>
              <p>Temperatură</p>
              <h2>36.7°C</h2>
              <span>valoare normală</span>
            </div>
          </div>

          <div className="valori-card">
            <div className="valori-icon violet">〰</div>
            <div>
              <p>ECG</p>
              <h2>ECG normal</h2>
              <span>fără modificări majore</span>
            </div>
          </div>
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
              <span>❤ Puls</span>
              <span>78 bpm</span>
              <span>În limite normale</span>
            </div>

            <div className="valori-row">
              <span>🌡 Temperatură</span>
              <span>36.7°C</span>
              <span>Valoare normală</span>
            </div>

            <div className="valori-row">
              <span>〰 ECG</span>
              <span>ECG normal</span>
              <span>Fără modificări majore</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PacientValori;