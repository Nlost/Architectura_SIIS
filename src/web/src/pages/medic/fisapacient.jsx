import "./fisapacient.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const patients = {
  IP: {
    initials: "IP",
    name: "Ion Popescu",
    cnp: "1580615123456",
    age: "67 ani",
    sex: "M",
    phone: "0723456789",
    email: "ion.popescu@email.com",
    address: "Timișoara, Str. Florilor nr. 12",
    status: "Stabil",
    pulse: "78 bpm",
    temp: "36.7°C",
    ecg: "ECG normal",
    lastSync: "acum 5 min",
    allergies: "Nu sunt înregistrate",
    history: "Hipertensiune arterială ușoară. Monitorizare periodică.",
    treatment: "Tratament antihipertensiv conform recomandării medicului.",
  },
  MI: {
    initials: "MI",
    name: "Maria Ionescu",
    cnp: "2790101123456",
    age: "71 ani",
    sex: "F",
    phone: "0744556677",
    email: "maria.ionescu@email.com",
    address: "Timișoara, Str. Mureș nr. 8",
    status: "Alertă",
    pulse: "112 bpm",
    temp: "37.9°C",
    ecg: "ECG instabil",
    lastSync: "acum 1 min",
    allergies: "Penicilină",
    history: "Episoade de tahicardie. Necesită supraveghere cardiologică.",
    treatment: "Monitorizare puls și ECG. Reevaluare cardiologică.",
  },
};

function FisaPacient() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const { id } = useParams();

  const patient = patients[id] || patients.IP;

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
          <a className="active" onClick={() => navigate("/medic/pacienti")}>👥 Pacienți</a>
          <a onClick={() => navigate("/medic/consultatii")}>🩺 Consultații</a>
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
          <a onClick={() => navigate("/medic/alerte")}>🔔 Alerte</a>
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
        <section className="fisa-wrapper">

          <div className="fisa-top-card">
            <div className="fisa-avatar">{patient.initials}</div>
            <div className="fisa-title">
              <h1>{patient.name}</h1>
              <p>▫ CNP: {patient.cnp} · ☎ Telefon: {patient.phone} · 🎂 Naștere: 1958-06-15</p>
            </div>
            <div className="fisa-top-actions">
              <button>Consult nou</button>
            </div>
          </div>

          <div className="fisa-tabs">
            <button className={activeTab === "general" ? "active" : ""} onClick={() => setActiveTab("general")}>
              Date generale
            </button>
            <button className={activeTab === "istoric" ? "active" : ""} onClick={() => setActiveTab("istoric")}>
              Istoric consultații <span>2</span>
            </button>
            

            <button className={activeTab === "monitorizare" ? "active" : ""} onClick={() => setActiveTab("monitorizare")}>
              Monitorizare
            </button>
          </div>

          {activeTab === "general" && (
            <>
              <div className="fisa-section">
                <h2>Identificare</h2>
                <div className="fisa-form-grid">
                  <label>Nume<input value={patient.name.split(" ")[1] || ""} readOnly /></label>
                  <label>Prenume<input value={patient.name.split(" ")[0] || ""} readOnly /></label>
                  <label>CNP<input value={patient.cnp} readOnly /></label>
                  <label>Sex<input value={patient.sex} readOnly /></label>
                  <label>Vârstă<input value={patient.age} readOnly /></label>
                  <label>Status<input value={patient.status} readOnly /></label>
                </div>
              </div>

              <div className="fisa-section">
                <h2>Contact & domiciliu</h2>
                <div className="fisa-form-grid">
                  <label>Telefon<input value={patient.phone} readOnly /></label>
                  <label>Email<input value={patient.email} readOnly /></label>
                  <label className="wide">Adresă<input value={patient.address} readOnly /></label>
                </div>
              </div>

              <div className="fisa-section">
                <h2>Date clinice</h2>
                <div className="fisa-form-grid">
                  <label>Puls<input value={patient.pulse} readOnly /></label>
                  <label>Temperatură<input value={patient.temp} readOnly /></label>
                  <label>ECG<input value={patient.ecg} readOnly /></label>
                  <label>Alergii<input value={patient.allergies} readOnly /></label>
                  <label className="wide">Istoric medical<textarea value={patient.history} readOnly /></label>
                  <label className="wide">Tratament<textarea value={patient.treatment} readOnly /></label>
                </div>
              </div>
            </>
          )}

          {activeTab === "istoric" && (
            <div className="fisa-section">
              <h2>Istoric consultații</h2>
              <div className="fisa-history-list">
                <div className="history-card">
                  <div className="history-icon orange">C</div>
                  <div className="history-body">
                    <h3>Cardiologie</h3>
                    <p>Azi, 10:30 · Dr. Andrei Popescu</p>
                    <small>Puls ridicat, monitorizare recomandată</small>
                  </div>
                  <span className="mini-badge orange">În desfășurare</span>
                </div>

                <div className="history-card">
                  <div className="history-icon green">C</div>
                  <div className="history-body">
                    <h3>Control periodic</h3>
                    <p>Ieri, 16:00 · Dr. Andrei Popescu</p>
                    <small>Evaluare periodică, parametri în limite normale</small>
                  </div>
                  <span className="mini-badge green">Finalizată</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "monitorizare" && (
            <div className="fisa-section">
              <h2>Monitorizare pacient</h2>
              <div className="monitoring-grid">
                <div className="monitor-card">
                  <p>Puls curent</p>
                  <h3>{patient.pulse}</h3>
                </div>
                <div className="monitor-card">
                  <p>Temperatură</p>
                  <h3>{patient.temp}</h3>
                </div>
                <div className="monitor-card">
                  <p>ECG</p>
                  <h3>{patient.ecg}</h3>
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