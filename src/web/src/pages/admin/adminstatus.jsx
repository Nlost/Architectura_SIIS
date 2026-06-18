import { useNavigate } from "react-router-dom";
import "./adminstatus.css";

function AdminStatus() {
  const navigate = useNavigate();

  const systems = [
    {
      name: "Server principal",
      status: "ONLINE",
      uptime: "99.9%",
      color: "green",
    },

    {
      name: "Bază de date",
      status: "ONLINE",
      uptime: "99.7%",
      color: "green",
    },

    {
      name: "Serviciu audit",
      status: "WARNING",
      uptime: "97.2%",
      color: "orange",
    },

    {
      name: "Sistem notificări",
      status: "OFFLINE",
      uptime: "81.5%",
      color: "red",
    },
  ];

  return (
    <div className="status-app">
      <aside className="status-sidebar">
        <div className="status-brand">
          <div className="status-logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>
            📊 Dashboard
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminutilizatori"); }}>
            👥 Utilizatori
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminroluri"); }}>
            🛡️ Roluri
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminaudit"); }}>
            📝 Audit
          </a>

          <a href="#" className="active">
            🟢 Status sistem
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminhl7"); }}>
            🔗 HL7 FHIR
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/admincsv"); }}>
            📁 Export CSV
          </a>
        </nav>

        <div className="status-profile">
          <div>A</div>

          <span>
            <b>Administrator</b>
            admin@clinic.ro
          </span>
        </div>
      </aside>

      <main className="status-main">
        <section className="status-hero">
          <div>
            <p>MONITORIZARE SISTEM</p>

            <h1>Status infrastructură</h1>
          </div>

          <button className="status-btn">
            Verificare sistem
          </button>
        </section>

        <section className="status-stats">
          <div className="status-stat">
            <div className="status-statIcon green">
              🟢
            </div>

            <div>
              <p>Servicii online</p>
              <h2>2</h2>
            </div>
          </div>

          <div className="status-stat">
            <div className="status-statIcon orange">
              ⚠️
            </div>

            <div>
              <p>Avertizări</p>
              <h2>1</h2>
            </div>
          </div>

          <div className="status-stat">
            <div className="status-statIcon red">
              🔴
            </div>

            <div>
              <p>Servicii offline</p>
              <h2>1</h2>
            </div>
          </div>
        </section>

        <section className="status-grid">
          {systems.map((system, index) => (
            <div className="system-card" key={index}>
              <div className="system-top">
                <div className={`system-icon ${system.color}`}>
                  {system.color === "green" && "🟢"}
                  {system.color === "orange" && "⚠️"}
                  {system.color === "red" && "🔴"}
                </div>

                <div>
                  <h2>{system.name}</h2>

                  <span>
                    Uptime: {system.uptime}
                  </span>
                </div>
              </div>

              <div className="system-status">
                <span>Status serviciu</span>

                <div className={`system-badge ${system.color}`}>
                  {system.status}
                </div>
              </div>

              <div className="system-actions">
                <button className="details">
                  Detalii
                </button>

                <button className="restart">
                  Restart
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default AdminStatus;