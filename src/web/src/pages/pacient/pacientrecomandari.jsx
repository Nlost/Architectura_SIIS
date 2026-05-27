import "./pacientrecomandari.css";
import { useNavigate } from "react-router-dom";

function PacientRecomandari() {
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

          <a onClick={() => navigate("/pacient/pacientfisa")}>
            📄 Fișa mea
          </a>

          <a onClick={() => navigate("/pacient/pacientvalori")}>
            📈 Valori senzori
          </a>

          <a className="active">🩺 Recomandări</a>
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
        <section className="recommendari-hero">
          <div>
            <p>RECOMANDĂRI MEDICALE</p>

            <h1>Indicațiile medicului</h1>

            <span>
              Vizualizează recomandările și indicațiile medicale active.
            </span>
          </div>

          <div className="recommendari-search">
            <input placeholder="Caută recomandări..." />
            <button>⌕</button>
          </div>
        </section>

       <section className="recommendari-list">
  <div className="recommendari-card">
    <div className="recommendari-top">
      <div>
        <h2>Plimbare zilnică</h2>
        <span>20 mai 2026</span>
      </div>
    </div>

    <div className="recommendari-info">
      <div>
        <p>Durată recomandată</p>
        <b>30 minute / zi</b>
      </div>
    </div>

    <div className="recommendari-text">
      Evitați efortul intens și monitorizați pulsul în timpul activității fizice.
    </div>
  </div>

  <div className="recommendari-card">
    <div className="recommendari-top">
      <div>
        <h2>Evitare efort intens</h2>
        <span>18 mai 2026</span>
      </div>
    </div>

    <div className="recommendari-info">
      <div>
        <p>Durată recomandată</p>
        <b>Nespecificată</b>
      </div>
    </div>

    <div className="recommendari-text">
      Evitați urcatul scărilor și activitățile solicitante până la următorul control.
    </div>
  </div>

  <div className="recommendari-card">
    <div className="recommendari-top">
      <div>
        <h2>Control cardiologic</h2>
        <span>15 mai 2026</span>
      </div>
    </div>

    <div className="recommendari-info">
      <div>
        <p>Durată recomandată</p>
        <b>Nespecificată</b>
      </div>
    </div>

    <div className="recommendari-text">
      Revenire la control cardiologic pentru reevaluare și monitorizare ECG.
    </div>
  </div>
</section>
      </main>
    </div>
  );
}

export default PacientRecomandari;