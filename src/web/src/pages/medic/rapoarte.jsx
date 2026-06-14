import "./rapoarte.css";
import { useEffect, useState } from "react";
import { getPatients, getConsultations } from "../../api";
import jsPDF from "jspdf";
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


const getInitialsFromName = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

const buildReports = (patients, consultations) => {
const consultationReports = patients.map((patient) => {
  const demo = patient.demographics || {};
  const patientName =
    [demo.nume, demo.prenume].filter(Boolean).join(" ") || "Pacient";

  const patientConsultations = consultations.filter(
    (c) => c.patientId === patient.id
  );

  const latestConsultation = patientConsultations[0];

  return {
    id: `patient-report-${patient.id}`,
    initials: getInitialsFromName(patientName),
    patient: patientName,
    type: "Raport pacient",
    content: latestConsultation?.motivPrezentare || "Raport medical pacient",
    status: latestConsultation?.status || "ACTIVE",
    date: latestConsultation
      ? formatDate(latestConsultation.visitedAt)
      : "—",
    source: {
      ...(latestConsultation || {}),
      demographics: demo,
      consultations: patientConsultations,
    },
  };
});

  return [...consultationReports];
};

function RapoarteMedic() {
  const [reports, setReports] = useState([]);
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
    const loadReports = async () => {
      try {
        const [patients, consultations] = await Promise.all([
          getPatients(),
          getConsultations(),
        ]);

        setReports(buildReports(patients, consultations));
      } catch (error) {
        console.log(error);
      }
    };

    loadReports();
  }, []);

  const filteredReports = reports.filter((r) =>
    `${r.patient} ${r.type} ${r.content} ${r.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

const cleanText = (text) =>
  String(text || "—")
    .replaceAll("ă", "a")
    .replaceAll("Ă", "A")
    .replaceAll("â", "a")
    .replaceAll("Â", "A")
    .replaceAll("î", "i")
    .replaceAll("Î", "I")
    .replaceAll("ș", "s")
    .replaceAll("Ș", "S")
    .replaceAll("ț", "t")
    .replaceAll("Ț", "T");

const handleGeneratePdf = (report) => {
  const doc = new jsPDF("p", "mm", "a4");
const patientReports =
  report.source?.consultations?.map((c) => ({
    ...report,
    date: formatDate(c.visitedAt),
    content: c.motivPrezentare,
    source: {
      ...c,
      demographics: report.source.demographics,
    },
  })) || [];
  const doctorName = formatDoctorName(localStorage.getItem("sw_email") || "");

  let y = 18;

  const addPageIfNeeded = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 18;
    }
  };

  const section = (title) => {
    addPageIfNeeded(18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(cleanText(title).toUpperCase(), 15, y);

    y += 3;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, y, 195, y);
    y += 9;
  };

  const row = (label, value) => {
    addPageIfNeeded(10);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.text(cleanText(label), 15, y);

    doc.setFont("helvetica", "normal");
    doc.text(cleanText(value), 65, y, { maxWidth: 125 });

    y += 7;
  };

  const paragraph = (label, value) => {
    addPageIfNeeded(18);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.text(cleanText(label), 15, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(cleanText(value), 175);
    doc.text(lines, 15, y);

    y += lines.length * 6 + 4;
  };

  // HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("SeniorWatch", 15, y);

  doc.setFontSize(13);
  doc.text("Raport medical pacient", 15, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data generarii: ${formatDate(new Date())}`, 130, y);
  doc.text(`Medic: ${cleanText(doctorName)}`, 130, y + 7);

  y += 20;

  doc.setDrawColor(0, 0, 0);
  doc.line(15, y, 195, y);
  y += 10;

  section("Date pacient");

  row("Nume pacient:", report.patient);

  const source = report.source || {};
  const demo = source.demographics || source.patient?.demographics || {};

  row("CNP:", demo.cnp || "Necompletat");
  row("Sex:", demo.sex || "Necompletat");
  row("Data nasterii:", demo.dataNasterii || "Necompletata");
  row("Telefon:", demo.telefon || "Necompletat");
  row("Email:", demo.email || "Necompletat");
  row(
    "Adresa:",
    [demo.strada, demo.localitate, demo.judet, demo.tara]
      .filter(Boolean)
      .join(", ") || "Necompletata"
  );

  section("Date consultatie");

  row("Medic curant:", doctorName);
  row("Data consultatie:", report.date);

  if (source.simptome) {
    paragraph("Simptome:", source.simptome);
  }

  if (source.diagnosticIcd10Display) {
    paragraph("Diagnostic:", source.diagnosticIcd10Display);
  }

  if (source.diagnosticIcd10Code) {
    row("Cod ICD-10:", source.diagnosticIcd10Code);
  }

  section("Istoric consultatii");

  patientReports.forEach((item, index) => {
    addPageIfNeeded(35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. Consultatie din ${cleanText(item.date)}`, 15, y);
    y += 7;

    doc.setFont("helvetica", "normal");

    doc.setFont("helvetica", "bold");
    doc.text("Motiv:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(cleanText(item.content), 45, y, { maxWidth: 145 });
    y += 7;

    if (item.source?.simptome) {
      doc.setFont("helvetica", "bold");
      doc.text("Simptome:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(cleanText(item.source.simptome), 45, y, { maxWidth: 145 });
      y += 7;
    }

    if (item.source?.diagnosticIcd10Display) {
      doc.setFont("helvetica", "bold");
      doc.text("Diagnostic:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(cleanText(item.source.diagnosticIcd10Display), 45, y, {
        maxWidth: 145,
      });
      y += 7;
    }

    if (item.source?.trimiteri) {
      doc.setFont("helvetica", "bold");
      doc.text("Trimiteri:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(cleanText(item.source.trimiteri), 45, y, { maxWidth: 145 });
      y += 7;
    }

    if (item.source?.retete) {
      doc.setFont("helvetica", "bold");
      doc.text("Reteta:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(cleanText(item.source.retete), 45, y, { maxWidth: 145 });
      y += 7;
    }

    y += 2;
    doc.setDrawColor(180, 180, 180);
    doc.line(15, y, 195, y);
    y += 8;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("SeniorWatch - document generat automat", 15, 287);

  doc.save(`raport_${cleanText(report.patient).replaceAll(" ", "_")}.pdf`);
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
          <a href="/medic/alerte">🔔 Alerte</a>
          <a className="active" href="/medic/rapoarte">📋 Rapoarte</a>
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
            <div className="icon purple">📋</div>
            <div>
              <p>Rapoarte totale</p>
              <h2>{reports.length}</h2>
              <span>generate din datele existente</span>
            </div>
          </div>
        </section>

        <section className="content rapoarte-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Rapoarte generate</h1>
              </div>

              <div className="rapoarte-tools">
                <div className="rapoarte-search">
                  <input
                    placeholder="Caută pacient"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button">Caută</button>
                </div>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader rapoarte-row">
                <span>Pacient</span>
                <span>Acțiuni</span>
              </div>

              {filteredReports.map((r) => (
                <div className="tableRow rapoarte-row" key={r.id}>
                  <span className="patientName">
                    <b>{r.initials}</b>
                    {r.patient}
                  </span>

                  <span className="rapoarteActions">
                    <button type="button" onClick={() => handleGeneratePdf(r)}>
                      Export PDF
                    </button>
                  </span>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="emptySearchMessage">
                  Nu există rapoarte pentru această căutare.
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default RapoarteMedic;