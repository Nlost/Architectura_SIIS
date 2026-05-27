import "./pacienti.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialNewPatient = {
  nume: "", prenume: "", cnp: "", sex: "",
  data_nasterii: "", varsta: "", telefon: "",
  email: "", localitate: "", judet: "",
  strada: "", cod_postal: "", tara: "Romania",
  profesie: "", loc_de_munca: "",
};

const patients = [
  ["IP", "Ion Popescu",   "1580615123456", "67 ani", "78 bpm",  "36.7°C", "Stabil"],
  ["MI", "Maria Ionescu", "2790101123456", "71 ani", "112 bpm", "37.9°C", "Alertă"],
  ["EM", "Elena Matei",   "2620303123456", "64 ani", "84 bpm",  "36.5°C", "Observație"],
  ["VR", "Victor Radu",   "1660924123456", "59 ani", "91 bpm",  "37.1°C", "Stabil"],
  ["AP", "Ana Pop",       "2720404123456", "53 ani", "68 bpm",  "36.4°C", "Stabil"],
];

const judeteCNP = {
  "01":"Alba","02":"Arad","03":"Argeș","04":"Bacău",
  "05":"Bihor","06":"Bistrița-Năsăud","07":"Botoșani",
  "08":"Brașov","09":"Brăila","10":"Buzău",
  "11":"Caraș-Severin","12":"Cluj","13":"Constanța",
  "14":"Covasna","15":"Dâmbovița","16":"Dolj",
  "17":"Galați","18":"Gorj","19":"Harghita",
  "20":"Hunedoara","21":"Ialomița","22":"Iași",
  "23":"Ilfov","24":"Maramureș","25":"Mehedinți",
  "26":"Mureș","27":"Neamț","28":"Olt",
  "29":"Prahova","30":"Satu Mare","31":"Sălaj",
  "32":"Sibiu","33":"Suceava","34":"Teleorman",
  "35":"Timiș","36":"Tulcea","37":"Vaslui",
  "38":"Vâlcea","39":"Vrancea","40":"București",
  "41":"București Sector 1","42":"București Sector 2",
  "43":"București Sector 3","44":"București Sector 4",
  "45":"București Sector 5","46":"București Sector 6",
  "51":"Călărași","52":"Giurgiu",
};

