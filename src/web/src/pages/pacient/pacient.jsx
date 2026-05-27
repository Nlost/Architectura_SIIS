import "./pacient.css";
import { useNavigate } from "react-router-dom";

function PatientDashboard() {
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
          <a className="active">  📊 Dashboard</a>
          <a onClick={() => navigate("/pacient/pacientfisa")}>   📄 Fișa mea</a>
          <a onClick={() => navigate("/pacient/pacientvalori")}>   📈 Valori senzori</a>
          <a onClick={() => navigate("/pacient/pacientrecomandari")}>  🩺 Recomandări</a>
          <a onClick={() => navigate("/pacient/pacientalerte")}>🚨 Alerte</a>
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
        <section className="hero">
          <div className="heroText">
            <p>MONITORIZARE PERSONALĂ</p>
            <h1>Bun venit, Maria!</h1>
            <span>
              Aici poți vedea valorile tale medicale, recomandările medicului și istoricul alertelor.
            </span>
          </div>

          <div className="heroSearch">
            <input placeholder="Caută valori, alerte sau recomandări..." />
            <button>⌕</button>
          </div>
        </section>

        <section className="stats">
          <div className="stat">
            <div className="icon purple">HR</div>
            <div>
              <p>Puls</p>
              <h2>78 bpm</h2>
              <span>în limite normale</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">TEMP</div>
            <div>
              <p>Temperatură</p>
              <h2>36.7°C</h2>
              <span>valoare normală</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">ECG</div>
            <div>
              <p>ECG</p>
              <h2>Stabil</h2>
              <span>fără modificări majore</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">AL</div>
            <div>
              <p>Alerte</p>
              <h2>2</h2>
              <span>în ultimele 7 zile</span>
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

              <div className="recommendationRow">
                <div>
                  <b>Plimbare zilnică</b>
                  <small>
                    Evitați efortul intens și monitorizați pulsul în timpul activității fizice.
                  </small>
                </div>
                <span>30 minute / zi</span>
                <span>20 mai 2026</span>
              </div>

              <div className="recommendationRow">
                <div>
                  <b>Evitare efort intens</b>
                  <small>
                    Evitați urcatul scărilor și activitățile fizice solicitante până la următorul control.
                  </small>
                </div>
                <span>Nespecificată</span>
                <span>18 mai 2026</span>
              </div>

              <div className="recommendationRow">
                <div>
                  <b>Control cardiologic</b>
                  <small>
                    Revenire la control cardiologic în aproximativ 30 de zile.
                  </small>
                </div>
                <span>Nespecificată</span>
                <span>15 mai 2026</span>
              </div>
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

              <div className="alert critical">
                <b>Puls ridicat</b>
                <span>Ieri, ora 18:40</span>
                <small>valoare peste limita setată</small>
              </div>

              <div className="alert info">
                <b>Dispozitiv conectat</b>
                <span>Azi, ora 09:15</span>
                <small>conexiune activă</small>
              </div>

              <div className="alert warning">
                <b>Activitate redusă</b>
                <span>Azi, ora 12:20</span>
                <small>monitorizare recomandată</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;