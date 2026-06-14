import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, getUsers, updateUser, toggleUserActive } from "../../api";
import "./adminutilizatori.css";
import { logoutUser } from "../../api";


const handleLogout = () => {
  logoutUser();
  window.location.href = "/login";
};


function AdminUtilizatori() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Toate");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [showForm, setShowForm] = useState(false);
const [showEditForm, setShowEditForm] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [createdUserInfo, setCreatedUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    rol: "",
  });

  const [errors, setErrors] = useState({});

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
      alert("Nu s-au putut încărca utilizatorii.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

    try {
      await createUser(email, password, formData.rol);

    setCreatedUserInfo({
  email,
  password,
});

      setShowForm(false);

      setFormData({
        nume: "",
        prenume: "",
        rol: "",
      });

      setErrors({});
      await loadUsers();
    } catch (error) {
      console.log(error);
      alert("Eroare la crearea utilizatorului.");
    }
  };


const handleEditUser = (user) => {
  setSelectedUser(user);

  const fullName = getNameFromEmail(user.email).split(" ");

  setFormData({
    nume: fullName[1] || "",
    prenume: fullName[0] || "",
    rol: user.role,
  });

  setShowEditForm(true);
};
const handleSaveEditUser = async () => {
  if (!selectedUser) return;

  try {
    await updateUser(selectedUser.id, formData.rol);
    setShowEditForm(false);
    setSelectedUser(null);
    await loadUsers();
  } catch (error) {
    console.log(error);
    alert("Eroare la actualizarea utilizatorului.");
  }
};

const handleToggleActive = async (user) => {
  try {
    await toggleUserActive(user.id, !user.active);
    await loadUsers();
  } catch (error) {
    console.log(error);
    alert("Eroare la modificarea statusului utilizatorului.");
  }
};

  const formatRole = (role) => {
    if (role === "ADMIN") return "Administrator";
    if (role === "DOCTOR") return "Medic";
    if (role === "PATIENT") return "Pacient";
    return role;
  };

  const getNameFromEmail = (email) => {
    const username = email?.split("@")[0] || "utilizator";

    return username
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (email) => {
    const name = getNameFromEmail(email);

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.active).length;
  const inactiveUsers = users.filter((user) => !user.active).length;
  const doctors = users.filter((user) => user.role === "DOCTOR").length;
  const patients = users.filter((user) => user.role === "PATIENT").length;

  const filteredUsers = users
    .filter((user) => {
      const displayName = getNameFromEmail(user.email).toLowerCase();
      const email = user.email?.toLowerCase() || "";
      const role = formatRole(user.role).toLowerCase();
      const status = user.active ? "Activ" : "Inactiv";

      const matchesSearch =
        displayName.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        role.includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "Toate" || formatRole(user.role) === roleFilter;

      const matchesStatus =
        statusFilter === "Toate" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formIsValid =
    formData.nume.trim() && formData.prenume.trim() && formData.rol;

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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin");
            }}
          >
            📊 Dashboard
          </a>

          <a href="#" className="active">
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
        <div className="users-profile">
          <div>A</div>
          <span>
            <b>Administrator</b>
            {localStorage.getItem("sw_email") || "admin@clinic.ro"}
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
              <h2>{totalUsers}</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon green">✅</div>
            <div>
              <p>Conturi active</p>
              <h2>{activeUsers}</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon violet">🩺</div>
            <div>
              <p>Medici</p>
              <h2>{doctors}</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon green">📱</div>
            <div>
              <p>Pacienți</p>
              <h2>{patients}</h2>
            </div>
          </div>

          <div className="users-stat">
            <div className="users-statIcon pink">🚫</div>
            <div>
              <p>Inactive</p>
              <h2>{inactiveUsers}</h2>
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
              placeholder="Caută după utilizator, email sau rol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option>Toate</option>
              <option>Medic</option>
              <option>Pacient</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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
              <span>Status</span>
              <span>Acțiuni</span>
            </div>

            {filteredUsers.map((user) => (
              <div className="users-row" key={user.id}>
                <span className="users-name">
                  <b>{getInitials(user.email)}</b>
                  {getNameFromEmail(user.email)}
                </span>

                <span>{user.email}</span>

                <span>{formatRole(user.role)}</span>

<span className={`users-badge ${user.active ? "Activ" : "Inactiv"}`}>
  {user.active ? "Activ" : "Inactiv"}
</span>

<span className="users-actions">
  {user.role !== "ADMIN" && (
    <>
      <button className="edit" onClick={() => handleEditUser(user)}>
        Editare
      </button>

      <button
        className={user.active ? "disable" : "activate"}
        onClick={() => handleToggleActive(user)}
      >
        {user.active ? "Dezactivează" : "Activează"}
      </button>
    </>
  )}
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
                  <p>
                    Completează numele, prenumele și rolul. Emailul și parola
                    se generează automat.
                  </p>
                </div>
              </div>

              <button
                className="users-closeBtn"
                onClick={() => setShowForm(false)}
              >
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
                    {errors.nume && (
                      <span className="users-error">{errors.nume}</span>
                    )}
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
                    {errors.prenume && (
                      <span className="users-error">{errors.prenume}</span>
                    )}
                  </div>

                  <div className="users-field">
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

                  <div className="users-field">
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
                      <span className="users-error">{errors.rol}</span>
                    )}
                  </div>

                  <div className="users-field">
                    <label>Status</label>
                    <input type="text" value="Activ implicit" readOnly />
                  </div>

                  <div className="users-field">
                    <label>Parolă</label>
                    <input type="text" value="Generată automat" readOnly />
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
      {showEditForm && (
  <div className="users-modalOverlay">
    <div className="users-modal">
      <div className="users-modalHead">
        <div className="users-modalTitle">
          <div className="users-modalIcon">✏️</div>

          <div>
            <h2>Editare utilizator</h2>
            <p>Modifică informațiile utilizatorului.</p>
          </div>
        </div>

        <button
          className="users-closeBtn"
          onClick={() => setShowEditForm(false)}
        >
          ×
        </button>
      </div>

      <form className="users-form">
        <div className="users-formSection">
          <h3>Date utilizator</h3>

          <div className="users-formGrid">
            <div className="users-field">
              <label>Nume</label>

              <input
                type="text"
                name="nume"
                value={formData.nume}
                onChange={handleChange}
              />
            </div>

            <div className="users-field">
              <label>Prenume</label>

              <input
                type="text"
                name="prenume"
                value={formData.prenume}
                onChange={handleChange}
              />
            </div>

            <div className="users-field">
              <label>Email</label>

              <input
                type="text"
                value={selectedUser?.email || ""}
                readOnly
              />
            </div>

            <div className="users-field">
              <label>Rol</label>

              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="DOCTOR">Medic</option>
                <option value="PATIENT">Pacient</option>
              </select>
            </div>
          </div>
        </div>

        <div className="users-formActions">
          <button
            type="button"
            className="users-cancelBtn"
            onClick={() => setShowEditForm(false)}
          >
            Renunță
          </button>

          <button
            type="button"
            className="users-submitBtn"
            onClick={handleSaveEditUser}
          >
            Salvează modificările
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{createdUserInfo && (
  <div className="users-modalOverlay">
    <div className="users-modal users-successModal">
      <div className="users-modalHead">
        <div className="users-modalTitle">
          <div className="users-modalIcon">✅</div>
          <div>
            <h2>Utilizator creat cu succes</h2>
            <p>Datele de autentificare generate automat.</p>
          </div>
        </div>

        <button
          className="users-closeBtn"
          onClick={() => setCreatedUserInfo(null)}
        >
          ×
        </button>
      </div>

      <div className="users-form">
        <div className="users-formSection">
          <h3>Credentiale utilizator</h3>

<div className="users-successFields">
              <div className="users-field">
              <label>Email</label>
              <input value={createdUserInfo.email} readOnly />
            </div>

            <div className="users-field">
              <label>Parolă</label>
              <input value={createdUserInfo.password} readOnly />
            </div>
          </div>
        </div>

        <div className="users-formActions">
          <button
            type="button"
            className="users-submitBtn"
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

export default AdminUtilizatori;