function PacientiMedic() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState(initialNewPatient);

  const calcAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const extractFromCNP = (cnp) => {
    if (!/^\d{13}$/.test(cnp)) return null;
    const s = cnp[0];
    const yy = cnp.slice(1,3), mm = cnp.slice(3,5), dd = cnp.slice(5,7), jj = cnp.slice(7,9);
    let century = "";
    if (s==="1"||s==="2") century="19";
    if (s==="5"||s==="6") century="20";
    if (!century) return null;
    const birthDate = `${century}${yy}-${mm}-${dd}`;
    const dateObj = new Date(birthDate);
    if (Number.isNaN(dateObj.getTime()) || birthDate !== dateObj.toISOString().slice(0,10)) return null;
    return {
      sex: s==="1"||s==="5" ? "M" : "F",
      data_nasterii: birthDate,
      varsta: `${calcAge(birthDate)} ani`,
      judet: judeteCNP[jj] || "",
    };
  };

  const isFormValid =
    newPatient.nume && newPatient.prenume && newPatient.cnp.length===13 &&
    newPatient.sex && newPatient.data_nasterii && newPatient.varsta &&
    newPatient.judet && newPatient.telefon && newPatient.email &&
    newPatient.localitate && newPatient.strada && newPatient.cod_postal && newPatient.tara;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cnp") {
      const onlyDigits = value.replace(/\D/g,"").slice(0,13);
      const extracted = extractFromCNP(onlyDigits);
      setNewPatient({ ...newPatient, cnp: onlyDigits,
        sex: extracted?.sex||"", data_nasterii: extracted?.data_nasterii||"",
        varsta: extracted?.varsta||"", judet: extracted?.judet||"" });
      return;
    }
    setNewPatient({ ...newPatient, [name]: value });
  };

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    console.log("Payload:", { ...newPatient });
    closeModal();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewPatient(initialNewPatient);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">+</div>
          <div><h2>SeniorWatch</h2><p>Medical dashboard</p></div>
        </div>
        <nav>
          <a onClick={() => navigate("/medic")}>⌂ Dashboard</a>
          <a className="active">👥 Pacienți</a>
          <a onClick={() => navigate("/medic/consultatii")}>🩺 Consultații</a>
          <a onClick={() => navigate("/medic/monitorizare")}>📈 Monitorizare</a>
          <a onClick={() => navigate("/medic/alerte")}>🔔 Alerte</a>
          <a onClick={() => navigate("/medic/rapoarte")}>📋 Rapoarte</a>
        </nav>
        <div className="profile">
          <div>AP</div>
          <span><b>Dr. Andrei Popescu</b>Medic specialist</span>
        </div>
      </aside>

      <main className="main">
        <section className="stats">
          <div className="stat"><div className="icon purple">👥</div><div><p>Total pacienți</p><h2>128</h2><span>pacienți asociați medicului</span></div></div>
          <div className="stat"><div className="icon green">💚</div><div><p>Stabili</p><h2>96</h2><span>fără alerte active</span></div></div>
          <div className="stat"><div className="icon pink">🔔</div><div><p>Cu alerte</p><h2>12</h2><span>necesită verificare</span></div></div>
          <div className="stat"><div className="icon violet">📈</div><div><p>Monitorizați azi</p><h2>84</h2><span>au trimis date recent</span></div></div>
        </section>

        <section className="content pacienti-content">
          <div className="panel fullPanel">
            <div className="panelHead">
              <div><h1>Pacienți monitorizați</h1></div>
              <div className="patients-tools">
                <div className="patients-search">
                  <span>⌕</span>
                  <input placeholder="Caută după nume / CNP" />
                  <button>Caută</button>
                </div>
                <button className="add-patient-btn" type="button" onClick={() => setShowAddModal(true)}>
                  + Adaugă pacient
                </button>
              </div>
            </div>

            <div className="table">
              <div className="tableRow tableHeader pacienti-row">
                <span>Pacient</span><span>CNP</span><span>Vârstă</span>
                <span>Puls</span><span>Temperatură</span><span>Status</span><span>Acțiuni</span>
              </div>
              {patients.map((p, i) => (
                <div className="tableRow pacienti-row" key={i}>
                  <span className="patientName"><b>{p[0]}</b>{p[1]}</span>
                  <span className="cnpText">{p[2]}</span>
                  <span>{p[3]}</span>
                  <span className={p[4]==="112 bpm" ? "dangerText" : ""}>{p[4]}</span>
                  <span>{p[5]}</span>
                  <span className={`badge ${p[6]}`}>{p[6]}</span>
                  <span className="patientActions">
                    
                    <button onClick={() => navigate(`/medic/pacient/${p[0]}`)}>
  Fișă
</button><button>Grafice</button>  <button>Editează</button><button>Alerte</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {showAddModal && (
          <div className="modalOverlay">
            <div className="widePatientModal">

              {/* 1. HEADER — fix sus */}
              <div className="addPatientHeader">
                <div className="modalIcon">👥</div>
                <div><h2>Adaugă pacient</h2></div>
                <button className="closeModalBtn" type="button" onClick={closeModal}>×</button>
              </div>

              {/* 2. FORM — scroll doar aici */}
              <form id="addPatientForm" className="addPatientForm" onSubmit={handleAddPatient}>

                <div className="formSection">
                  <div className="sectionTitle"><h3>Date de identificare</h3></div>
                  <div className="formGrid threeCols">
                    <label>Nume *<input name="nume" value={newPatient.nume} onChange={handleChange} required /></label>
                    <label>Prenume *<input name="prenume" value={newPatient.prenume} onChange={handleChange} required /></label>
                    <label>CNP *<input name="cnp" value={newPatient.cnp} onChange={handleChange} maxLength="13" required /></label>
                    <label>Sex<input value={newPatient.sex||"—"} disabled /></label>
                    <label>Data nașterii<input type="date" value={newPatient.data_nasterii} disabled /></label>
                    <label>Vârstă<input value={newPatient.varsta||"—"} disabled /></label>
                  </div>
                </div>

                <div className="formSection">
                  <div className="sectionTitle"><h3>Date de contact</h3></div>
                  <div className="formGrid threeCols">
                    <label>Telefon *
                      <input name="telefon" placeholder="07xxxxxxxx" value={newPatient.telefon}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g,"").slice(0,10);
                          setNewPatient({ ...newPatient, telefon: onlyDigits });
                        }} maxLength="10" required />
                    </label>
                    <label>Email *<input name="email" type="email" placeholder="ex: nume@email.com" value={newPatient.email} onChange={handleChange} required /></label>
                    <label>Județ<input value={newPatient.judet||"—"} disabled /></label>
                    <label>Localitate *<input name="localitate" value={newPatient.localitate} onChange={handleChange} required /></label>
                    <label>Stradă *<input name="strada" value={newPatient.strada} onChange={handleChange} required /></label>
                    <label>Cod poștal *<input name="cod_postal" value={newPatient.cod_postal} onChange={handleChange} required /></label>
                    <label>Țară *<input name="tara" value={newPatient.tara} onChange={handleChange} required /></label>
                  </div>
                </div>

                <div className="formSection">
                  <div className="sectionTitle"><h3>Date profesionale</h3></div>
                  <div className="formGrid twoCols">
                    <label>Profesie *<input name="profesie" value={newPatient.profesie} onChange={handleChange} required /></label>
                    <label>Loc de muncă *<input name="loc_de_munca" value={newPatient.loc_de_munca} onChange={handleChange} required /></label>
                  </div>
                </div>

              </form>

              {/* 3. BUTOANE — fix jos, în afara form */}
              <div className="modalFooter">
                <button type="button" className="btnCancel" onClick={closeModal}>Renunță</button>
                <button type="submit" form="addPatientForm" className="btnSave" disabled={!isFormValid}>Salvează pacient</button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PacientiMedic;