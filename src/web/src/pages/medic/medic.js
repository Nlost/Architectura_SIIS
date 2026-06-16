import "../../App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPatients,
  getConsultations,
  getRecommendationsByPatient,
  logoutUser,
} from "../../api";

const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};

function Medic() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [recommendationsCount, setRecommendationsCount] = useState(0);

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

    const puls = Number(sample.puls || 0);
    const temperatura = Number(sample.temperatura || 0);
    const spo2 = Number(sample.spo2 || 100);
    const umiditate = Number(sample.umiditate || 0);

    if (puls > 110 || temperatura > 38 || spo2 < 92 || umiditate > 80) {
      return "Alertă";
    }

    if (puls > 95 || temperatura > 37.5 || spo2 < 95 || umiditate > 70) {
      return "Observație";
    }

    return "Stabil";
  };

  const getAlertMessage = (sample) => {
    if (!sample) return "Nu există valori recente.";

    const messages = [];

    if (Number(sample.puls || 0) > 110) {
      messages.push(`Puls ridicat: ${sample.puls} bpm`);
    }

    if (Number(sample.temperatura || 0) > 38) {
      messages.push(`Temperatură crescută: ${sample.temperatura}°C`);
    }

    if (Number(sample.spo2 || 100) < 92) {
      messages.push(`SpO2 scăzut: ${sample.spo2}%`);
    }

    if (Number(sample.umiditate || 0) > 80) {
      messages.push(`Umiditate crescută: ${sample.umiditate}%`);
    }

    return messages.length > 0 ? messages.join(" · ") : "Valori în limite normale.";
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const patientsData = await getPatients();
        setPatients(Array.isArray(patientsData) ? patientsData : []);

        try {
          const consultationsData = await getConsultations();
          setConsultations(Array.isArray(consultationsData) ? consultationsData : []);
        } catch (error) {
          console.log("Eroare consultații dashboard:", error);
          setConsultations([]);
        }

        try {
          const allRecommendations = await Promise.all(
            (Array.isArray(patientsData) ? patientsData : []).map((p) =>
              getRecommendationsByPatient(p.id).catch(() => [])
            )
          );

          setRecommendationsCount(allRecommendations.flat().length);
        } catch (error) {
          console.log("Eroare recomandări dashboard:", error);
          setRecommendationsCount(0);
        }
      } catch (error) {
        console.log("Eroare dashboard medic:", error);
        setPatients([]);
      }
    };

    loadDashboard();
  }, []);

  const email = localStorage.getItem("sw_email") || "medic";
  const doctorName = formatDoctorName(email);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const recentPatients = patients.slice(0, 5);

  const activeAlerts = patients.filter((p) => {
    const sample = p.latestSample || p.lastSample || p.sensorSample || null;
    return getStatus(sample) === "Alertă";
  }).length;

  const recentAlerts = patients
    .filter((p) => {
      const sample = p.latestSample || p.lastSample || p.sensorSample || null;
      return getStatus(sample) === "Alertă";
    })
    .slice(0, 3);

  const todayConsultations = consultations.filter((c) => {
    const rawDate = c.visitedAt || c.recordedAt || c.createdAt;
    if (!rawDate) return false;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

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

        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>

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
              <h2>{activeAlerts}</h2>
              <span>calculate din valorile senzorilor</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">💚</div>
            <div>
              <p>Recomandări active</p>
              <h2>{recommendationsCount}</h2>
              <span>recomandări asociate pacienților</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">📅</div>
            <div>
              <p>Consultații azi</p>
              <h2>{todayConsultations}</h2>
              <span>consultații înregistrate astăzi</span>
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
                </div>
              ) : (
                recentPatients.map((p) => {
                  const d = p.demographics || {};
                  const sample =
                    p.latestSample || p.lastSample || p.sensorSample || null;

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

                      <span className={Number(sample?.puls || 0) > 110 ? "dangerText" : ""}>
                        {sample?.puls !== undefined && sample?.puls !== null
                          ? `${sample.puls} bpm`
                          : "-"}
                      </span>

                      <span
                        className={
                          Number(sample?.temperatura || 0) > 38
                            ? "dangerText"
                            : ""
                        }
                      >
                        {sample?.temperatura !== undefined &&
                        sample?.temperatura !== null
                          ? `${sample.temperatura}°C`
                          : "-"}
                      </span>

                      <span>
                        {sample?.umiditate !== undefined &&
                        sample?.umiditate !== null
                          ? `${sample.umiditate}%`
                          : "-"}
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

              {recentAlerts.length === 0 ? (
                <div className="alert info">
                  <b>Nu există alerte recente</b>
                  <span>-</span>
                  <small>Valorile pacienților sunt în limite normale.</small>
                </div>
              ) : (
                recentAlerts.map((p) => {
                  const d = p.demographics || {};
                  const sample =
                    p.latestSample || p.lastSample || p.sensorSample || null;

                  const fullName = [d.nume, d.prenume]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div className="alert danger" key={p.id}>
                      <b>{fullName || "Pacient"}</b>
                      <span>{getStatus(sample)}</span>
                      <small>{getAlertMessage(sample)}</small>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Medic;