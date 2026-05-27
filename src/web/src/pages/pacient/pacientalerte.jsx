import "./pacientalerte.css";
import { useNavigate } from "react-router-dom";

function PacientAlerte() {
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
          <a onClick={() => navigate("/pacient")}>
            📊 Dashboard
          </a>

          <a onClick={() => navigate("/pacient/pacientfisa")}>
            📄 Fișa mea
          </a>

          <a onClick={() => navigate("/pacient/pacientvalori")}>
            📈 Valori senzori
          </a>

          <a onClick={() => navigate("/pacient/pacientrecomandari")}>
            🩺 Recomandări
          </a>

          <a className="active">
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

        <section className="alerte-hero">
          <div>
            <p>ALERTE MEDICALE</p>

            <h1>Istoric alerte</h1>

            <span>
              Vizualizează notificările și evenimentele recente monitorizate de sistem.
            </span>
          </div>

          <div className="alerte-status">
            <b>Status sistem</b>
            <span>Monitorizare activă</span>
          </div>
        </section>

        <section className="alerte-list">

          <div className="alerta-card critical">
            <div className="alerta-top">


              <div>
                <h2>Puls ridicat</h2>
                <span>Ieri, ora 18:40</span>
              </div>
            </div>

            <div className="alerta-content">
              Valoarea pulsului a depășit limita configurată pentru monitorizare.
            </div>
          </div>

          <div className="alerta-card info">
            <div className="alerta-top">


              <div>
                <h2>Dispozitiv conectat</h2>
                <span>Azi, ora 09:15</span>
              </div>
            </div>

            <div className="alerta-content">
              Smartwatch-ul a fost sincronizat cu succes cu platforma SeniorWatch.
            </div>
          </div>

          <div className="alerta-card warning">
            <div className="alerta-top">

              <div>
                <h2>Activitate redusă</h2>
                <span>Azi, ora 12:20</span>
              </div>
            </div>

            <div className="alerta-content">
              Nivel redus de activitate detectat în ultimele ore. Monitorizare recomandată.
            </div>
          </div>

          <div className="alerta-card critical">
            <div className="alerta-top">


              <div>
                <h2>Ritm cardiac instabil</h2>
                <span>17 mai 2026 · 22:18</span>
              </div>
            </div>

            <div className="alerta-content">
              Au fost detectate variații neobișnuite ale ritmului cardiac.
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default PacientAlerte;