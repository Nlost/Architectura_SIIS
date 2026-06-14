import "./pacienti.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients, createPatient } from "../../api";
import { logoutUser } from "../../api";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};

const initialNewPatient = {
  nume: "",
  prenume: "",
  cnp: "",
  sex: "",
  data_nasterii: "",
  varsta: "",
  telefon: "",
  email: "",
  localitate: "",
  judet: "",
  strada: "",
  cod_postal: "",
  tara: "Romania",
  profesie: "",
  loc_de_munca: "",
};

const judeteCNP = {
  "01": "Alba", "02": "Arad", "03": "Argeș", "04": "Bacău",
  "05": "Bihor", "06": "Bistrița-Năsăud", "07": "Botoșani",
  "08": "Brașov", "09": "Brăila", "10": "Buzău",
  "11": "Caraș-Severin", "12": "Cluj", "13": "Constanța",
  "14": "Covasna", "15": "Dâmbovița", "16": "Dolj",
  "17": "Galați", "18": "Gorj", "19": "Harghita",
  "20": "Hunedoara", "21": "Ialomița", "22": "Iași",
  "23": "Ilfov", "24": "Maramureș", "25": "Mehedinți",
  "26": "Mureș", "27": "Neamț", "28": "Olt",
  "29": "Prahova", "30": "Satu Mare", "31": "Sălaj",
  "32": "Sibiu", "33": "Suceava", "34": "Teleorman",
  "35": "Timiș", "36": "Tulcea", "37": "Vaslui",
  "38": "Vâlcea", "39": "Vrancea", "40": "București",
  "41": "București Sector 1", "42": "București Sector 2",
  "43": "București Sector 3", "44": "București Sector 4",
  "45": "București Sector 5", "46": "București Sector 6",
  "51": "Călărași", "52": "Giurgiu",
};

function PacientiMedic() {
  const navigate = useNavigate();

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

  const doctorEmail = localStorage.getItem("sw_email") || "";
  const doctorName = formatDoctorName(doctorEmail);

  const doctorInitials = doctorName
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState(initialNewPatient);
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [createdPatientInfo, setCreatedPatientInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [setSelectedPatient] = useState(null);

  
  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);
const handleEditPatient = (patient) => {
  const d = patient.demographics || {};

  setSelectedPatient(patient);

  setNewPatient({
    nume: d.nume || "",
    prenume: d.prenume || "",
    cnp: d.cnp || "",
    sex: d.sex || "",
    data_nasterii: d.dataNasterii || "",
    varsta: d.dataNasterii ? `${calcAge(d.dataNasterii)} ani` : "",
    telefon: d.telefon || "",
    email: d.email || "",
    localitate: d.localitate || "",
    judet: d.judet || "",
    strada: d.strada || "",
    cod_postal: d.codPostal || "",
    tara: d.tara || "Romania",
    profesie: d.profesie || "",
    loc_de_munca: d.locDeMunca || "",
  });

  setShowEditModal(true);
};

  const calcAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const generatePatientEmail = (nume, prenume) => {
    if (!nume || !prenume) return "";

    return `${normalizeText(prenume)}.${normalizeText(nume)}@seniorwatch.com`;
  };

  const extractFromCNP = (cnp) => {
    if (!/^\d{13}$/.test(cnp)) return null;

    const s = cnp[0];
    const yy = cnp.slice(1, 3);
    const mm = cnp.slice(3, 5);
    const dd = cnp.slice(5, 7);
    const jj = cnp.slice(7, 9);

    let century = "";

    if (s === "1" || s === "2") century = "19";
    if (s === "5" || s === "6") century = "20";

    if (!century) return null;

    const birthDate = `${century}${yy}-${mm}-${dd}`;
    const dateObj = new Date(birthDate);

    if (
      Number.isNaN(dateObj.getTime()) ||
      birthDate !== dateObj.toISOString().slice(0, 10)
    ) {
      return null;
    }

    return {
      sex: s === "1" || s === "5" ? "M" : "F",
      data_nasterii: birthDate,
      varsta: `${calcAge(birthDate)} ani`,
      judet: judeteCNP[jj] || "",
    };
  };

  const isFormValid =
    newPatient.nume &&
    newPatient.prenume &&
    newPatient.cnp.length === 13 &&
    newPatient.sex &&
    newPatient.data_nasterii &&
    newPatient.varsta &&
    newPatient.judet &&
    newPatient.telefon.length === 10 &&
    newPatient.email &&
    newPatient.localitate &&
    newPatient.tara;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnp") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 13);
      const extracted = extractFromCNP(onlyDigits);

      setNewPatient({
        ...newPatient,
        cnp: onlyDigits,
        sex: extracted?.sex || "",
        data_nasterii: extracted?.data_nasterii || "",
        varsta: extracted?.varsta || "",
        judet: extracted?.judet || "",
      });

      return;
    }

    if (name === "cod_postal") {
      setNewPatient({
        ...newPatient,
        cod_postal: value.replace(/\D/g, "").slice(0, 6),
      });

      return;
    }

    const updatedPatient = {
      ...newPatient,
      [name]: value,
    };

    if (name === "nume" || name === "prenume") {
      updatedPatient.email = generatePatientEmail(
        updatedPatient.nume,
        updatedPatient.prenume
      );
    }

    setNewPatient(updatedPatient);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();

    if (!isFormValid || saving) return;

    const demographics = {
      nume: newPatient.nume,
      prenume: newPatient.prenume,
      sex: newPatient.sex,
      dataNasterii: newPatient.data_nasterii,
      cnp: newPatient.cnp,
      strada: newPatient.strada,
      localitate: newPatient.localitate,
      judet: newPatient.judet,
      codPostal: newPatient.cod_postal,
      tara: newPatient.tara,
      telefon: newPatient.telefon,
      email: newPatient.email,
      profesie: newPatient.profesie,
      locDeMunca: newPatient.loc_de_munca,
    };

    setSaving(true);

    try {
      await createPatient(demographics);
      await loadPatients();
      closeModal();
      setCreatedPatientInfo({
      email: newPatient.email,
      password: "Senior123!",
});
    } catch (error) {
      console.log(error);
      alert("Eroare la salvarea pacientului.");
    } finally {
      setSaving(false);
    }
  };
