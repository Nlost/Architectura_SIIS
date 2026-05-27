import { useState } from "react";
import "./admin.css";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    rol: "",
    status: "Activ",
    telefon: "",
    departament: "",
    observatii: "",
    permissions: {
      READ: true,
      WRITE: false,
      DELETE: false,
      EXPORT: false,
    },
  });

  const [errors, setErrors] = useState({});
const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefon") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, telefon: onlyNumbers });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handlePermissionChange = (permission) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission],
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nume.trim()) newErrors.nume = "Numele este obligatoriu";
    if (!formData.prenume.trim()) newErrors.prenume = "Prenumele este obligatoriu";

    if (!formData.email.trim()) {
      newErrors.email = "Emailul este obligatoriu";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Emailul trebuie să conțină @";
    }

    if (!formData.rol) newErrors.rol = "Rolul este obligatoriu";
    if (!formData.status) newErrors.status = "Statusul este obligatoriu";

    if (!formData.telefon.trim()) {
      newErrors.telefon = "Telefonul este obligatoriu";
    } else if (formData.telefon.length !== 10) {
      newErrors.telefon = "Telefonul trebuie să aibă exact 10 cifre";
    }

    if (!formData.departament.trim()) {
      newErrors.departament = "Departamentul este obligatoriu";
    }

    if (!formData.observatii.trim()) {
      newErrors.observatii = "Observațiile sunt obligatorii";
    }

    const hasPermission = Object.values(formData.permissions).some(Boolean);

    if (!hasPermission) {
      newErrors.permissions = "Selectează cel puțin o permisiune";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = () => {
    if (!validateForm()) return;

    alert("Utilizator creat cu succes!");

    setShowCreateUser(false);

    setFormData({
      nume: "",
      prenume: "",
      email: "",
      rol: "",
      status: "Activ",
      telefon: "",
      departament: "",
      observatii: "",
      permissions: {
        READ: true,
        WRITE: false,
        DELETE: false,
        EXPORT: false,
      },
    });

    setErrors({});
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

      <nav>
  <a className="active">📊 Dashboard</a>
<a onClick={() => navigate("/admin/adminutilizatori")}>
  👥 Utilizatori
</a> 
<a onClick={() => navigate("/admin/roluri")}>
  🛡️ Roluri
</a>
<a onClick={() => navigate("/admin/adminaudit")}>
  📝 Audit
</a>
  <a onClick={() => navigate("/admin/adminstatus")}>
  🟢 Status sistem
</a>
</nav>

        <div className="admin-profile">
          <div>A</div>

          <span>
            <b>Administrator</b>
            admin@clinic.ro
          </span>
        </div>
      </aside>

      <main className="admin-main">
        <section className="admin-hero">
          <div className="admin-heroSearch">
            <input placeholder="Caută utilizator, rol sau activitate..." />
            <button>⌕</button>
          </div>
        </section>

        <section className="admin-stats">
          <div className="admin-stat">
            <div className="admin-icon purple">👥</div>
            <div>
              <p>Utilizatori</p>
              <h2>128</h2>
              <span>total conturi platformă</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon violet">🩺</div>
            <div>
              <p>Medici</p>
              <h2>12</h2>
              <span>conturi medicale active</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon green">📱</div>
            <div>
              <p>Pacienți</p>
              <h2>104</h2>
              <span>monitorizați în sistem</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon pink">⚠</div>
            <div>
              <p>Probleme</p>
              <h2>3</h2>
              <span>dispozitive inactive</span>
            </div>
          </div>
        </section>

        <section className="admin-content">
          <div className="admin-panel">
            <div className="admin-panelHead">
              <div>
                <p>MANAGEMENT</p>
                <h2>Utilizatori recenți</h2>
              </div>

              <button
                className="admin-createBtn"
                onClick={() => setShowCreateUser(true)}
              >
                + Creează utilizator
              </button>
            </div>

            <div className="admin-table">
              <div className="admin-tableRow admin-tableHeader">
                <span>Utilizator</span>
                <span>Email</span>
                <span>Rol</span>
                <span>Status</span>
                <span>Acțiune</span>
              </div>

              <div className="admin-tableRow">
                <span className="admin-userName">
                  <b>AP</b>
                  Dr. Andrei Popescu
                </span>
                <span>andrei@clinic.ro</span>
                <span>Medic</span>
                <span className="admin-badge Activ">Activ</span>
                <span className="admin-action">Editare</span>
              </div>

              <div className="admin-tableRow">
                <span className="admin-userName">
                  <b>MI</b>
                  Maria Ionescu
                </span>
                <span>maria@email.ro</span>
                <span>Pacient</span>
                <span className="admin-badge Activ">Activ</span>
                <span className="admin-action">Editare</span>
              </div>

              <div className="admin-tableRow">
                <span className="admin-userName">
                  <b>ER</b>
                  Dr. Elena Radu
                </span>
                <span>elena@clinic.ro</span>
                <span>Medic</span>
                <span className="admin-badge Inactiv">Inactiv</span>
                <span className="admin-action">Editare</span>
              </div>
            </div>
          </div>

          <div className="admin-right">
            <div className="admin-panel">
              <div className="admin-panelHead">
                <div>
                  <p>ROLURI</p>
                  <h2>Roluri platformă</h2>
                </div>
              </div>

              <div className="admin-role">
                <strong>Medic</strong>
                <span>12 conturi</span>
              </div>

              <div className="admin-role">
                <strong>Pacient</strong>
                <span>104 conturi</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showCreateUser && (
        <div className="admin-modalOverlay">
          <div className="admin-modal">
            <div className="admin-modalHead">
              <div className="admin-modalTitle">
                <div className="admin-modalIcon">👤</div>

                <div>
                  <h2>Utilizator nou</h2>
                  <p>Completează datele utilizatorului pentru platformă.</p>
                </div>
              </div>

              <button
                className="admin-closeBtn"
                onClick={() => setShowCreateUser(false)}
              >
                ×
              </button>
            </div>

            <form className="admin-form">
              <div className="admin-formSection">
                <h3>Date utilizator</h3>

                <div className="admin-formGrid">
                  <div className="admin-field">
                    <label>Nume *</label>
                    <input
                      name="nume"
                      type="text"
                      placeholder="ex: Popescu"
                      value={formData.nume}
                      onChange={handleChange}
                    />
                    {errors.nume && <span className="admin-error">{errors.nume}</span>}
                  </div>

                  <div className="admin-field">
                    <label>Prenume *</label>
                    <input
                      name="prenume"
                      type="text"
                      placeholder="ex: Andrei"
                      value={formData.prenume}
                      onChange={handleChange}
                    />
                    {errors.prenume && <span className="admin-error">{errors.prenume}</span>}
                  </div>

                  <div className="admin-field">
                    <label>Email *</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="exemplu@email.ro"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="admin-error">{errors.email}</span>}
                  </div>

                  <div className="admin-field">
                    <label>Rol *</label>
                    <select name="rol" value={formData.rol} onChange={handleChange}>
                      <option value="" disabled>
                        Alege rol
                      </option>
                      <option value="ADMIN">Administrator</option>
                      <option value="DOCTOR">Medic</option>
                      <option value="PATIENT">Pacient</option>
                    </select>
                    {errors.rol && <span className="admin-error">{errors.rol}</span>}
                  </div>

                  <div className="admin-field">
                    <label>Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Activ">Activ</option>
                      <option value="Inactiv">Inactiv</option>
                    </select>
                    {errors.status && <span className="admin-error">{errors.status}</span>}
                  </div>

                  <div className="admin-field">
                    <label>Parolă</label>
                    <input type="text" value="Generată automat" readOnly />
                  </div>
                </div>
              </div>

              <div className="admin-formSection">
                <h3>Permisiuni rol</h3>

                <div className="admin-permissionsGrid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.permissions.READ}
                      onChange={() => handlePermissionChange("READ")}
                    />
                    READ
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.permissions.WRITE}
                      onChange={() => handlePermissionChange("WRITE")}
                    />
                    WRITE
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.permissions.DELETE}
                      onChange={() => handlePermissionChange("DELETE")}
                    />
                    DELETE
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.permissions.EXPORT}
                      onChange={() => handlePermissionChange("EXPORT")}
                    />
                    EXPORT
                  </label>
                </div>

                {errors.permissions && (
                  <span className="admin-error">{errors.permissions}</span>
                )}
              </div>

              <div className="admin-formSection">
                <h3>Detalii cont</h3>

                <div className="admin-formGrid">
                  <div className="admin-field">
                    <label>Telefon *</label>
                    <input
                      name="telefon"
                      type="text"
                      placeholder="ex: 0712345678"
                      value={formData.telefon}
                      onChange={handleChange}
                    />
                    {errors.telefon && (
                      <span className="admin-error">{errors.telefon}</span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label>Departament *</label>
                    <input
                      name="departament"
                      type="text"
                      placeholder="ex: Cardiologie"
                      value={formData.departament}
                      onChange={handleChange}
                    />
                    {errors.departament && (
                      <span className="admin-error">{errors.departament}</span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label>Observații *</label>
                    <input
                      name="observatii"
                      type="text"
                      placeholder="Detalii suplimentare..."
                      value={formData.observatii}
                      onChange={handleChange}
                    />
                    {errors.observatii && (
                      <span className="admin-error">{errors.observatii}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-formActions">
                <button
                  type="button"
                  className="admin-cancelBtn"
                  onClick={() => setShowCreateUser(false)}
                >
                  Renunță
                </button>

                <button
  type="button"
  className="admin-submitBtn"
  onClick={handleCreateUser}
  disabled={
    !formData.nume ||
    !formData.prenume ||
    !formData.email.includes("@") ||
    !formData.rol ||
    formData.telefon.length !== 10 ||
    !formData.departament ||
    !formData.observatii
  }
>
  Creează utilizator
</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;