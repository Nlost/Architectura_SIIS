import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("sw_token", data.token);
      localStorage.setItem("sw_role", data.role);
      localStorage.setItem("sw_email", data.email);

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "DOCTOR") {
        navigate("/medic");
      } else if (data.role === "PATIENT") {
        navigate("/pacient");
      } else {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (error) {
      console.log(error);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>SeniorWatch</h1>

        <div className="login-line"></div>

        <form onSubmit={handleLogin}>
          <div className="input-box">
            <span>✉</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-box">
            <span>🔒</span>
            <input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {showPopup && (
            <div className="login-error">Email sau parolă incorectă!</div>
          )}

          <button className="login-button" type="submit">
            Autentificare
          </button>

          <button
            type="button"
            className="reset-link"
            onClick={() => setShowResetModal(true)}
          >
            Resetare parolă
          </button>
        </form>
      </div>

      {showResetModal && (
        <div className="modal-overlay">
          <div className="reset-modal">
            <h2>Resetare parolă</h2>

            <input
              type="password"
              placeholder="Noua parolă"
              className="modal-input"
            />

            <input
              type="password"
              placeholder="Confirmă parola"
              className="modal-input"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowResetModal(false)}
              >
                Anulează
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={() => setShowResetModal(false)}
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-circle"></div>
    </div>
  );
}

export default Login;