const filteredPatients = patients.filter((p) => {
  const d = p.demographics || {};

  const search = searchTerm.toLowerCase();

  return (
    d.nume?.toLowerCase().includes(search) ||
    d.prenume?.toLowerCase().includes(search) ||
    d.cnp?.includes(search)
  );
});
  const closeModal = () => {
    setShowAddModal(false);
    setNewPatient(initialNewPatient);
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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/medic");
            }}
          >
            📊 Dashboard
          </a>

          <a href="#" className="active" onClick={(e) => e.preventDefault()}>
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
        <section className="stats">
          <div className="stat">
            <div className="icon purple">👥</div>
            <div>
              <p>Total pacienți</p>
              <h2>{patients.length}</h2>
              <span>pacienți asociați medicului</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon green">💚</div>
            <div>
              <p>Stabili</p>
              <h2>{patients.length}</h2>
              <span>fără alerte active</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon pink">🔔</div>
            <div>
              <p>Cu alerte</p>
              <h2>0</h2>
              <span>urmează legare cu alerte</span>
            </div>
          </div>

          <div className="stat">
            <div className="icon violet">📈</div>
            <div>
              <p>Monitorizați azi</p>
              <h2>0</h2>
              <span>urmează legare cu senzori</span>
            </div>
          </div>
        </section>

        <section className="content pacienti-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div>
                <h1>Pacienți monitorizați</h1>
              </div>

              <div className="patients-tools">
                <div className="patients-search">
                  <span>⌕</span>
<input
  type="text"
  placeholder="Caută după nume, prenume sau CNP..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>                  <button>Caută</button>
                </div>

                <button
                  className="add-patient-btn"
                  type="button"
                  onClick={() => setShowAddModal(true)}
                >
                  + Adaugă pacient
                </button>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader pacienti-row">
                <span>Pacient</span>
                <span>CNP</span>
                <span>Vârstă</span>
                <span>Puls</span>
                <span>Temperatură</span>
                <span>Umiditate</span>
                <span>Status</span>
                <span>Acțiuni</span>
              </div>

              {patients.length === 0 && (
                <div className="tableRow pacienti-row">
                  <span>Niciun pacient înregistrat</span>
                </div>
              )}

              {filteredPatients.map((p) => {
                const d = p.demographics || {};
                const sample = p.latestSample || null;
                const fullName = [d.nume, d.prenume].filter(Boolean).join(" ");

                const initials =
                  `${(d.nume || "")[0] || ""}${(d.prenume || "")[0] || ""}`.toUpperCase() ||
                  "?";

                const age = d.dataNasterii
                  ? `${calcAge(d.dataNasterii)} ani`
                  : "—";

                return (
                  <div className="tableRow pacienti-row" key={p.id}>
                    <span className="patientName">
                      <b>{initials}</b>
                      {fullName || "—"}
                    </span>

                    <span className="cnpText">{d.cnp || "—"}</span>
                    <span>{age}</span>
<span>{sample?.puls ? `${sample.puls} bpm` : "—"}</span>
<span>{sample?.temperatura ? `${sample.temperatura}°C` : "—"}</span>
<span>{sample?.umiditate ? `${sample.umiditate}%` : "—"}</span>
<span className="badge Stabil">Stabil</span>
<span className="patientActions">
  <button onClick={() => navigate(`/medic/pacient/${p.id}`)}>
    Fișă
  </button>

  <button onClick={() => handleEditPatient(p)}>
    Editează
  </button>

  <button>Alerte</button>
</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {showAddModal && (
          <div className="modalOverlay">
            <div className="widePatientModal">
              <div className="addPatientHeader">
                <div className="modalIcon">👥</div>
                <div>
                  <h2>Adaugă pacient</h2>
                </div>
                <button
                  className="closeModalBtn"
                  type="button"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <form
                id="addPatientForm"
                className="addPatientForm"
                onSubmit={handleAddPatient}
              >
                <div className="formSection">
                  <div className="sectionTitle">
                    <h3>Date de identificare</h3>
                  </div>

                  <div className="formGrid threeCols">
                    <label>
                      Nume *
                      <input
                        name="nume"
                        value={newPatient.nume}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Prenume *
                      <input
                        name="prenume"
                        value={newPatient.prenume}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      CNP *
                      <input
                        name="cnp"
                        value={newPatient.cnp}
                        onChange={handleChange}
                        maxLength="13"
                        required
                      />
                    </label>

                    <label>
                      Sex
                      <input value={newPatient.sex || "—"} disabled />
                    </label>

                    <label>
                      Data nașterii
                      <input
                        type="date"
                        value={newPatient.data_nasterii}
                        disabled
                      />
                    </label>

                    <label>
                      Vârstă
                      <input value={newPatient.varsta || "—"} disabled />
                    </label>
                  </div>
                </div>

                <div className="formSection">
                  <div className="sectionTitle">
                    <h3>Date de contact</h3>
                  </div>

                  <div className="formGrid threeCols">
                    <label>
                      Telefon *
                      <input
                        name="telefon"
                        placeholder="07xxxxxxxx"
                        value={newPatient.telefon}
                        onChange={(e) => {
                          const onlyDigits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setNewPatient({
                            ...newPatient,
                            telefon: onlyDigits,
                          });
                        }}
                        maxLength="10"
                        required
                      />
                    </label>

                    <label>
                      Email generat automat
                      <input
                        name="email"
                        type="email"
                        value={newPatient.email}
                        readOnly
                      />
                    </label>

                    <label>
                      Județ
                      <input value={newPatient.judet || "—"} disabled />
                    </label>

                    <label>
                      Localitate *
                      <input
                        name="localitate"
                        value={newPatient.localitate}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Stradă
                      <input
                        name="strada"
                        value={newPatient.strada}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      Cod poștal
                      <input
                        name="cod_postal"
                        value={newPatient.cod_postal}
                        onChange={handleChange}
                        maxLength="6"
                      />
                    </label>

                    <label>
                      Țară *
                      <input
                        name="tara"
                        value={newPatient.tara}
                        onChange={handleChange}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="formSection">
                  <div className="sectionTitle">
                    <h3>Date profesionale</h3>
                  </div>

                  <div className="formGrid twoCols">
                    <label>
                      Profesie
                      <input
                        name="profesie"
                        value={newPatient.profesie}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      Loc de muncă
                      <input
                        name="loc_de_munca"
                        value={newPatient.loc_de_munca}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                </div>
              </form>

              <div className="modalFooter">
                <button type="button" className="btnCancel" onClick={closeModal}>
                  Renunță
                </button>

                <button
                  type="submit"
                  form="addPatientForm"
                  className="btnSave"
                  disabled={!isFormValid || saving}
                >
                  {saving ? "Se salvează…" : "Salvează pacient"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showEditModal && (
  <div className="modalOverlay">
    <div className="widePatientModal">
      <div className="addPatientHeader">
        <div className="modalIcon">✏️</div>
        <div>
          <h2>Editează pacient</h2>
        </div>
        <button
          className="closeModalBtn"
          type="button"
          onClick={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
            setNewPatient(initialNewPatient);
          }}
        >
          ×
        </button>
      </div>

      <form

      >
        <div className="formSection">
          <div className="sectionTitle">
            <h3>Date pacient</h3>
          </div>

          <div className="formGrid threeCols">
            <label>
              Nume *
              <input
                name="nume"
                value={newPatient.nume}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Prenume *
              <input
                name="prenume"
                value={newPatient.prenume}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email generat automat
              <input
                name="email"
                type="email"
                value={newPatient.email}
                readOnly
              />
            </label>

            <label>
              Telefon *
              <input
                name="telefon"
                value={newPatient.telefon}
                onChange={(e) => {
                  const onlyDigits = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setNewPatient({
                    ...newPatient,
                    telefon: onlyDigits,
                  });
                }}
                maxLength="10"
                required
              />
            </label>

            <label>
              Localitate *
              <input
                name="localitate"
                value={newPatient.localitate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Stradă
              <input
                name="strada"
                value={newPatient.strada}
                onChange={handleChange}
              />
            </label>

            <label>
              Cod poștal
              <input
                name="cod_postal"
                value={newPatient.cod_postal}
                onChange={handleChange}
                maxLength="6"
              />
            </label>

            <label>
              Profesie
              <input
                name="profesie"
                value={newPatient.profesie}
                onChange={handleChange}
              />
            </label>

            <label>
              Loc de muncă
              <input
                name="loc_de_munca"
                value={newPatient.loc_de_munca}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      </form>

      <div className="modalFooter">
        <button
          type="button"
          className="btnCancel"
          onClick={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
            setNewPatient(initialNewPatient);
          }}
        >
          Renunță
        </button>

        <button
          type="submit"
          form="editPatientForm"
          className="btnSave"
          disabled={saving}
        >
          {saving ? "Se salvează…" : "Salvează modificările"}
        </button>
      </div>
    </div>
  </div>
)}
        {createdPatientInfo && (
  <div className="users-modalOverlay">
    <div className="users-modal users-successModal">
      <div className="users-modalHead">
        <div className="users-modalTitle">
          <div className="users-modalIcon">✅</div>

          <div>
            <h2>Pacient adăugat cu succes</h2>
            <p>Datele de autentificare generate automat.</p>
          </div>
        </div>

        <button
          className="users-closeBtn"
          onClick={() => setCreatedPatientInfo(null)}
        >
          ×
        </button>
      </div>

      <div className="users-form">
        <div className="users-formSection">
          <h3>Credentiale pacient</h3>

          <div className="users-successFields">
            <div className="users-field">
              <label>Email</label>
              <input value={createdPatientInfo.email} readOnly />
            </div>

            <div className="users-field">
              <label>Parolă</label>
              <input value={createdPatientInfo.password} readOnly />
            </div>
          </div>
        </div>

        <div className="users-formActions">
          <button
            type="button"
            className="users-submitBtn"
            onClick={() => setCreatedPatientInfo(null)}
          >
            Am înțeles
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

export default PacientiMedic;