import "./consultatii.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialConsultation = {
  patient_id: "",
  pacient: "",
  visited_at: "",
  tip: "",
  motiv_prezentare: "",
  simptome: "",
  diagnostic_icd10_code: "",
  diagnostic_icd10_display: "",
  trimiteri: "",
  retete: "",

  // recomandări pentru tabela recommendations
  recommendation_title: "",
  recommendation_duration: "",
  recommendation_notes: "",
};

const patientsList = [
  { id: "p1", nume: "Maria Ionescu", varsta: "71 ani" },
  { id: "p2", nume: "Ion Popescu", varsta: "67 ani" },
  { id: "p3", nume: "Elena Matei", varsta: "64 ani" },
  { id: "p4", nume: "Victor Radu", varsta: "59 ani" },
  { id: "p5", nume: "Ana Pop", varsta: "53 ani" },
];

const consultations = [
  ["MI", "Maria Ionescu", "71 ani", "Azi, 10:30", "Cardiologie", "Puls ridicat", "În desfășurare"],
  ["IP", "Ion Popescu", "67 ani", "Azi, 12:00", "Control", "Evaluare periodică", "Programată"],
  ["EM", "Elena Matei", "64 ani", "Azi, 14:20", "Cardiologie", "Oboseală la efort", "Programată"],
  ["VR", "Victor Radu", "59 ani", "Ieri, 16:00", "Control", "Temperatură crescută", "Finalizată"],
  ["AP", "Ana Pop", "53 ani", "Ieri, 18:30", "Monitorizare", "Sincronizare senzor", "Finalizată"],
];

function ConsultatiiMedic() {
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newConsultation, setNewConsultation] = useState(initialConsultation);

  const isFormValid =
    newConsultation.patient_id &&
    newConsultation.visited_at &&
    newConsultation.tip &&
    newConsultation.motiv_prezentare;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "patient_id") {
      const selectedPatient = patientsList.find((p) => p.id === value);

      setNewConsultation({
        ...newConsultation,
        patient_id: value,
        pacient: selectedPatient ? selectedPatient.nume : "",
      });

      return;
    }

    setNewConsultation({
      ...newConsultation,
      [name]: value,
    });
  };

  const handleAddConsultation = (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    const consultationPayload = {
      patient_id: newConsultation.patient_id,
      visited_at: newConsultation.visited_at,
      tip: newConsultation.tip,
      motiv_prezentare: newConsultation.motiv_prezentare,
      simptome: newConsultation.simptome,
      diagnostic_icd10_code: newConsultation.diagnostic_icd10_code,
      diagnostic_icd10_display: newConsultation.diagnostic_icd10_display,
      trimiteri: newConsultation.trimiteri,
      retete: newConsultation.retete,
    };

    const recommendationPayload = {
      patient_id: newConsultation.patient_id,
      tip_activitate: newConsultation.recommendation_title,
      durata_zilnica_minute: newConsultation.recommendation_duration,
      alte_indicatii: newConsultation.recommendation_notes,
    };

    console.log("Consultație nouă:", consultationPayload);

    if (
      newConsultation.recommendation_title ||
      newConsultation.recommendation_duration ||
      newConsultation.recommendation_notes
    ) {
      console.log("Recomandare nouă:", recommendationPayload);
    }

    setShowAddModal(false);
    setNewConsultation(initialConsultation);
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
          <a onClick={() => navigate("/medic")}>📊 Dashboard</a>
          <a onClick={() => navigate("/medic/pacienti")}>👥 Pacienți</a>
          <a className="active">🩺 Consultații</a>
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
        <section className="stats">
          <div className="stat">
            <div className="icon purple">🩺</div>
            <div>
              <p>Consultații azi</p>
              <h2>14</h2>
              <span>program aproape complet</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">✅</div>
            <div>
              <p>Finalizate</p>
              <h2>8</h2>
              <span>în ultimele 24h</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">🔔</div>
            <div>
              <p>Necesită atenție</p>
              <h2>3</h2>
              <span>cu simptome importante</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">📅</div>
            <div>
              <p>Programate</p>
              <h2>6</h2>
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
                  <input placeholder="Caută după pacient / diagnostic / tip" />
                  <button>Caută</button>
                </div>

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
                <span>Tip</span>
                <span>Motiv</span>
                <span>Status</span>
                <span>Acțiuni</span>
              </div>

              {consultations.map((c, index) => (
                <div className="tableRow consultatii-row" key={index}>
                  <span className="patientName">
                    <b>{c[0]}</b>
                    {c[1]}
                  </span>

                  <span>{c[2]}</span>
                  <span>{c[3]}</span>
                  <span>{c[4]}</span>
                  <span>{c[5]}</span>

                  <span className={`consultatie-badge ${c[6].replaceAll(" ", "")}`}>
                    {c[6]}
                  </span>

                  <span className="consultatieActions">
                    <button>Detalii</button>
                    <button>Editează</button>
                    <button>Închide</button>
                  </span>
                </div>
              ))}
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
                  <p>Completează datele consultației conform fișei clinice.</p>
                </div>

                <button
                  className="closeConsultatieModalBtn"
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewConsultation(initialConsultation);
                  }}
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

                  <div className="consultatieFormGrid threeCols">
                    <label>
                      Pacient *
                      <select
                        name="patient_id"
                        value={newConsultation.patient_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Alege pacient</option>
                        {patientsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nume}
                          </option>
                        ))}
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

                    <label>
                      Tip consultație *
                      <select
                        name="tip"
                        value={newConsultation.tip}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Alege tip</option>
                        <option value="Control">Control</option>
                        <option value="Cardiologie">Cardiologie</option>
                        <option value="Monitorizare">Monitorizare</option>
                        <option value="Urgență">Urgență</option>
                      </select>
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
                      Recomandare
                      <input
                        name="recommendation_title"
                        value={newConsultation.recommendation_title}
                        onChange={handleChange}
                        placeholder="ex: Plimbare zilnică"
                      />
                    </label>

                    <label>
                      Durată zilnică (minute)
                      <input
                        type="number"
                        name="recommendation_duration"
                        value={newConsultation.recommendation_duration}
                        onChange={handleChange}
                        placeholder="ex: 30"
                      />
                    </label>

                    <label className="fullField">
                      Indicații medic
                      <textarea
                        name="recommendation_notes"
                        value={newConsultation.recommendation_notes}
                        onChange={handleChange}
                        placeholder="Scrie recomandările pentru pacient..."
                      />
                    </label>
                  </div>
                </div>
              </form>

              <div className="consultatieModalActions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewConsultation(initialConsultation);
                  }}
                >
                  Renunță
                </button>

                <button
                  type="submit"
                  form="addConsultationForm"
                  disabled={!isFormValid}
                >
                  Salvează consultația
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsultatiiMedic;