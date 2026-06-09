import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminroluri.css";

function AdminRoluri() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    numeRol: "",
    descriere: "",
    read: true,
    write: false,
    delete: false,
    export: false,
  });

  const formIsValid =
    formData.numeRol.trim() &&
    formData.descriere.trim() &&
    (formData.read || formData.write || formData.delete || formData.export);

  const roles = [
    {
      name: "Medic",
      users: 12,
      color: "violet",
      permissions: ["READ", "WRITE", "EXPORT"],
    },
    {
      name: "Pacient",
      users: 104,
      color: "green",
      permissions: ["READ"],
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCreateRole = () => {
    if (!formIsValid) return;

    alert("Rol creat cu succes!");
    setShowForm(false);

    setFormData({
      numeRol: "",
      descriere: "",
      read: true,
      write: false,
      delete: false,
      export: false,
    });
  };

  return (
    <div className="roles-app">
      <aside className="roles-sidebar">
        <div className="roles-brand">
          <div className="roles-logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>📊 Dashboard</a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminutilizatori"); }}>
            👥 Utilizatori
          </a>

          <a href="#" className="active">🛡️ Roluri</a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminaudit"); }}>📝 Audit</a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminstatus"); }}>
            🟢 Status sistem
          </a>
        </nav>

        <div className="roles-profile">
          <div>A</div>

          <span>
            <b>Administrator</b>
            admin@clinic.ro
          </span>
        </div>
      </aside>

      <main className="roles-main">
        <section className="roles-hero">
          <div>
            <p>CONTROL ACCES</p>
            <h1>Roluri platformă</h1>
          </div>

          <button className="roles-createBtn" onClick={() => setShowForm(true)}>
            + Creează rol
          </button>
        </section>

        <section className="roles-stats">
          <div className="roles-stat">
            <div className="roles-statIcon purple">🛡️</div>

            <div>
              <p>Total roluri</p>
              <h2>3</h2>
            </div>
          </div>

          <div className="roles-stat">
            <div className="roles-statIcon green">👥</div>

            <div>
              <p>Utilizatori activi</p>
              <h2>121</h2>
            </div>
          </div>

          <div className="roles-stat">
            <div className="roles-statIcon violet">🔐</div>

            <div>
              <p>Permisiuni totale</p>
              <h2>4</h2>
            </div>
          </div>
        </section>

        <section className="roles-grid">
          {roles.map((role, index) => (
            <div className="role-card" key={index}>
              <div className="role-cardTop">
                <div className={`role-icon ${role.color}`}>🛡️</div>

                <div>
                  <h2>{role.name}</h2>
                  <span>{role.users} utilizatori</span>
                </div>
              </div>

              <div className="role-section">
                <p>Permisiuni active</p>

                <div className="role-permissions">
                  {role.permissions.map((permission, i) => (
                    <span key={i}>{permission}</span>
                  ))}
                </div>
              </div>

              <div className="role-actions">
                <button className="edit">Editare</button>
                <button className="delete">Șterge</button>
              </div>
            </div>
          ))}
        </section>
      </main>

      {showForm && (
        <div className="roles-modalOverlay">
          <div className="roles-modal">
            <div className="roles-modalHead">
              <div className="roles-modalTitle">
                <div className="roles-modalIcon">🛡️</div>

                <div>
                  <h2>Rol nou</h2>
                  <p>Configurează rolul și permisiunile asociate.</p>
                </div>
              </div>

              <button
                className="roles-closeBtn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form className="roles-form">
              <div className="roles-formSection">
                <h3>Date rol</h3>

                <div className="roles-formGrid">
                  <div className="roles-field">
                    <label>Nume rol *</label>
                    <input
                      name="numeRol"
                      type="text"
                      placeholder="ex: Asistent medical"
                      value={formData.numeRol}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="roles-field">
                    <label>Descriere *</label>
                    <input
                      name="descriere"
                      type="text"
                      placeholder="ex: Acces limitat la pacienți"
                      value={formData.descriere}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="roles-formSection">
                <h3>Permisiuni rol</h3>

                <div className="roles-permissionsGrid">
                  <label>
                    <input
                      name="read"
                      type="checkbox"
                      checked={formData.read}
                      onChange={handleChange}
                    />
                    READ
                  </label>

                  <label>
                    <input
                      name="write"
                      type="checkbox"
                      checked={formData.write}
                      onChange={handleChange}
                    />
                    WRITE
                  </label>

                  <label>
                    <input
                      name="delete"
                      type="checkbox"
                      checked={formData.delete}
                      onChange={handleChange}
                    />
                    DELETE
                  </label>

                  <label>
                    <input
                      name="export"
                      type="checkbox"
                      checked={formData.export}
                      onChange={handleChange}
                    />
                    EXPORT
                  </label>
                </div>
              </div>

              <div className="roles-formActions">
                <button
                  type="button"
                  className="roles-cancelBtn"
                  onClick={() => setShowForm(false)}
                >
                  Renunță
                </button>

                <button
                  type="button"
                  className="roles-submitBtn"
                  onClick={handleCreateRole}
                  disabled={!formIsValid}
                >
                  Creează rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoluri;