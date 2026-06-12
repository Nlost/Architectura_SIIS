import "../../App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "../../api";

function Medic() {
  const navigate = useNavigate();

  const formatDoctorName = (email) => {
    if (!email || email === "medic") return "Medic";

    const username = email.split("@")[0];

    const nameParts = username
      .split(".")
      .filter(Boolean)
      .map(
        (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      );

    if (nameParts.length >= 2) {
      return `Dr. ${nameParts.join(" ")}`;
    }

    return `Dr. ${nameParts[0] || "Medic"}`;
  };

  const email = localStorage.getItem("sw_email") || "medic";
  const doctorName = formatDoctorName(email);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.log("Eroare dashboard medic:", error);
      }
    };

    loadDashboard();
  }, []);

  const calcAge = (birthDate) => {
    if (!birthDate) return "—";

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} ani`;
  };

  const getInitials = (nume, prenume) => {
    return (
      `${(nume || "")[0] || ""}${(prenume || "")[0] || ""}`.toUpperCase() ||
      "?"
    );
  };

  const getStatus = (sample) => {
    if (!sample) return "Stabil";

    if (
      sample.puls > 110 ||
      sample.temperatura > 38 ||
      sample.spo2 < 92 ||
      sample.umiditate > 80
    ) {
      return "Alertă";
    }

    if (
      sample.puls > 95 ||
      sample.temperatura > 37.5 ||
      sample.spo2 < 95 ||
      sample.umiditate > 70
    ) {
      return "Observație";
    }

    return "Stabil";
  };

  const recentPatients = patients.slice(0, 5);

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
          <a href="#" className="active" onClick={(e) => e.preventDefault()}>
            📊 Dashboard
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic/pacienti");
            }}
          >
            👥 Pacienți
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic/consultatii");
            }}
          >
            🩺 Consultații
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic/monitorizare");
            }}
          >
            📈 Monitorizare
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic/alerte");
            }}
          >
            🔔 Alerte
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic/rapoarte");
            }}
          >
            📋 Rapoarte
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic/hl7");
            }}
          >
            🔗 HL7 FHIR
          </a>
        </nav>

        <div className="profile">
          <div>{doctorInitials || "?"}</div>
          <span>
            <b>{doctorName}</b>
            Medic specialist
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="hero">
          <div className="heroText">
            <p>Bun venit,</p>
            <h1>{doctorName} 👋</h1>
          </div>

          <div className="wave"></div>
          <div className="dots"></div>
        </section>

        <section className="stats">
          <div className="stat">
            <div className="icon purple">👥</div>
            <div>
              <p>Pacienți activi</p>
              <h2>{patients.length}</h2>
              <span>pacienți asociați medicului</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">🔔</div>
            <div>
              <p>Alerte active</p>
              <h2>0</h2>
              <span>urmează legare cu tabela de alerte</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">💚</div>
            <div>
              <p>Recomandări active</p>
              <h2>0</h2>
              <span>urmează legare cu recomandări</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">📅</div>
            <div>
              <p>Consultații azi</p>
              <h2>0</h2>
              <span>urmează legare cu consultații</span>
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

              <button onClick={() => navigate("/medic/pacienti")}>
                Vezi toți ›
              </button>
            </div>

            <div className="table">
              <div className="tableRow tableHeader">
                <span>Pacient</span>
                <span>Vârstă</span>
                <span>Puls</span>
                <span>Temperatură</span>
                <span>Umiditate</span>
                <span>Status</span>
              </div>

              {recentPatients.length === 0 ? (
                <div className="tableRow">
                  <span>Nu există pacienți recenți.</span>
                  <span>-</span>
                  <span>-</span>
                  <span>-</span>
                  <span>-</span>
                  <span>-</span>
                  <span>-</span>
                </div>
              ) : (
                recentPatients.map((p) => {
                  const d = p.demographics || {};
                  const sample = p.latestSample || p.lastSample || p.sensorSample || null;

                  const fullName = [d.nume, d.prenume]
                    .filter(Boolean)
                    .join(" ");

                  const status = getStatus(sample);

                  return (
                    <div
                      className="tableRow"
                      key={p.id}
                      onClick={() => navigate(`/medic/pacient/${p.id}`)}
                    >
                      <span className="patientName">
                        <b>{getInitials(d.nume, d.prenume)}</b>
                        {fullName || "—"}
                      </span>

                      <span>{calcAge(d.dataNasterii)}</span>

                      <span className={sample?.puls > 110 ? "dangerText" : ""}>
                        {sample?.puls ? `${sample.puls} bpm` : "-"}
                      </span>

                      <span
                        className={
                          sample?.temperatura > 38 ? "dangerText" : ""
                        }
                      >
                        {sample?.temperatura
                          ? `${sample.temperatura}°C`
                          : "-"}
                      </span>

                      <span>
                        {sample?.umiditate ? `${sample.umiditate}%` : "-"}
                      </span>

                      <span className={`badge ${status}`}>{status}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="right">
            <div className="panel">
              <div className="panelHead">
                <div>
                  <p>EVENIMENTE</p>
                  <h2>Alerte recente</h2>
                </div>

                <button onClick={() => navigate("/medic/alerte")}>
                  Vezi toate
                </button>
              </div>

              <div className="alert info">
                <b>Nu există alerte recente</b>
                <span>-</span>
                <small>-</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Medic;