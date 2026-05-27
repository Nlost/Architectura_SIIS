import "./rapoarte.css";
import { useNavigate } from "react-router-dom";

const reports = [
  ["MI", "Maria Ionescu", "Consultație", "Cardiologie", "ACTIVE", "Azi, 10:30"],
  ["IP", "Ion Popescu", "Monitorizare", "Puls / Temperatură", "ACTIVE", "Azi, 09:15"],
  ["VR", "Victor Radu", "Alerte", "Temperatură crescută", "ARCHIVED", "Ieri, 16:00"],
  ["EM", "Elena Matei", "Recomandări", "Activitate fizică", "AMENDED", "Ieri, 14:20"],
  ["AP", "Ana Pop", "Scrisoare FHIR", "Bundle medical", "PENDING", "Ieri, 12:40"],
];

function RapoarteMedic() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">+</div>
          <div>
            <h2>SeniorWatch</h2>
            <p>Medical dashboard</p>
          </div>
        </div>

        <nav>
          <a onClick={() => navigate("/medic")}>📊 Dashboard</a>
          <a onClick={() => navigate("/medic/pacienti")}>👥 Pacienți</a>
          <a onClick={() => navigate("/medic/consultatii")}>🩺 Consultații</a>
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
          <a onClick={() => navigate("/medic/alerte")}>🔔 Alerte</a>
          <a className="active">📋 Rapoarte</a>
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
            <div className="icon purple">📋</div>
            <div>
              <p>Rapoarte totale</p>
              <h2>32</h2>
              <span>generate în sistem</span>
            </div>
          </div>

        </section>

        <section className="content rapoarte-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Rapoarte generate</h1>
              </div>

              <div className="rapoarte-tools">
                <div className="rapoarte-search">
                  <span>⌕</span>
                  <input placeholder="Caută după pacient" />
                  <button>Caută</button>
                </div>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader rapoarte-row">
                <span>Pacient</span>
                <span>Tip raport</span>
                <span>Conținut</span>
                <span>Status</span>
                <span>Data</span>
                <span>Acțiuni</span>
              </div>

              {reports.map((r, index) => (
                <div className="tableRow rapoarte-row" key={index}>
                  <span className="patientName">
                    <b>{r[0]}</b>
                    {r[1]}
                  </span>

                  <span>{r[2]}</span>
                  <span>{r[3]}</span>

                  <span className={`reportStatus ${r[4]}`}>
                    {r[4]}
                  </span>

                  <span>{r[5]}</span>

                  <span className="rapoarteActions">
                    <button>Vezi</button>
                    <button>Generează PDF</button>
                    <button>Trimite</button>
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

export default RapoarteMedic;