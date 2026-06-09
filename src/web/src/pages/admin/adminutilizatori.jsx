import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminutilizatori.css";

function AdminUtilizatori() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Toate");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    rol: "",
    status: "Activ",
    telefon: "",
    departament: "",
    observatii: "",
  });

  const [errors, setErrors] = useState({});

  const users = [
    {
      initials: "AP",
      name: "Dr. Andrei Popescu",
      email: "andrei@clinic.ro",
      role: "Medic",
      status: "Activ",
      phone: "0712345678",
    },
    {
      initials: "MI",
      name: "Maria Ionescu",
      email: "maria@email.ro",
      role: "Pacient",
      status: "Activ",
      phone: "0723456789",
    },
    {
      initials: "ER",
      name: "Dr. Elena Radu",
      email: "elena@clinic.ro",
      role: "Medic",
      status: "Inactiv",
      phone: "0734567890",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "Toate" || user.role === roleFilter;
    const matchesStatus = statusFilter === "Toate" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefon") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, telefon: onlyNumbers });
      return;
    }

    setFormData({ ...formData, [name]: value });
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formIsValid =
    formData.nume.trim() &&
    formData.prenume.trim() &&
    formData.email.includes("@") &&
    formData.rol &&
    formData.status &&
    formData.telefon.length === 10 &&
    formData.departament.trim() &&
    formData.observatii.trim();

  const handleCreateUser = () => {
    if (!validateForm()) return;

    alert("Utilizator creat cu succes!");
    setShowForm(false);

    setFormData({
      nume: "",
      prenume: "",
      email: "",
      rol: "",
      status: "Activ",
      telefon: "",
      departament: "",
      observatii: "",
    });

    setErrors({});
  };

  return (
    <div className="users-app">
      <aside className="users-sidebar">
        <div className="users-brand">
          <div className="users-logo">SW</div>

          <div>
            <h2>SeniorWatch</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>📊 Dashboard</a>
          <a href="#" className="active">👥 Utilizatori</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminroluri"); }}>🛡️ Roluri</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminaudit"); }}>📝 Audit</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminstatus"); }}>🟢 Status sistem</a>
        </nav>

        <div className="users-profile">
          <div>A</div>
          <span>
            <b>Administrator</b>
            admin@clinic.ro
          </span>
        </div>
      </aside>

      <main className="users-main">
        <section className="users-hero">
          <div>
            <p>ADMINISTRARE</p>
            <h1>Utilizatori platformă</h1>
          </div>

          <button className="users-createBtn" onClick={() => setShowForm(true)}>
            + Creează utilizator
          </button>
        </section>

        <section className="users-stats">
          <div className="users-stat">
            <div className="users-statIcon purple">👥</div>
            <div>
              <p>Total utilizatori</p>
              <h2>128</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon green">✅</div>
            <div>
              <p>Conturi active</p>
              <h2>121</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon violet">🩺</div>
            <div>
              <p>Medici</p>
              <h2>12</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon pink">🚫</div>
            <div>
              <p>Inactive</p>
              <h2>7</h2>
            </div>
          </div>
        </section>

        <section className="users-panel">
          <div className="users-panelHead">
            <div>
              <p>LISTĂ CONTURI</p>
              <h2>Toți utilizatorii</h2>
            </div>
          </div>

          <div className="users-toolbar">
            <input
              type="text"
              placeholder="Caută după nume / email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option>Toate</option>
              <option>Administrator</option>
              <option>Medic</option>
              <option>Pacient</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Toate</option>
              <option>Activ</option>
              <option>Inactiv</option>
            </select>
          </div>

          <div className="users-table">
            <div className="users-row users-header">
              <span>Utilizator</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Telefon</span>
              <span>Status</span>
              <span>Acțiuni</span>
            </div>

            {filteredUsers.map((user, index) => (
              <div className="users-row" key={index}>
                <span className="users-name">
                  <b>{user.initials}</b>
                  {user.name}
                </span>

                <span>{user.email}</span>
                <span>{user.role}</span>
                <span>{user.phone}</span>

                <span className={`users-badge ${user.status}`}>
                  {user.status}
                </span>

                <span className="users-actions">
                  <button className="edit">Editare</button>
                  <button className="disable">Dezactivează</button>
                  <button className="delete">Șterge</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showForm && (
        <div className="users-modalOverlay">
          <div className="users-modal">
            <div className="users-modalHead">
              <div className="users-modalTitle">
                <div className="users-modalIcon">👤</div>

                <div>
                  <h2>Utilizator nou</h2>
                  <p>Completează datele contului nou.</p>
                </div>
              </div>

              <button className="users-closeBtn" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>

            <form className="users-form">
              <div className="users-formSection">
                <h3>Date utilizator</h3>

                <div className="users-formGrid">
                  <div className="users-field">
                    <label>Nume *</label>
                    <input
                      name="nume"
                      type="text"
                      placeholder="ex: Popescu"
                      value={formData.nume}
                      onChange={handleChange}
                    />
                    {errors.nume && <span className="users-error">{errors.nume}</span>}
                  </div>

                  <div className="users-field">
                    <label>Prenume *</label>
                    <input
                      name="prenume"
                      type="text"
                      placeholder="ex: Andrei"
                      value={formData.prenume}
                      onChange={handleChange}
                    />
                    {errors.prenume && <span className="users-error">{errors.prenume}</span>}
                  </div>

                  <div className="users-field">
                    <label>Email *</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="exemplu@email.ro"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="users-error">{errors.email}</span>}
                  </div>

                  <div className="users-field">
                    <label>Rol *</label>
                    <select name="rol" value={formData.rol} onChange={handleChange}>
                      <option value="" disabled>
                        Alege rol
                      </option>
                      <option value="Administrator">Administrator</option>
                      <option value="Medic">Medic</option>
                      <option value="Pacient">Pacient</option>
                    </select>
                    {errors.rol && <span className="users-error">{errors.rol}</span>}
                  </div>

                  <div className="users-field">
                    <label>Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Activ">Activ</option>
                      <option value="Inactiv">Inactiv</option>
                    </select>
                    {errors.status && <span className="users-error">{errors.status}</span>}
                  </div>

                  <div className="users-field">
                    <label>Parolă</label>
                    <input type="text" value="Generată automat" readOnly />
                  </div>
                </div>
              </div>

              <div className="users-formSection">
                <h3>Detalii cont</h3>

                <div className="users-formGrid">
                  <div className="users-field">
                    <label>Telefon *</label>
                    <input
                      name="telefon"
                      type="text"
                      placeholder="ex: 0712345678"
                      value={formData.telefon}
                      onChange={handleChange}
                    />
                    {errors.telefon && <span className="users-error">{errors.telefon}</span>}
                  </div>

                  <div className="users-field">
                    <label>Departament *</label>
                    <input
                      name="departament"
                      type="text"
                      placeholder="ex: Cardiologie"
                      value={formData.departament}
                      onChange={handleChange}
                    />
                    {errors.departament && <span className="users-error">{errors.departament}</span>}
                  </div>

                  <div className="users-field">
                    <label>Observații *</label>
                    <input
                      name="observatii"
                      type="text"
                      placeholder="Detalii suplimentare..."
                      value={formData.observatii}
                      onChange={handleChange}
                    />
                    {errors.observatii && <span className="users-error">{errors.observatii}</span>}
                  </div>
                </div>
              </div>

              <div className="users-formActions">
                <button
                  type="button"
                  className="users-cancelBtn"
                  onClick={() => setShowForm(false)}
                >
                  Renunță
                </button>

                <button
                  type="button"
                  className="users-submitBtn"
                  onClick={handleCreateUser}
                  disabled={!formIsValid}
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

export default AdminUtilizatori;