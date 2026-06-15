import "./alerte.css";
import { useEffect, useState } from "react";
import { getPatients } from "../../api";
import { logoutUser } from "../../api";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};


const formatDoctorName = (email) => {
  if (!email) return "Medic";

  const username = email.split("@")[0];
  const parts = username
    .split(".")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

  return parts.length >= 2 ? `Dr. ${parts.join(" ")}` : `Dr. ${parts[0] || "Medic"}`;
};

const getPatientName = (patient) => {
  const d = patient.demographics || {};
  return [d.nume, d.prenume].filter(Boolean).join(" ") || "Pacient";
};

const getInitials = (patient) => {
  const d = patient.demographics || {};
  return `${d.nume?.[0] || ""}${d.prenume?.[0] || ""}`.toUpperCase() || "?";
};

const buildAlertsFromPatients = (patients) => {
  const alerts = [];

  patients.forEach((patient) => {
    const sample = patient.latestSample;
    if (!sample) return;

    const patientName = getPatientName(patient);
    const initials = getInitials(patient);

    if (sample.puls && Number(sample.puls) > 100) {
      alerts.push({
        id: `${patient.id}-puls`,
        initials,
        patient: patientName,
        type: "Puls ridicat",
        value: `${sample.puls} bpm`,
        severity: Number(sample.puls) >= 110 ? "CRITICAL" : "WARNING",
        time: "Ultima măsurătoare",
        threshold: "60 - 100 bpm",
        recommendation: "Verificare rapidă a pulsului și monitorizare continuă.",
        history: [`Puls curent: ${sample.puls} bpm`],
        status: "ACTIVE",
      });
    }

    if (sample.temperatura && Number(sample.temperatura) >= 37.5) {
      alerts.push({
        id: `${patient.id}-temp`,
        initials,
        patient: patientName,
        type: "Temperatură crescută",
        value: `${sample.temperatura}°C`,
        severity: Number(sample.temperatura) >= 38 ? "CRITICAL" : "WARNING",
        time: "Ultima măsurătoare",
        threshold: "sub 37.5°C",
        recommendation: "Reevaluare temperatură și verificare simptome asociate.",
        history: [`Temperatură curentă: ${sample.temperatura}°C`],
        status: "ACTIVE",
      });
    }

    if (sample.umiditate && Number(sample.umiditate) > 70) {
      alerts.push({
        id: `${patient.id}-umiditate`,
        initials,
        patient: patientName,
        type: "Umiditate crescută",
        value: `${sample.umiditate}%`,
        severity: "WARNING",
        time: "Ultima măsurătoare",
        threshold: "sub 70%",
        recommendation: "Verificare condiții ambientale și confort pacient.",
        history: [`Umiditate curentă: ${sample.umiditate}%`],
        status: "ACTIVE",
      });
    }
  });

  return alerts;
};

function AlerteMedic() {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const doctorEmail = localStorage.getItem("sw_email") || "";
  const doctorName = formatDoctorName(doctorEmail);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const patients = await getPatients();
        setAlerts(buildAlertsFromPatients(patients));
      } catch (error) {
        console.log(error);
      }
    };

    loadAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const text = `${alert.patient} ${alert.type} ${alert.value}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "CRITICAL");

  const updateAlertStatus = (id, status) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status } : alert
      )
    );
  };

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
          <a href="/medic">📊 Dashboard</a>
          <a href="/medic/pacienti">👥 Pacienți</a>
          <a href="/medic/consultatii">🩺 Consultații</a>
          <a href="/medic/monitorizare">📈 Monitorizare</a>
          <a className="active" href="/medic/alerte">🔔 Alerte</a>
          <a href="/medic/rapoarte">📋 Rapoarte</a>
          <a href="/medic/hl7">🔗 HL7 FHIR</a>
        </nav>
        <button className="logoutBtn" onClick={handleLogout}>
  Logout
</button>
        <div className="profile">
          
          <div>{doctorInitials || "MD"}</div>
          <span>
            <b>{doctorName}</b>
            Medic specialist
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="stats">
          <div className="stat">
            <div className="icon pink">🔔</div>
            <div>
              <p>Alerte active</p>
              <h2>{activeAlerts.length}</h2>
              <span>necesită verificare</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">⚠</div>
            <div>
              <p>Critice</p>
              <h2>{criticalAlerts.length}</h2>
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
                  <input
                    placeholder="Caută pacient / tip alertă"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button">Caută</button>
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

              {filteredAlerts.map((alert) => (
                <div className="tableRow alerte-row" key={alert.id}>
                  <span className="patientName">
                    <b>{alert.initials}</b>
                    {alert.patient}
                  </span>

                  <span>{alert.type}</span>

                  <span className={alert.severity === "CRITICAL" ? "dangerText" : ""}>
                    {alert.value}
                  </span>

                  <span className={`alertSeverity ${alert.severity}`}>
                    {alert.severity === "CRITICAL" ? "Critică" : "Avertizare"}
                  </span>

                  <span>{alert.time}</span>

                  <span className="alerteActions">
                    <button type="button" onClick={() => setSelectedAlert(alert)}>
                      Detalii
                    </button>

                    {alert.status === "ACTIVE" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateAlertStatus(alert.id, "RESOLVED")}
                        >
                          Rezolvată
                        </button>

                        <button
                          type="button"
                          onClick={() => updateAlertStatus(alert.id, "IGNORED")}
                        >
                          Ignoră
                        </button>
                      </>
                    ) : (
                      <span className={`alertStatusTag ${alert.status}`}>
                        {alert.status === "RESOLVED" ? "Rezolvată" : "Ignorată"}
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="emptySearchMessage">
                  Nu există alerte generate din datele senzorilor.
                </div>
              )}
            </div>
          </div>
        </section>

        {selectedAlert && (
          <div className="alertModalOverlay">
            <div className="alertDetailsModal">
              <div className="alertModalHeader">
                <div className="alertModalIcon">🔔</div>

                <div>
                  <h2>Detalii alertă</h2>
                  <p>{selectedAlert.patient}</p>
                </div>

                <button type="button" onClick={() => setSelectedAlert(null)}>
                  ×
                </button>
              </div>

              <div className="alertDetailsBody">
                <div className="alertDetailGrid">
                  <label>
                    Pacient
                    <input value={selectedAlert.patient} readOnly />
                  </label>

                  <label>
                    Tip alertă
                    <input value={selectedAlert.type} readOnly />
                  </label>

                  <label>
                    Valoare detectată
                    <input value={selectedAlert.value} readOnly />
                  </label>

                  <label>
                    Prag normal
                    <input value={selectedAlert.threshold} readOnly />
                  </label>

                  <label>
                    Severitate
                    <input
                      value={
                        selectedAlert.severity === "CRITICAL"
                          ? "Critică"
                          : "Avertizare"
                      }
                      readOnly
                    />
                  </label>

                  <label>
                    Timp
                    <input value={selectedAlert.time} readOnly />
                  </label>

                  <label className="fullField">
                    Recomandare
                    <textarea value={selectedAlert.recommendation} readOnly />
                  </label>
                </div>

                <div className="alertHistoryBox">
                  <h3>Istoric măsurători</h3>

                  {selectedAlert.history.map((item, index) => (
                    <div className="alertHistoryItem" key={index}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AlerteMedic;