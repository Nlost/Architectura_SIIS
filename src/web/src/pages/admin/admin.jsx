import "./admin.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createUser, getUsers } from "../../api";
function AdminDashboard() {
  const navigate = useNavigate();
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    rol: "",
  });

  const [errors, setErrors] = useState({});
const [searchTerm, setSearchTerm] = useState("");
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const generateEmail = () => {
    return `${normalizeText(formData.prenume)}.${normalizeText(
      formData.nume
    )}@seniorwatch.com`;
  };

 const generatePassword = () => {
  return "Senior123!";
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nume.trim()) {
      newErrors.nume = "Numele este obligatoriu";
    }

    if (!formData.prenume.trim()) {
      newErrors.prenume = "Prenumele este obligatoriu";
    }

    if (!formData.rol) {
      newErrors.rol = "Rolul este obligatoriu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    const email = generateEmail();
    const password = generatePassword();

    try {console.log("Date trimise:", {
  email,
  password,
  role: formData.rol,
});
      await createUser(email, password, formData.rol);
await loadDashboardData();
      alert(
        `Utilizator creat cu succes!\n\nEmail: ${email}\nParolă: ${password}`
      );

      setShowCreateUser(false);

      setFormData({
        nume: "",
        prenume: "",
        rol: "",
      });

      setErrors({});
    } catch (error) {
      console.log(error);
      alert("Eroare la crearea utilizatorului.");
    }
  };

  const formIsValid =
    formData.nume.trim() && formData.prenume.trim() && formData.rol;
const [users, setUsers] = useState([]);

const [stats, setStats] = useState({
  totalUsers: 0,
  doctors: 0,
  patients: 0,
});
const filteredUsers = users.filter((user) => {
  const username = user.email?.split("@")[0] || "";
  const role =
    user.role === "DOCTOR"
      ? "medic"
      : user.role === "PATIENT"
      ? "pacient"
      : user.role === "ADMIN"
      ? "administrator"
      : user.role?.toLowerCase() || "";

  const search = searchTerm.toLowerCase();

  return (
    username.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search) ||
    role.includes(search)
  );
});
const loadDashboardData = async () => {
  try {
    const usersData = await getUsers();

    setUsers(usersData);

    setStats({
      totalUsers: usersData.length,
      doctors: usersData.filter((u) => u.role === "DOCTOR").length,
      patients: usersData.filter((u) => u.role === "PATIENT").length,
    });
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  loadDashboardData();
}, []);
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
          <a href="#" className="active">📊 Dashboard</a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminutilizatori"); }}>
            👥 Utilizatori
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminroluri"); }}>🛡️ Roluri</a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminaudit"); }}>📝 Audit</a>

        </nav>

        <div className="admin-profile">
          <div>A</div>

          <span>
            <b>Administrator</b>
            {localStorage.getItem("sw_email") || "admin@seniorwatch.com"}
          </span>
        </div>
      </aside>

      <main className="admin-main">
        <section className="admin-hero">
          <div className="admin-heroSearch">
<input
  placeholder="Caută utilizator sau rol..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>            <button>⌕</button>
          </div>
        </section>

        <section className="admin-stats">
          <div className="admin-stat">
            <div className="admin-icon purple">👥</div>
            <div>
              <p>Utilizatori</p>
<h2>{stats.totalUsers}</h2>         
     <span>total conturi platformă</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon violet">🩺</div>
            <div>
              <p>Medici</p>
<h2>{stats.doctors}</h2>              <span>conturi medicale active</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon green">📱</div>
            <div>
              <p>Pacienți</p>
<h2>{stats.patients}</h2>              <span>monitorizați în sistem</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon pink">⚠</div>
            <div>
              <p>Probleme</p>
              <h2>0</h2>
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

{[...filteredUsers]  .reverse()
  .slice(0, 5)
  .map((user) => {
    const username = user.email?.split("@")[0] || "utilizator";

    const displayName = username
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="admin-tableRow" key={user.id || user.email}>
      <span className="admin-userName">
<b>
  {displayName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase()}
</b><span>{displayName}</span>      </span>

      <span>{user.email}</span>

      <span>
        {user.role === "DOCTOR"
          ? "Medic"
          : user.role === "PATIENT"
          ? "Pacient"
          : user.role === "ADMIN"
          ? "Administrator"
          : user.role}
      </span>

      <span className="admin-badge Activ">Activ</span>

      <span className="admin-action">Editare</span>
    </div>
  );
})}
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
<span>{stats.doctors} conturi
  </span>              </div>

              <div className="admin-role">
                <strong>Pacient</strong>
<span>{stats.patients} conturi</span>              </div>
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
                  <p>
                    Completează numele, prenumele și rolul. Emailul și parola
                    se generează automat.
                  </p>
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
                    {errors.nume && (
                      <span className="admin-error">{errors.nume}</span>
                    )}
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
                    {errors.prenume && (
                      <span className="admin-error">{errors.prenume}</span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label>Email generat</label>
                    <input
                      type="text"
                      value={
                        formData.nume.trim() && formData.prenume.trim()
                          ? generateEmail()
                          : "Se generează automat"
                      }
                      readOnly
                    />
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
                    {errors.rol && (
                      <span className="admin-error">{errors.rol}</span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label>Status</label>
                    <input type="text" value="Activ implicit" readOnly />
                  </div>

                  <div className="admin-field">
                    <label>Parolă</label>
                    <input type="text" value="Generată automat" readOnly />
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

export default AdminDashboard;