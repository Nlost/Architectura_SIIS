import "./consultatii.css";
import { useEffect, useState } from "react";
import { getPatients, getConsultations, createConsultation, createRecommendation, finalizeConsultation } from "../../api";

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



const formatTimeOnly = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const toLocalDateKey = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const getCalendarDays = (baseDate, consultations) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startMondayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const startDate = new Date(year, month, 1 - startMondayOffset);

  const days = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dateKey = toLocalDateKey(date);
    const dayOfWeek = date.getDay();

    days.push({
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      appointments: consultations.filter(
        (c) => toLocalDateKey(c.visitedAt) === dateKey
      ),
    });
  }

  return days;
};
const getMonthLabel = (date) =>
  date.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });



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

const validateConsultationDate = (value, consultations) => {
  if (!value) return "Alege data și ora consultației.";

  const selectedDate = new Date(value);
  const now = new Date();

  if (Number.isNaN(selectedDate.getTime())) {
    return "Data aleasă nu este validă.";
  }

  if (selectedDate < now) {
    return "Consultația nu poate fi programată în trecut.";
  }

  const day = selectedDate.getDay();
  const hour = selectedDate.getHours();
  const minutes = selectedDate.getMinutes();

let errors = [];

if (day === 0 || day === 6) {
  errors.push("Nu se pot face programări în weekend.");
}

if (hour < 8 || hour > 17 || (hour === 17 && minutes > 40)) {
  errors.push("Programul este 08:00 - 18:00.");
}

if (![0, 20, 40].includes(minutes)) {
  errors.push("Programările se fac din 20 în 20 de minute (00, 20, 40).");
}

if (errors.length) {
  return errors.join(" ");
}

  const selectedTime = selectedDate.getTime();

  const alreadyBooked = consultations.some((c) => {
    const visitTime = new Date(c.visitedAt).getTime();
    return visitTime === selectedTime;
  });

  if (alreadyBooked) {
    return "Există deja o consultație programată la această oră.";
  }

  return "";
};

function ConsultatiiMedic() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  const [newConsultation, setNewConsultation] = useState(initialConsultation);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateError, setDateError] = useState("");

  const [patientsList, setPatientsList] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const [saving, setSaving] = useState(false);

  const doctorEmail = localStorage.getItem("sw_email") || "";
  const doctorName = formatDoctorName(doctorEmail);
const [selectedConsultation, setSelectedConsultation] = useState(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [editingConsultation, setEditingConsultation] = useState(null);
const [selectedCalendarDate, setSelectedCalendarDate] = useState(
  new Date().toISOString().slice(0, 10)
);
const [calendarMonthDate, setCalendarMonthDate] = useState(new Date());
const changeCalendarMonth = (direction) => {
  setCalendarMonthDate((prev) => {
    const next = new Date(prev);
    next.setMonth(prev.getMonth() + direction);
    return next;
  });
};
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

const isToday = (dateValue) => {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const stats = {
  consultatiiAzi: consultations.filter((c) => isToday(c.visitedAt)).length,
  finalizate: consultations.filter((c) => c.status === "ARCHIVED").length,
  necesitaAtentie: consultations.filter(
    (c) => c.simptome && c.simptome.trim() !== ""
  ).length,
  programate: consultations.filter(
    (c) => c.status !== "ARCHIVED" && isToday(c.visitedAt)
  ).length,
};

  const isFormValid =
    newConsultation.patient_id &&
    newConsultation.visited_at &&
    newConsultation.motiv_prezentare &&
    !dateError;

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

    if (name === "visited_at") {
      const error = validateConsultationDate(value, consultations);
      setDateError(error);

      setNewConsultation({
        ...newConsultation,
        visited_at: value,
      });

      return;
    }

    setNewConsultation({
      ...newConsultation,
      [name]: value,
    });
  };
const handleFinalizeConsultation = async (consultationId) => {
  try {
    await finalizeConsultation(consultationId);

    const updated = await getConsultations();
    setConsultations(updated);

    alert("Consultația a fost finalizată.");
  } catch (error) {
    console.error(error);
    alert("Nu s-a putut finaliza consultația.");
  }
};
const closeAddModal = () => {
  setShowAddModal(false);
  setEditingConsultation(null);
  setNewConsultation(initialConsultation);
  setDateError("");
};

const openCompleteConsultation = (consultation) => {
  setEditingConsultation(consultation);

  setNewConsultation({
    patient_id: consultation.patientId || "",
    pacient: consultation.patientName || "",
    visited_at: consultation.visitedAt
      ? new Date(consultation.visitedAt).toISOString().slice(0, 16)
      : "",
    motiv_prezentare: consultation.motivPrezentare || "",
    simptome: consultation.simptome || "",
    diagnostic_icd10_code: consultation.diagnosticIcd10Code || "",
    diagnostic_icd10_display: consultation.diagnosticIcd10Display || "",
    trimiteri: consultation.trimiteri || "",
    retete: consultation.retete || "",
    recommendation_title: "",
    recommendation_duration: "",
    recommendation_notes: "",
  });

  setDateError("");
  setShowAddModal(true);
};

  const handleAddConsultation = async (e) => {
    e.preventDefault();

    if (!isFormValid || saving) return;

    const finalPayload = {
      patientId: newConsultation.patient_id,
      visitedAt: new Date(newConsultation.visited_at).toISOString(),
      motivPrezentare: newConsultation.motiv_prezentare,
      simptome: newConsultation.simptome,
      diagnosticIcd10Code: newConsultation.diagnostic_icd10_code,
      diagnosticIcd10Display: newConsultation.diagnostic_icd10_display,
      trimiteri: newConsultation.trimiteri,
      retete: newConsultation.retete,
    };

    setSaving(true);

    try {
      console.log("=== CONSULTATION PAYLOAD ===");
      console.log(finalPayload);
      console.log(JSON.stringify(finalPayload, null, 2));
if (editingConsultation) {
  console.log("=== UPDATE CONSULTATION PAYLOAD ===");
  console.log(editingConsultation.id, finalPayload);

  setConsultations((prev) =>
    prev.map((c) =>
      c.id === editingConsultation.id
        ? {
            ...c,
            visitedAt: finalPayload.visitedAt,
            motivPrezentare: finalPayload.motivPrezentare,
            simptome: finalPayload.simptome,
            diagnosticIcd10Code: finalPayload.diagnosticIcd10Code,
            diagnosticIcd10Display: finalPayload.diagnosticIcd10Display,
            trimiteri: finalPayload.trimiteri,
            retete: finalPayload.retete,
          }
        : c
    )
  );

  closeAddModal();
  return;
}
      await createConsultation(finalPayload);

      const hasRecommendation =
        newConsultation.recommendation_title ||
        newConsultation.recommendation_duration ||
        newConsultation.recommendation_notes;

      if (hasRecommendation) {
        await createRecommendation({
          patientId: newConsultation.patient_id,
          tipActivitate: newConsultation.recommendation_title,
          durataZilnicaMinute: newConsultation.recommendation_duration
            ? Number(newConsultation.recommendation_duration)
            : null,
          alteIndicatii: newConsultation.recommendation_notes,
        });
      }

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
Calendar programări              
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
  <button
  type="button"
  onClick={() => {
    setSelectedConsultation(c);
    setShowDetailsModal(true);
  }}
>
  Detalii
</button>
{c.status !== "ARCHIVED" && (
  <>

<button type="button" onClick={() => openCompleteConsultation(c)}>
  Completează
</button>

<button
  type="button"
  onClick={() => handleFinalizeConsultation(c.id)}
>
  Finalizează
</button>         
  </>
  )}
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
<h2>{editingConsultation ? "Completează consultația" : "Consultație nouă"}</h2>                </div>

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
                          step="1200"
                        value={newConsultation.visited_at}
                        onChange={handleChange}
                        required
                      />
                      {dateError && (
                        <small className="fieldError">{dateError}</small>
                      )}
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
{saving
  ? "Se salvează…"
  : editingConsultation
  ? "Salvează completarea"
  : "Salvează consultația"}                </button>
              </div>
            </div>
          </div>
        )}
{showAppointmentsModal && (
  <div className="consultatieModalOverlay">
    <div className="calendarBigModal">
      <div className="consultatieModalHeader">
        <div className="consultatieModalIcon">📅</div>

        <div>
<div className="calendarHeaderContent">
  <div>
    <h2>Calendar programări</h2>
  </div>

  <div className="calendarHeaderActions">
    <button type="button" onClick={() => changeCalendarMonth(-1)}>
      ‹
    </button>

    <strong>{getMonthLabel(calendarMonthDate)}</strong>

    <button type="button" onClick={() => changeCalendarMonth(1)}>
      ›
    </button>
  </div>
</div>
        </div>

        <button
          className="closeConsultatieModalBtn"
          type="button"
          onClick={() => setShowAppointmentsModal(false)}
        >
          ×
        </button>
      </div>

      <div className="calendarLayout">
        <div className="calendarLeft">
          <div className="calendarWeekHeader">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mie</span>
            <span>Joi</span>
            <span>Vin</span>
            <span>Sâm</span>
            <span>Dum</span>
          </div>

          <div className="calendarMonthGrid">
            {getCalendarDays(calendarMonthDate, consultations).map((day) => (
              <button
  type="button"
  disabled={day.isWeekend}
  className={[
    "calendarCell",
    !day.isCurrentMonth ? "otherMonth" : "",
    day.isWeekend ? "weekendDay" : "",
    selectedCalendarDate === day.dateKey ? "selectedDay" : "",
    day.appointments.length > 0 ? "hasAppointments" : "",
  ].join(" ")}
  onClick={() => {
    if (!day.isWeekend) {
      setSelectedCalendarDate(day.dateKey);
    }
  }}
>
                <strong>{day.dayNumber}</strong>

                {day.appointments.length > 0 ? (
                  <small>{day.appointments.length} programări</small>
                ) : (
                  <small>—</small>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="calendarRight">
          <div className="selectedDayHeader">
            <h3>Programările zilei</h3>
            <span>{selectedCalendarDate}</span>
          </div>

          {consultations.filter(
            (c) => toLocalDateKey(c.visitedAt) === selectedCalendarDate
          ).length === 0 && (
            <p className="noAppointmentsText">Nu există programări.</p>
          )}

          <div className="selectedDayList">
            {consultations
              .filter((c) => toLocalDateKey(c.visitedAt) === selectedCalendarDate)
              .map((appointment) => (
                <div className="selectedAppointmentCard" key={appointment.id}>
                  <div className="appointmentHour">
                    {formatTimeOnly(appointment.visitedAt)}
                  </div>

                  <div>
                    <h4>{appointment.patientName || "Pacient"}</h4>
                    <p>{appointment.motivPrezentare || "Fără motiv"}</p>
                    <span>
                      {appointment.status === "ARCHIVED"
                        ? "Finalizată"
                        : "Activă"}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <button
            className="addSelectedDayBtn"
            type="button"
            onClick={() => {
              setShowAppointmentsModal(false);
              setShowAddModal(true);
              setNewConsultation({
                ...initialConsultation,
                visited_at: `${selectedCalendarDate}T08:00`,
              });
            }}
          >
            + Programare pentru ziua selectată
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {showDetailsModal && selectedConsultation && (
  <div className="consultatieModalOverlay">
    <div className="programariModal">
      <div className="consultatieModalHeader">
        <div className="consultatieModalIcon">🩺</div>

        <div>
          <h2>Detalii consultație</h2>
          <p>{selectedConsultation.patientName || "Pacient"}</p>
        </div>

        <button
          className="closeConsultatieModalBtn"
          type="button"
          onClick={() => {
            setShowDetailsModal(false);
            setSelectedConsultation(null);
          }}
        >
          ×
        </button>
      </div>

<div className="consultatieDetailsForm">
  <div className="consultatieSection">
    <div className="sectionTitle">
      <h3>Date programare</h3>
    </div>

    <div className="consultatieFormGrid twoCols">
      <label>
        Pacient
        <input value={selectedConsultation.patientName || "—"} readOnly />
      </label>

      <label>
        Data programării
        <input value={formatDate(selectedConsultation.visitedAt)} readOnly />
      </label>

      <label>
        Motiv
        <input value={selectedConsultation.motivPrezentare || "—"} readOnly />
      </label>

      <label>
        Status
        <input
          value={
            selectedConsultation.status === "ACTIVE"
              ? "Programată / activă"
              : "Finalizată"
          }
          readOnly
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
          value={selectedConsultation.simptome || "Nu a fost completat încă."}
          readOnly
        />
      </label>

      <label>
        Diagnostic
        <textarea
          value={
            selectedConsultation.diagnosticIcd10Display ||
            "Nu a fost completat încă."
          }
          readOnly
        />
      </label>

      <label>
        Cod ICD-10
        <input
          value={
            selectedConsultation.diagnosticIcd10Code ||
            "Nu a fost completat încă."
          }
          readOnly
        />
      </label>

      <label>
        Trimiteri
        <input
          value={selectedConsultation.trimiteri || "Nu au fost completate încă."}
          readOnly
        />
      </label>

      <label className="fullField">
        Rețete
        <textarea
          value={selectedConsultation.retete || "Nu au fost completate încă."}
          readOnly
        />
      </label>
    </div>
  </div>
</div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

export default ConsultatiiMedic;