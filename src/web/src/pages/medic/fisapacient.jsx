import "./fisapacient.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPatient,
  getConsultations,
  getRecommendationsByPatient,
} from "../../api";

function FisaPacient() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("general");
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

useEffect(() => {
  const loadData = async () => {
    try {
      const patientData = await getPatient(id);
      setPatient(patientData);

      const allConsultations = await getConsultations();
      setConsultations(
        allConsultations.filter((c) => c.patientId === id)
      );

      const recData = await getRecommendationsByPatient(id);
      setRecommendations(recData);
    } catch (error) {
      console.log(error);
      alert("Eroare la încărcarea fișei pacientului.");
    }
  };

  loadData();
}, [id]);

  useEffect(() => {
  }, [id]);

  const formatDoctorName = (email) => {
    if (!email) return "Medic";

    const username = email.split("@")[0];

    const parts = username
      .split(".")
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

    return parts.length >= 2 ? `Dr. ${parts.join(" ")}` : `Dr. ${parts[0] || "Medic"}`;
  };

  const doctorEmail = localStorage.getItem("sw_email") || "";
  const doctorName = formatDoctorName(doctorEmail);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

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

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    return date.toLocaleString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!patient) {
    return <div className="app">Se încarcă fișa pacientului...</div>;
  }

  const d = patient.demographics || {};
  const sample = patient.latestSample || {};

  const fullName = [d.nume, d.prenume].filter(Boolean).join(" ") || "Pacient";
  const initials =
    `${(d.nume || "")[0] || ""}${(d.prenume || "")[0] || ""}`.toUpperCase() ||
    "?";

  const address = [d.localitate, d.strada, d.judet, d.tara]
    .filter(Boolean)
    .join(", ");

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
          <a className="active" onClick={() => navigate("/medic/pacienti")}>
            👥 Pacienți
          </a>
          <a onClick={() => navigate("/medic/consultatii")}>🩺 Consultații</a>
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
          <a onClick={() => navigate("/medic/alerte")}>🔔 Alerte</a>
          <a onClick={() => navigate("/medic/rapoarte")}>📋 Rapoarte</a>
          <a onClick={() => navigate("/medic/hl7")}>🔗 HL7 FHIR</a>
        </nav>

        <div className="profile">
          <div>{doctorInitials || "MD"}</div>
          <span>
            <b>{doctorName}</b>
            Medic specialist
          </span>
        </div>
      </aside>

      <main className="main">
        <section className="fisa-wrapper">
          <div className="fisa-top-card">
            <div className="fisa-avatar">{initials}</div>

            <div className="fisa-title">
              <h1>{fullName}</h1>
              <p>
                ▫ CNP: {d.cnp || "—"} · ☎ Telefon: {d.telefon || "—"} · 🎂
                Naștere: {d.dataNasterii || "—"}
              </p>
            </div>

            <div className="fisa-top-actions">
              <button onClick={() => navigate("/medic/consultatii")}>
                Consult nou
              </button>
            </div>
          </div>

          <div className="fisa-tabs">
            <button
              className={activeTab === "general" ? "active" : ""}
              onClick={() => setActiveTab("general")}
            >
              Date generale
            </button>

            <button
              className={activeTab === "istoric" ? "active" : ""}
              onClick={() => setActiveTab("istoric")}
            >
              Istoric consultații <span>{consultations.length}</span>
            </button>

            <button
              className={activeTab === "monitorizare" ? "active" : ""}
              onClick={() => setActiveTab("monitorizare")}
            >
              Monitorizare
            </button>
          </div>

          {activeTab === "general" && (
            <>
              <div className="fisa-section">
                <h2>Identificare</h2>

                <div className="fisa-form-grid">
                  <label>
                    Nume
                    <input value={d.nume || "—"} readOnly />
                  </label>

                  <label>
                    Prenume
                    <input value={d.prenume || "—"} readOnly />
                  </label>

                  <label>
                    CNP
                    <input value={d.cnp || "—"} readOnly />
                  </label>

                  <label>
                    Sex
                    <input value={d.sex || "—"} readOnly />
                  </label>

                  <label>
                    Vârstă
                    <input value={calcAge(d.dataNasterii)} readOnly />
                  </label>

                  <label>
                    Status
                    <input value={patient.active ? "Activ" : "Inactiv"} readOnly />
                  </label>
                </div>
              </div>

              <div className="fisa-section">
                <h2>Contact & domiciliu</h2>

                <div className="fisa-form-grid">
                  <label>
                    Telefon
                    <input value={d.telefon || "—"} readOnly />
                  </label>

                  <label>
                    Email
                    <input value={d.email || "—"} readOnly />
                  </label>

                  <label className="wide">
                    Adresă
                    <input value={address || "—"} readOnly />
                  </label>
                </div>
              </div>

              <div className="fisa-section">
                <h2>Date clinice</h2>

                <div className="fisa-form-grid">
                  <label>
                    Puls
                    <input value={sample.puls ? `${sample.puls} bpm` : "—"} readOnly />
                  </label>

                  <label>
                    Temperatură
                    <input
                      value={sample.temperatura ? `${sample.temperatura}°C` : "—"}
                      readOnly
                    />
                  </label>

                  <label>
                    Umiditate
                    <input
                      value={sample.umiditate ? `${sample.umiditate}%` : "—"}
                      readOnly
                    />
                  </label>

                </div>
              </div>

              <div className="fisa-section">
                <h2>Recomandări medicale</h2>

                {recommendations.length === 0 && (
                  <p>Nu există recomandări înregistrate pentru acest pacient.</p>
                )}

                <div className="fisa-history-list">
                  {recommendations.map((r) => (
                    <div className="history-card" key={r.id}>
                      <div className="history-icon green">R</div>

                      <div className="history-body">
                        <h3>{r.tipActivitate || "Recomandare"}</h3>
                        <p>
                          Durată zilnică:{" "}
                          {r.durataZilnicaMinute
                            ? `${r.durataZilnicaMinute} minute`
                            : "—"}
                        </p>
                        <small>{r.alteIndicatii || "Fără alte indicații"}</small>
                      </div>

                      <span className="mini-badge green">{r.status || "ACTIVE"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "istoric" && (
            <div className="fisa-section">
              <h2>Istoric consultații</h2>

              {consultations.length === 0 && (
                <p>Nu există consultații înregistrate pentru acest pacient.</p>
              )}

              <div className="fisa-history-list">
                {consultations.map((c) => (
                  <div className="history-card" key={c.id}>
                    <div className="history-icon orange">C</div>

                    <div className="history-body">
                      <h3>{c.motivPrezentare || "Consultație"}</h3>
                      <p>
                        {formatDate(c.visitedAt)} · {doctorName}
                      </p>
                      <small>
                        {c.diagnosticIcd10Code || "—"} ·{" "}
                        {c.diagnosticIcd10Display || "Fără diagnostic"}
                      </small>
                    </div>

                    <span className="mini-badge orange">
                      {c.status || "ACTIVE"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "monitorizare" && (
            <div className="fisa-section">
              <h2>Monitorizare pacient</h2>

              <div className="monitoring-grid">
                <div className="monitor-card">
                  <p>Puls curent</p>
                  <h3>{sample.puls ? `${sample.puls} bpm` : "—"}</h3>
                </div>

                <div className="monitor-card">
                  <p>Temperatură</p>
                  <h3>{sample.temperatura ? `${sample.temperatura}°C` : "—"}</h3>
                </div>

                <div className="monitor-card">
                  <p>Umiditate</p>
                  <h3>{sample.umiditate ? `${sample.umiditate}%` : "—"}</h3>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FisaPacient;