import "./alerte.css";
import { useNavigate } from "react-router-dom";

const alerts = [
  ["MI", "Maria Ionescu", "Puls ridicat", "112 bpm", "CRITICAL", "Acum 3 minute"],
  ["VR", "Victor Radu", "Temperatură crescută", "37.9°C", "WARNING", "Acum 12 minute"],
  ["AP", "Ana Pop", "Senzor offline", "Bluetooth inactiv", "WARNING", "Acum 21 minute"],
  ["EM", "Elena Matei", "Activitate redusă", "Sub limita zilnică", "WARNING", "Acum 35 minute"],
  ["IP", "Ion Popescu", "Sincronizare întârziată", "Ultima transmisie veche", "WARNING", "Acum 1 oră"],
];

function AlerteMedic() {
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
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
          <a className="active">🔔 Alerte</a>          
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
            <div className="icon pink">🔔</div>
            <div>
              <p>Alerte totale</p>
              <h2>24</h2>
              <span>în ultimele 24 de ore</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">⚠</div>
            <div>
              <p>Critice</p>
              <h2>5</h2>
              <span>necesită verificare rapidă</span>
            </div>
          </div>




        </section>

        <section className="content alerte-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Alerte și avertizări</h1>
              </div>

              <div className="alerte-tools">
                <div className="alerte-search">
                  <span>⌕</span>
                  <input placeholder="Caută pacient / tip alertă" />
                  <button>Caută</button>
                </div>

              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader alerte-row">
                <span>Pacient</span>
                <span>Alertă</span>
                <span>Valoare</span>
                <span>Severitate</span>
                <span>Timp</span>
                <span>Acțiuni</span>
              </div>

              {alerts.map((a, index) => (
                <div className="tableRow alerte-row" key={index}>
                  <span className="patientName">
                    <b>{a[0]}</b>
                    {a[1]}
                  </span>

                  <span>{a[2]}</span>
                  <span className={a[3] === "112 bpm" ? "dangerText" : ""}>{a[3]}</span>
<span className={`alertSeverity ${a[4]}`}>
  {a[4] === "CRITICAL" ? "Critică" : "Avertizare"}
</span>                  <span>{a[5]}</span>

                  <span className="alerteActions">
                    <button>Detalii</button>
                    <button>Rezolvată</button>
                    <button>Ignoră</button>
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

export default AlerteMedic;