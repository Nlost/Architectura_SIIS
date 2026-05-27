import { useNavigate } from "react-router-dom";
import "./permisiuniadmin.css";

function PermisiuniAdmin() {
  const navigate = useNavigate();

  const permissions = [
    {
      role: "Administrator",
      icon: "👑",
      color: "purple",
      permissions: [
        { name: "READ", active: true },
        { name: "WRITE", active: true },
        { name: "DELETE", active: true },
        { name: "EXPORT", active: true },
      ],
    },

    {
      role: "Medic",
      icon: "🩺",
      color: "violet",
      permissions: [
        { name: "READ", active: true },
        { name: "WRITE", active: true },
        { name: "DELETE", active: false },
        { name: "EXPORT", active: true },
      ],
    },

    {
      role: "Pacient",
      icon: "👤",
      color: "green",
      permissions: [
        { name: "READ", active: true },
        { name: "WRITE", active: false },
        { name: "DELETE", active: false },
        { name: "EXPORT", active: false },
      ],
    },
  ];

  return (
    <div className="permissions-app">
      <aside className="permissions-sidebar">
        <div className="permissions-brand">
          <div className="permissions-logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <a onClick={() => navigate("/admin")}>
            📊 Dashboard
          </a>

          <a onClick={() => navigate("/admin/adminutilizatori")}>
            👥 Utilizatori
          </a>

          <a onClick={() => navigate("/admin/adminroluri")}>
            🛡️ Roluri
          </a>

          <a className="active">
            🔐 Permisiuni
          </a>

          <a>
            📝 Audit
          </a>

          <a>
            🟢 Status sistem
          </a>
        </nav>

        <div className="permissions-profile">
          <div>A</div>

          <span>
            <b>Administrator</b>
            admin@clinic.ro
          </span>
        </div>
      </aside>

      <main className="permissions-main">
        <section className="permissions-hero">
          <div>
            <p>CONTROL ACCES</p>

            <h1>Permisiuni sistem</h1>

            <span>
              Configurează drepturile și accesul
              fiecărui rol din platformă.
            </span>
          </div>

          <button className="permissions-btn">
            + Adaugă permisiune
          </button>
        </section>

        <section className="permissions-stats">
          <div className="permissions-stat">
            <div className="permissions-statIcon purple">
              🔐
            </div>

            <div>
              <p>Total permisiuni</p>
              <h2>4</h2>
            </div>
          </div>

          <div className="permissions-stat">
            <div className="permissions-statIcon violet">
              🛡️
            </div>

            <div>
              <p>Roluri active</p>
              <h2>3</h2>
            </div>
          </div>

          <div className="permissions-stat">
            <div className="permissions-statIcon green">
              👥
            </div>

            <div>
              <p>Utilizatori activi</p>
              <h2>121</h2>
            </div>
          </div>
        </section>

        <section className="permissions-grid">
          {permissions.map((item, index) => (
            <div className="permission-card" key={index}>
              <div className="permission-top">
                <div className={`permission-icon ${item.color}`}>
                  {item.icon}
                </div>

                <div>
                  <h2>{item.role}</h2>

                  <span>
                    Control acces platformă
                  </span>
                </div>
              </div>

              <div className="permission-list">
                {item.permissions.map((permission, i) => (
                  <div
                    className={`permission-item ${
                      permission.active
                        ? "activePermission"
                        : "inactivePermission"
                    }`}
                    key={i}
                  >
                    <span>{permission.name}</span>

                    <div
                      className={`permission-dot ${
                        permission.active
                          ? "dotActive"
                          : "dotInactive"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>

              <div className="permission-actions">
                <button className="edit">
                  Editare
                </button>

                <button className="save">
                  Salvează
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default PermisiuniAdmin;