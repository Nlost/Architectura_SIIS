import "./pacientfisa.css";
import { useNavigate } from "react-router-dom";

function PacientFisa() {
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
          <a className="active">📄 Fișa mea</a>
<a onClick={() => navigate("/pacient/pacientvalori")}>📈 Valori senzori</a>      
<a onClick={() => navigate("/pacient/pacientrecomandari")}>
  🩺 Recomandări
</a>   
<a onClick={() => navigate("/pacient/pacientalerte")}>
  🚨 Alerte
</a>
          {/* <a>📋 Rapoarte</a> */}
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
        <section className="pacient-fisa-wrapper">
          <div className="pacient-fisa-top-card">
            <div className="pacient-fisa-avatar">MI</div>

            <div className="pacient-fisa-title">
              <p>FIȘĂ PACIENT</p>
              <h1>Maria Ionescu</h1>
      ▫ CNP: 2790101123456 · ☎ Telefon: 0744556677 · 🎂 71 ani
            </div>
          </div>

          <div className="pacient-fisa-section">
            <h2>Date generale</h2>

            <div className="pacient-fisa-grid">
              <label>
                Nume
                <input value="Ionescu" readOnly />
              </label>

              <label>
                Prenume
                <input value="Maria" readOnly />
              </label>

              <label>
                Sex
                <input value="Feminin" readOnly />
              </label>

              <label>
                Vârstă
                <input value="71 ani" readOnly />
              </label>

              <label>
                Telefon
                <input value="0744556677" readOnly />
              </label>

              <label>
                Email
                <input value="maria.ionescu@email.com" readOnly />
              </label>

              <label className="wide">
                Adresă
                <input value="Timișoara, Str. Mureș nr. 8" readOnly />
              </label>
            </div>
          </div>

          <div className="pacient-fisa-section">
            <h2>Date clinice</h2>

            <div className="pacient-fisa-grid">
              <label>
                Puls
                <input value="78 bpm" readOnly />
              </label>

              <label>
                Temperatură
                <input value="36.7°C" readOnly />
              </label>

              <label>
                ECG
                <input value="ECG normal" readOnly />
              </label>

              <label>
                Alergii
                <input value="Penicilină" readOnly />
              </label>

              <label className="wide">
                Istoric medical
                <textarea
                  value="Episoade de tahicardie. Necesită supraveghere cardiologică și monitorizare periodică."
                  readOnly
                />
              </label>

              <label className="wide">
                Tratament
                <textarea
                  value="Monitorizare puls și ECG. Reevaluare cardiologică la nevoie."
                  readOnly
                />
              </label>
              
            </div>
            
          </div>
          <div className="pacient-fisa-section">
  <h2>Recomandări medicale</h2>

  <div className="pacient-recommendation-list">
    <div className="pacient-recommendation-item">
      <div className="pacient-recommendation-head">
        <div className="pacient-recommendation-icon">🩺</div>

        <div>
          <h3>Plimbare zilnică</h3>
          <span>20 mai 2026</span>
        </div>
      </div>

      <p>30 minute / zi</p>

      <small>
        Evitați efortul intens și monitorizați pulsul în timpul activității fizice.
      </small>
    </div>

    <div className="pacient-recommendation-item">
      <div className="pacient-recommendation-head">
        <div className="pacient-recommendation-icon">⚠️</div>

        <div>
          <h3>Evitare efort intens</h3>
          <span>18 mai 2026</span>
        </div>
      </div>

      <p>Nespecificat</p>

      <small>
        Evitați activitățile solicitante până la următorul control.
      </small>
    </div>
  </div>
</div>
        </section>
      </main>
    </div>
  );
}

export default PacientFisa;