import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuditEvents, logoutUser } from "../../api";
import "./adminaudit.css";

const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function AdminAudit() {
  const navigate = useNavigate();

  const [resourceFilter, setResourceFilter] = useState("Toate resursele");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadAudit = async () => {
      try {
        const data = await getAuditEvents();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
      }
    };

    loadAudit();
  }, []);

  const resources = useMemo(() => {
    const uniqueResources = logs
      .map((log) => log.resource)
      .filter(Boolean);

    return ["Toate resursele", ...new Set(uniqueResources)];
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    return (
      resourceFilter === "Toate resursele" ||
      log.resource === resourceFilter
    );
  });

  const totalEvents = logs.length;
  const successEvents = logs.filter((log) => log.outcome === "SUCCESS").length;
  const deniedEvents = logs.filter((log) => log.outcome === "DENIED").length;

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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin");
            }}
          >
            📊 Dashboard
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminutilizatori");
            }}
          >
            👥 Utilizatori
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminroluri");
            }}
          >
            🛡️ Roluri
          </a>

          <a href="#" className="active">
            📝 Audit
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminhl7");
            }}
          >
            🔗 HL7 FHIR
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/admincsv");
            }}
          >
            📁 Export CSV
          </a>
        </nav>

        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>

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
        </section>

        <section className="audit-stats">
          <div className="audit-stat">
            <div className="audit-statIcon purple">📝</div>

            <div>
              <p>Total evenimente</p>
              <h2>{totalEvents}</h2>
            </div>
          </div>

          <div className="audit-stat">
            <div className="audit-statIcon green">✅</div>

            <div>
              <p>Succes</p>
              <h2>{successEvents}</h2>
            </div>
          </div>

          <div className="audit-stat">
            <div className="audit-statIcon pink">🚨</div>

            <div>
              <p>Denied</p>
              <h2>{deniedEvents}</h2>
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

          <div className="audit-filters audit-filters-single">
            <div className="audit-field">
              <label>Tip resursă</label>

              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
              >
                {resources.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </select>
            </div>
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
              <span>Descriere</span>
              <span>Oră</span>
              <span>Status</span>
            </div>

            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div className="audit-row" key={log.id}>
                  <span>{log.userEmail || "-"}</span>

                  <span>
                    <div className={`audit-type ${log.eventType}`}>
                      {log.eventType || "-"}
                    </div>
                  </span>

                  <span>{log.resource || "-"}</span>

                  <span>
                    {log.resourceId
                      ? log.resourceId.toString().substring(0, 8)
                      : "-"}
                  </span>

                  <span>{formatDate(log.occurredAt)}</span>

                  <span>
                    <div className={`audit-status ${log.outcome}`}>
                      {log.outcome || "-"}
                    </div>
                  </span>
                </div>
              ))
            ) : (
              <div className="audit-empty">
                Nu există evenimente pentru filtrul selectat.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminAudit;