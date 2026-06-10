import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminaudit.css";

function AdminAudit() {
  const navigate = useNavigate();

  const [userFilter, setUserFilter] = useState("Toți utilizatorii");
  const [resourceFilter, setResourceFilter] = useState("Toate resursele");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const logs = [
    {
      user: "Administrator",
      event: "CREATE",
      resource: "users",
      resourceId: "USR-001",
      description: "A creat un utilizator nou",
      time: "2026-05-27 18:20",
      status: "SUCCESS",
    },
    {
      user: "Dr. Andrei Popescu",
      event: "EXPORT",
      resource: "clinical_visits",
      resourceId: "VIS-204",
      description: "A exportat raport medical",
      time: "2026-05-27 17:48",
      status: "SUCCESS",
    },
    {
      user: "Maria Ionescu",
      event: "LOGIN",
      resource: "auth",
      resourceId: "AUTH-044",
      description: "Autentificare în platformă",
      time: "2026-05-27 17:31",
      status: "SUCCESS",
    },
    {
      user: "Administrator",
      event: "UPDATE",
      resource: "permissions",
      resourceId: "PERM-010",
      description: "A modificat permisiunile rolului Medic",
      time: "2026-05-27 16:55",
      status: "SUCCESS",
    },
    {
      user: "Sistem",
      event: "READ",
      resource: "patients",
      resourceId: "PAT-078",
      description: "Tentativă acces neautorizat",
      time: "2026-05-27 15:40",
      status: "DENIED",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesUser =
      userFilter === "Toți utilizatorii" || log.user === userFilter;

    const matchesResource =
      resourceFilter === "Toate resursele" || log.resource === resourceFilter;

    return matchesUser && matchesResource;
  });

  return (
    <div className="audit-app">
      <aside className="audit-sidebar">
        <div className="audit-brand">
          <div className="audit-logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>📊 Dashboard</a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminutilizatori"); }}>
            👥 Utilizatori
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminroluri"); }}>🛡️ Roluri</a>

          <a href="#" className="active">📝 Audit</a>

        </nav>

        <div className="audit-profile">
          <div>A</div>

            <span>
            <b>Administrator</b>
            {localStorage.getItem("sw_email") || "admin@seniorwatch.com"}
          </span>
        </div>
      </aside>

      <main className="audit-main">
        <section className="audit-hero">
          <div>
            <p>MONITORIZARE ACTIVITATE</p>
            <h1>Audit sistem</h1>
          </div>

          <button className="audit-btn">Export audit</button>
        </section>

        <section className="audit-stats">
          <div className="audit-stat">
            <div className="audit-statIcon purple">📝</div>

            <div>
              <p>Total evenimente</p>
              <h2>2.341</h2>
            </div>
          </div>

          <div className="audit-stat">
            <div className="audit-statIcon green">✅</div>

            <div>
              <p>Succes</p>
              <h2>2.318</h2>
            </div>
          </div>

          <div className="audit-stat">
            <div className="audit-statIcon pink">🚨</div>

            <div>
              <p>Denied</p>
              <h2>23</h2>
            </div>
          </div>
        </section>

        <section className="audit-panel">
          <div className="audit-panelHead">
            <div>
              <p>AUDIT SERVICE</p>
              <h2>Filtrare evenimente</h2>
            </div>
          </div>

          <div className="audit-filters">
            <div className="audit-field">
              <label>Utilizator</label>

              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option>Toți utilizatorii</option>
                <option>Administrator</option>
                <option>Dr. Andrei Popescu</option>
                <option>Maria Ionescu</option>
                <option>Sistem</option>
              </select>
            </div>

            <div className="audit-field">
              <label>De la</label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="audit-field">
              <label>Până la</label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="audit-field">
              <label>Tip resursă</label>

              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
              >
                <option>Toate resursele</option>
                <option>users</option>
                <option>patients</option>
                <option>clinical_visits</option>
                <option>permissions</option>
                <option>auth</option>
              </select>
            </div>

            <button className="audit-searchBtn">Caută audit</button>
          </div>
        </section>

        <section className="audit-panel">
          <div className="audit-panelHead">
            <div>
              <p>ISTORIC ACTIVITATE</p>
              <h2>Evenimente audit</h2>
            </div>
          </div>

          <div className="audit-table">
            <div className="audit-row audit-header">
              <span>Utilizator</span>
              <span>Eveniment</span>
              <span>Resursă</span>
              <span>Resource ID</span>
              <span>Descriere</span>
              <span>Moment</span>
              <span>Status</span>
            </div>

            {filteredLogs.map((log, index) => (
              <div className="audit-row" key={index}>
                <span>{log.user}</span>

                <span>
                  <div className={`audit-type ${log.event}`}>{log.event}</div>
                </span>

                <span>{log.resource}</span>
                <span>{log.resourceId}</span>
                <span>{log.description}</span>
                <span>{log.time}</span>

                <span>
                  <div className={`audit-status ${log.status}`}>
                    {log.status}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminAudit;