import "../../App.css";
import { useNavigate } from "react-router-dom";
const patients = [
  ["IP", "Ion Popescu", "67 ani", "78 bpm", "36.7°C", "Stabil"],
  ["MI", "Maria Ionescu", "71 ani", "112 bpm", "37.9°C", "Alertă"],
  ["EM", "Elena Matei", "64 ani", "84 bpm", "36.5°C", "Observație"],
  ["VR", "Victor Radu", "59 ani", "91 bpm", "37.1°C", "Stabil"],
  ["AP", "Ana Pop", "53 ani", "68 bpm", "36.4°C", "Stabil"],
];

function Medic() {
    const navigate = useNavigate();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">+</div>
          <div>
            <h2>SenorWatch</h2>
            <p>Medical dashboard</p>
          </div>
        </div>

        <nav>
          <a className="active">📊 Dashboard</a>
<a onClick={() => navigate("/medic/pacienti")}>👥 Pacienți</a>
<a onClick={() => navigate("/medic/consultatii")}>🩺 Consultații</a>
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
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
        <section className="hero">
          <div className="heroText">
            <p>Bun venit,</p>
            <h1>Dr. Andrei Popescu 👋</h1>
          </div>

          <div className="heroSearch">
            <input placeholder="Caută pacient, alertă, consultație..." />
            <button>⌕</button>
          </div>

          <div className="wave"></div>
          <div className="dots"></div>
        </section>

        <section className="stats">
          <div className="stat">
            <div className="icon purple">👥</div>
            <div>
              <p>Pacienți activi</p>
              <h2>128</h2>
              <span>↑ 12 față de săptămâna trecută</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">🔔</div>
            <div>
              <p>Alerte active</p>
              <h2>12</h2>
              <span>3 necesită verificare urgentă</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">💚</div>
            <div>
              <p>Recomandări active</p>
              <h2>36</h2>
              <span>8 actualizate astăzi</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">📅</div>
            <div>
              <p>Consultații azi</p>
              <h2>14</h2>
              <span>Program aproape complet</span>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="panel patientsPanel">
            <div className="panelHead">
              <div>
                <p>MONITORIZARE</p>
                <h2>Pacienți urmăriți recent</h2>
              </div>
              <button>Vezi toți ›</button>
            </div>

            <div className="table">
              <div className="tableRow tableHeader">
                <span>Pacient</span>
                <span>Vârstă</span>
                <span>Puls</span>
                <span>Temperatură</span>
                <span>Status</span>
              </div>

              {patients.map((p, index) => (
                <div className="tableRow" key={index}>
                  <span className="patientName">
                    <b>{p[0]}</b>
                    {p[1]}
                  </span>
                  <span>{p[2]}</span>
                  <span className={p[3] === "112 bpm" ? "dangerText" : ""}>{p[3]}</span>
                  <span>{p[4]}</span>
                  <span className={`badge ${p[5]}`}>{p[5]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="right">
            <div className="panel">
              <div className="panelHead">
                <div>
                  <p>EVENIMENTE</p>
                  <h2>Alerte recente</h2>
                </div>
                <button>Vezi toate</button>
              </div>

              <div className="alert critical">
                <b>Maria Ionescu</b>
                <span>Puls peste limita normală</span>
                <small>Acum 3 minute</small>
              </div>

              <div className="alert warning">
                <b>Victor Radu</b>
                <span>Temperatură crescută</span>
                <small>Acum 12 minute</small>
              </div>

              <div className="alert info">
                <b>Ana Pop</b>
                <span>Sincronizare întârziată cu senzorul</span>
                <small>Acum 21 minute</small>
              </div>
            </div>

          
          </div>
        </section>
      </main>
    </div>
  );
}

export default Medic;