import "./monitorizare.css";
import { useEffect, useState } from "react";
import { getPatients } from "../../api";

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

const getPatientName = (patient) => {
  const d = patient.demographics || {};
  return [d.nume, d.prenume].filter(Boolean).join(" ") || "Pacient";
};

const getInitials = (patient) => {
  const d = patient.demographics || {};
  const nume = d.nume || "";
  const prenume = d.prenume || "";

  return `${nume.charAt(0)}${prenume.charAt(0)}`.toUpperCase() || "?";
};

const getStatus = (sample) => {
  if (!sample) return "Fără date";

  const puls = Number(sample.puls);
  const temperatura = Number(sample.temperatura);

  if (puls > 100 || temperatura >= 37.5) {
    return "Alertă";
  }

  if (puls >= 90 || temperatura >= 37.2) {
    return "Observație";
  }

  return "Stabil";
};

const average = (values) => {
  const validValues = values
    .map(Number)
    .filter((v) => !Number.isNaN(v));

  if (validValues.length === 0) return null;

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

function MonitorizareMedic() {
  const [patientsList, setPatientsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const doctorEmail = localStorage.getItem("sw_email") || "";
  const doctorName = formatDoctorName(doctorEmail);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getPatients();
        setPatientsList(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadPatients();
  }, []);

  const monitoredPatients = patientsList.filter((patient) =>
    getPatientName(patient).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patientsWithSamples = patientsList.filter((p) => p.latestSample);

  const avgPulse = average(
    patientsWithSamples.map((p) => p.latestSample?.puls)
  );

  const avgTemperature = average(
    patientsWithSamples.map((p) => p.latestSample?.temperatura)
  );

  const activeAlerts = patientsWithSamples.filter(
    (p) => getStatus(p.latestSample) === "Alertă"
  ).length;

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
          <a className="active" href="/medic/monitorizare">
            📈 Monitorizare
          </a>
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
            <div className="icon purple">📡</div>
            <div>
              <p>Pacienți monitorizați</p>
              <h2>{patientsWithSamples.length}</h2>
              <span>cu date de la senzori</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">❤</div>
            <div>
              <p>Puls mediu</p>
              <h2>{avgPulse ? `${Math.round(avgPulse)} bpm` : "—"}</h2>
              <span>calculat din ultimele valori</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">🌡</div>
            <div>
              <p>Temperatură medie</p>
              <h2>
                {avgTemperature ? `${avgTemperature.toFixed(1)}°C` : "—"}
              </h2>
              <span>din ultimele măsurători</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">⚠</div>
            <div>
              <p>Alerte active</p>
              <h2>{activeAlerts}</h2>
              <span>necesită verificare</span>
            </div>
          </div>
        </section>

        <section className="content monitorizare-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <p>DATE SENZORI</p>
                <h2>Monitorizare pacienți</h2>
              </div>

              <div className="monitorizare-search">
                <span>⌕</span>
                <input
                  placeholder="Caută pacient monitorizat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="button">Caută</button>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader monitorizare-row">
                <span>Pacient</span>
                <span>Puls</span>
                <span>Temperatură</span>
                <span>Umiditate</span>
                <span>Status</span>
              </div>

              {monitoredPatients.map((patient) => {
                const sample = patient.latestSample;
                const status = getStatus(sample);

                return (
                  <div className="tableRow monitorizare-row" key={patient.id}>
                    <span className="patientName">
                      <b>{getInitials(patient)}</b>
                      {getPatientName(patient)}
                    </span>

                    <span className={sample?.puls > 100 ? "dangerText" : ""}>
                      {sample?.puls ? `${sample.puls} bpm` : "—"}
                    </span>

                    <span>
                      {sample?.temperatura
                        ? `${sample.temperatura}°C`
                        : "—"}
                    </span>

                    <span>
                      {sample?.umiditate
                        ? `${sample.umiditate}%`
                        : "—"}
                    </span>

                    <span className={`badge ${status}`}>{status}</span>
                  </div>
                );
              })}

              {monitoredPatients.length === 0 && (
                <div className="emptySearchMessage">
                  Nu există pacienți monitorizați pentru această căutare.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MonitorizareMedic;