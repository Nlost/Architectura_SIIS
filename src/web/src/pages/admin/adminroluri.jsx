import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../api";
import "./adminroluri.css";

function AdminRoluri() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
      alert("Nu s-au putut încărca rolurile.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const doctors = users.filter((user) => user.role === "DOCTOR").length;
  const patients = users.filter((user) => user.role === "PATIENT").length;
  const admins = users.filter((user) => user.role === "ADMIN").length;
  const activeUsers = users.filter((user) => user.active).length;

  const roles = [
    {
      name: "Administrator",
      users: admins,
      color: "purple",
      permissions: ["READ", "WRITE", "DELETE", "EXPORT"],
    },
    {
      name: "Medic",
      users: doctors,
      color: "violet",
      permissions: ["READ", "WRITE", "EXPORT"],
    },
    {
      name: "Pacient",
      users: patients,
      color: "green",
      permissions: ["READ"],
    },
  ];

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
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>
            📊 Dashboard
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminutilizatori"); }}>
            👥 Utilizatori
          </a>

          <a href="#" className="active">
            🛡️ Roluri
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/admin/adminaudit"); }}>
            📝 Audit
          </a>

        </nav>

        <div className="roles-profile">
          <div>A</div>

          <span>
            <b>Administrator</b>
            {localStorage.getItem("sw_email") || "admin@clinic.ro"}
          </span>
        </div>
      </aside>

      <main className="roles-main">
        <section className="roles-hero">
          <div>
            <p>CONTROL ACCES</p>
            <h1>Roluri platformă</h1>
          </div>
        </section>

        <section className="roles-stats">
          <div className="roles-stat">
            <div className="roles-statIcon purple">🛡️</div>

            <div>
              <p>Total roluri</p>
              <h2>{roles.length}</h2>
            </div>
          </div>

          <div className="roles-stat">
            <div className="roles-statIcon green">👥</div>

            <div>
              <p>Utilizatori activi</p>
              <h2>{activeUsers}</h2>
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
          {roles.map((role) => (
            <div className="role-card" key={role.name}>
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
                  {role.permissions.map((permission) => (
                    <span key={permission}>{permission}</span>
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
    </div>
  );
}

export default AdminRoluri;