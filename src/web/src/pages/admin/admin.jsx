import "./admin.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createUser, getUsers, updateUser } from "../../api";
import { logoutUser } from "../../api";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};


function AdminDashboard() {
  const navigate = useNavigate();

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    rol: "",
  });

const [createdUserInfo, setCreatedUserInfo] = useState(null);

  const [errors, setErrors] = useState({});

  const [stats, setStats] = useState({
    totalUsers: 0,
    doctors: 0,
    patients: 0,
  });

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const generateEmail = () =>
    `${normalizeText(formData.prenume)}.${normalizeText(
      formData.nume
    )}@seniorwatch.com`;

  const generatePassword = () => "Senior123!";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nume.trim()) newErrors.nume = "Numele este obligatoriu";
    if (!formData.prenume.trim()) newErrors.prenume = "Prenumele este obligatoriu";
    if (!formData.rol) newErrors.rol = "Rolul este obligatoriu";

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

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    const email = generateEmail();
    const password = generatePassword();

    try {
     await createUser(email, password, formData.rol);
await loadDashboardData();

setShowCreateUser(false);

setCreatedUserInfo({
  email,
  password,
});

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

  const handleSaveEditUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, selectedUser.role);
      await loadDashboardData();

      setShowEditUser(false);
      setSelectedUser(null);
    } catch (error) {
      console.log(error);
      alert("Eroare la actualizarea utilizatorului.");
    }
  };

  const getDisplayName = (email) => {
    const username = email?.split("@")[0] || "utilizator";

    return username
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (email) =>
    getDisplayName(email)
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const formatRole = (role) => {
    if (role === "DOCTOR") return "Medic";
    if (role === "PATIENT") return "Pacient";
    if (role === "ADMIN") return "Administrator";
    return role;
  };

  const filteredUsers = users.filter((user) => {
    const username = user.email?.split("@")[0] || "";
    const role = formatRole(user.role).toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      username.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      role.includes(search)
    );
  });

  const formIsValid =
    formData.nume.trim() && formData.prenume.trim() && formData.rol;

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
          <a href="#" className="active">
            📊 Dashboard
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminutilizatori");
            }}
          >
            👥 Utilizatori
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminroluri");
            }}
          >
            🛡️ Roluri
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminaudit");
            }}
          >
            📝 Audit
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/adminhl7");
            }}
          >
            🔗 HL7 FHIR
          </a>
        </nav>
        <button className="logoutBtn" onClick={handleLogout}>
  Logout
</button>
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
            />

            <button>⌕</button>
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
              <h2>{stats.doctors}</h2>
              <span>conturi medicale active</span>
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-icon green">📱</div>

            <div>
              <p>Pacienți</p>
              <h2>{stats.patients}</h2>
              <span>monitorizați în sistem</span>
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

              {[...filteredUsers]
                .reverse()
                .slice(0, 5)
                .map((user) => (
                  <div className="admin-tableRow" key={user.id || user.email}>
                    <span className="admin-userName">
                      <b>{getInitials(user.email)}</b>
                      <span>{getDisplayName(user.email)}</span>
                    </span>

                    <span>{user.email}</span>

                    <span>{formatRole(user.role)}</span>

                    <span
                      className={`admin-badge ${
                        user.active ? "Activ" : "Inactiv"
                      }`}
                    >
                      {user.active ? "Activ" : "Inactiv"}
                    </span>

                    <button
                      className="admin-action"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditUser(true);
                      }}
                    >
                      Editare
                    </button>
                  </div>
                ))}
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
                <span>{stats.doctors} conturi</span>
              </div>

              <div className="admin-role">
                <strong>Pacient</strong>
                <span>{stats.patients} conturi</span>
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
                  <p>
                    Completează numele, prenumele și rolul. Emailul și parola se
                    generează automat.
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

                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Alege rol
                      </option>
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

      {showEditUser && selectedUser && (
        <div className="admin-modalOverlay">
          <div className="admin-modal">
            <div className="admin-modalHead">
              <div className="admin-modalTitle">
                <div className="admin-modalIcon">✏️</div>

                <div>
                  <h2>Editare utilizator</h2>
                  <p>Modifică rolul utilizatorului selectat.</p>
                </div>
              </div>

              <button
                className="admin-closeBtn"
                onClick={() => setShowEditUser(false)}
              >
                ×
              </button>
            </div>

            <div className="admin-form">
              <div className="admin-formSection">
                <h3>Date utilizator</h3>

                <div className="admin-formGrid">
                  <div className="admin-field">
                    <label>Email</label>
                    <input value={selectedUser.email} readOnly />
                  </div>

                  <div className="admin-field">
                    <label>Rol</label>

                    <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="DOCTOR">Medic</option>
                      <option value="PATIENT">Pacient</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-formActions">
                <button
                  type="button"
                  className="admin-cancelBtn"
                  onClick={() => setShowEditUser(false)}
                >
                  Renunță
                </button>

                <button
                  type="button"
                  className="admin-submitBtn"
                  onClick={handleSaveEditUser}
                >
                  Salvează modificările
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {createdUserInfo && (
  <div className="admin-modalOverlay">
    <div className="admin-modal admin-successModal">
      <div className="admin-modalHead">
        <div className="admin-modalTitle">
          <div className="admin-modalIcon">✅</div>

          <div>
            <h2>Utilizator creat cu succes</h2>
            <p>Datele de autentificare generate automat.</p>
          </div>
        </div>

        <button
          className="admin-closeBtn"
          onClick={() => setCreatedUserInfo(null)}
        >
          ×
        </button>
      </div>

      <div className="admin-form">
        <div className="admin-formSection">
          <h3>Credentiale utilizator</h3>

<div className="admin-successFields">
                <div className="admin-field">
              <label>Email</label>
              <input value={createdUserInfo.email} readOnly />
            </div>

            <div className="admin-field">
              <label>Parolă</label>
              <input value={createdUserInfo.password} readOnly />
            </div>
          </div>
        </div>

        <div className="admin-formActions">
          <button
            type="button"
            className="admin-submitBtn"
            onClick={() => setCreatedUserInfo(null)}
          >
            Am înțeles
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminDashboard;