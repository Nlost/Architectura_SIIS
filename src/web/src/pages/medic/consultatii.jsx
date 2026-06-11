import "./consultatii.css";
import { useEffect, useState } from "react";
import { getPatients, getConsultations, createConsultation } from "../../api";

const initialConsultation = {
  patient_id: "",
  pacient: "",
  visited_at: "",
  motiv_prezentare: "",
  simptome: "",
  diagnostic_icd10_code: "",
  diagnostic_icd10_display: "",
  trimiteri: "",
  retete: "",

  recommendation_title: "",
  recommendation_duration: "",
  recommendation_notes: "",
};

const todayAppointments = [
  {
    ora: "09:00",
    pacient: "Maria Ionescu",
    motiv: "Control tensiune",
    telefon: "0712345678",
    status: "Confirmată",
  },
  {
    ora: "11:30",
    pacient: "Ion Popescu",
    motiv: "Evaluare periodică",
    telefon: "0723456789",
    status: "Confirmată",
  },
  {
    ora: "14:00",
    pacient: "Elena Matei",
    motiv: "Oboseală la efort",
    telefon: "0734567890",
    status: "În așteptare",
  },
];

const formatDoctorName = (email) => {
  if (!email) return "Medic";

  const username = email.split("@")[0];

  const parts = username
    .split(".")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

  if (parts.length >= 2) {
    return `Dr. ${parts.join(" ")}`;
  }

  return `Dr. ${parts[0] || "Medic"}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ConsultatiiMedic() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  const [newConsultation, setNewConsultation] = useState(initialConsultation);
  const [searchTerm, setSearchTerm] = useState("");

  const [patientsList, setPatientsList] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const [saving, setSaving] = useState(false);

  const doctorEmail = localStorage.getItem("sw_email") || "";
  const doctorName = formatDoctorName(doctorEmail);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatientsList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadConsultations = async () => {
    try {
      const data = await getConsultations();
      setConsultations(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPatients();
    loadConsultations();
  }, []);

  const filteredConsultations = consultations.filter((c) =>
    c.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    consultatiiAzi: 0,
    finalizate: 0,
    necesitaAtentie: 0,
    programate: 0,
  };

  const isFormValid =
    newConsultation.patient_id &&
    newConsultation.visited_at &&
    newConsultation.motiv_prezentare;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "patient_id") {
      const selectedPatient = patientsList.find((p) => p.id === value);
      const d = selectedPatient?.demographics || {};
      const fullName = [d.nume, d.prenume].filter(Boolean).join(" ");

      setNewConsultation({
        ...newConsultation,
        patient_id: value,
        pacient: fullName,
      });

      return;
    }

    setNewConsultation({
      ...newConsultation,
      [name]: value,
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewConsultation(initialConsultation);
  };

  const handleAddConsultation = async (e) => {
    e.preventDefault();

    if (!isFormValid || saving) return;

    const finalPayload = {
      patientId: newConsultation.patient_id,
      visitedAt: newConsultation.visited_at,
      motivPrezentare: newConsultation.motiv_prezentare,
      simptome: newConsultation.simptome,
      diagnosticIcd10Code: newConsultation.diagnostic_icd10_code,
      diagnosticIcd10Display: newConsultation.diagnostic_icd10_display,
      trimiteri: newConsultation.trimiteri,
      retete: newConsultation.retete,
    };

    setSaving(true);

    try {
      await createConsultation(finalPayload);
      await loadConsultations();

      closeAddModal();
    } catch (error) {
      console.log(error);
      alert("Eroare la salvarea consultației.");
    } finally {
      setSaving(false);
    }
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
          <a className="active" href="/medic/consultatii">
            🩺 Consultații
          </a>
          <a href="/medic/monitorizare">📈 Monitorizare</a>
          <a href="/medic/alerte">🔔 Alerte</a>
          <a href="/medic/rapoarte">📋 Rapoarte</a>
          <a href="/medic/hl7">🔗 HL7 FHIR</a>
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
        <section className="stats">
          <div className="stat">
            <div className="icon purple">🩺</div>
            <div>
              <p>Consultații azi</p>
              <h2>{stats.consultatiiAzi}</h2>
              <span>program aproape complet</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">✅</div>
            <div>
              <p>Finalizate</p>
              <h2>{stats.finalizate}</h2>
              <span>în ultimele 24h</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">🔔</div>
            <div>
              <p>Necesită atenție</p>
              <h2>{stats.necesitaAtentie}</h2>
              <span>cu simptome importante</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">📅</div>
            <div>
              <p>Programate</p>
              <h2>{stats.programate}</h2>
              <span>urmează astăzi</span>
            </div>
          </div>
        </section>

        <section className="content consultatii-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Consultațiile mele</h1>
              </div>

              <div className="consultatii-tools">
                <div className="consultatii-search">
                  <span>⌕</span>
                  <input
                    placeholder="Caută după pacient"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button">Caută</button>
                </div>

                <button
                  className="programari-azi-btn"
                  type="button"
                  onClick={() => setShowAppointmentsModal(true)}
                >
                  Programări azi
                </button>

                <button
                  className="add-consultatie-btn"
                  type="button"
                  onClick={() => setShowAddModal(true)}
                >
                  + Consultație nouă
                </button>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader consultatii-row">
                <span>Pacient</span>
                <span>Vârstă</span>
                <span>Data</span>
                <span>Diagnostic</span>
                <span>Motiv</span>
                <span>Status</span>
                <span>Acțiuni</span>
              </div>

              {filteredConsultations.map((c) => (
                <div className="tableRow consultatii-row" key={c.id}>
                  <span className="patientName">
                    <b>{c.patientInitials || "?"}</b>
                    {c.patientName || "Pacient"}
                  </span>

                  <span>{c.age ? `${c.age} ani` : "—"}</span>
                  <span>{formatDate(c.visitedAt)}</span>
                  <span>{c.diagnosticIcd10Code || "—"}</span>
                  <span>{c.motivPrezentare || "—"}</span>

                  <span className="consultatie-badge ACTIVE">
                    {c.status || "ACTIVE"}
                  </span>

                  <span className="consultatieActions">
                    <button>Detalii</button>
                    <button>Editează</button>
                    <button>Închide</button>
                  </span>
                </div>
              ))}

              {filteredConsultations.length === 0 && (
                <div className="emptySearchMessage">
                  Nu există consultații înregistrate momentan.
                </div>
              )}
            </div>
          </div>
        </section>

        {showAddModal && (
          <div className="consultatieModalOverlay">
            <div className="consultatieModal">
              <div className="consultatieModalHeader">
                <div className="consultatieModalIcon">🩺</div>

                <div>
                  <h2>Consultație nouă</h2>
                </div>

                <button
                  className="closeConsultatieModalBtn"
                  type="button"
                  onClick={closeAddModal}
                >
                  ×
                </button>
              </div>

              <form
                id="addConsultationForm"
                className="consultatieForm"
                onSubmit={handleAddConsultation}
              >
                <div className="consultatieSection">
                  <div className="sectionTitle">
                    <h3>Date consultație</h3>
                  </div>

                  <div className="consultatieFormGrid twoCols">
                    <label>
                      Pacient *
                      <select
                        name="patient_id"
                        value={newConsultation.patient_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Alege pacient</option>

                        {patientsList.map((p) => {
                          const d = p.demographics || {};
                          const fullName = [d.nume, d.prenume]
                            .filter(Boolean)
                            .join(" ");

                          return (
                            <option key={p.id} value={p.id}>
                              {fullName || "Pacient fără nume"}
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    <label>
                      Data și ora *
                      <input
                        name="visited_at"
                        type="datetime-local"
                        value={newConsultation.visited_at}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label className="fullField">
                      Motiv prezentare *
                      <input
                        name="motiv_prezentare"
                        value={newConsultation.motiv_prezentare}
                        onChange={handleChange}
                        placeholder="ex: Puls ridicat, evaluare periodică..."
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="consultatieSection">
                  <div className="sectionTitle">
                    <h3>Date medicale</h3>
                  </div>

                  <div className="consultatieFormGrid twoCols">
                    <label>
                      Simptome
                      <textarea
                        name="simptome"
                        value={newConsultation.simptome}
                        onChange={handleChange}
                        placeholder="Descriere simptome..."
                      />
                    </label>

                    <label>
                      Diagnostic
                      <textarea
                        name="diagnostic_icd10_display"
                        value={newConsultation.diagnostic_icd10_display}
                        onChange={handleChange}
                        placeholder="Diagnostic clinic..."
                      />
                    </label>

                    <label>
                      Cod ICD-10
                      <input
                        name="diagnostic_icd10_code"
                        value={newConsultation.diagnostic_icd10_code}
                        onChange={handleChange}
                        placeholder="ex: I10"
                      />
                    </label>

                    <label>
                      Trimiteri
                      <input
                        name="trimiteri"
                        value={newConsultation.trimiteri}
                        onChange={handleChange}
                        placeholder="ex: cardiologie, analize..."
                      />
                    </label>

                    <label className="fullField">
                      Rețete
                      <textarea
                        name="retete"
                        value={newConsultation.retete}
                        onChange={handleChange}
                        placeholder="Medicație recomandată..."
                      />
                    </label>
                  </div>
                </div>

                <div className="consultatieSection">
                  <div className="sectionTitle">
                    <h3>Recomandări medicale</h3>
                  </div>

                  <div className="consultatieFormGrid twoCols">
                    <label>
                      Tip recomandare
                      <input
                        name="recommendation_title"
                        value={newConsultation.recommendation_title}
                        onChange={handleChange}
                        placeholder="ex: plimbare, bicicletă, alergat..."
                      />
                    </label>

                    <label>
                      Durată zilnică minute
                      <input
                        type="number"
                        min="0"
                        name="recommendation_duration"
                        value={newConsultation.recommendation_duration}
                        onChange={handleChange}
                        placeholder="ex: 30"
                      />
                    </label>

                    <label className="fullField">
                      Alte indicații
                      <textarea
                        name="recommendation_notes"
                        value={newConsultation.recommendation_notes}
                        onChange={handleChange}
                        placeholder="ex: monitorizare puls după efort, hidratare, pauze..."
                      />
                    </label>
                  </div>
                </div>
              </form>

              <div className="consultatieModalActions">
                <button type="button" onClick={closeAddModal}>
                  Renunță
                </button>

                <button
                  type="submit"
                  form="addConsultationForm"
                  disabled={!isFormValid || saving}
                >
                  {saving ? "Se salvează…" : "Salvează consultația"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAppointmentsModal && (
          <div className="consultatieModalOverlay">
            <div className="programariModal">
              <div className="consultatieModalHeader">
                <div className="consultatieModalIcon">📅</div>

                <div>
                  <h2>Programările de azi</h2>
                </div>

                <button
                  className="closeConsultatieModalBtn"
                  type="button"
                  onClick={() => setShowAppointmentsModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="programariList">
                {todayAppointments.map((appointment, index) => (
                  <div className="programareCard" key={index}>
                    <div>
                      <strong>{appointment.ora}</strong>
                      <span>{appointment.status}</span>
                    </div>

                    <div>
                      <h3>{appointment.pacient}</h3>
                      <p>{appointment.motiv}</p>
                      <small>Telefon: {appointment.telefon}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsultatiiMedic;