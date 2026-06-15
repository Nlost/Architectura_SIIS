import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginUser, resetPassword } from "../../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
const [resetEmail, setResetEmail] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [resetMessage, setResetMessage] = useState("");
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
const handleResetPassword = async () => {
  if (!resetEmail || !newPassword || !confirmPassword) {
    setResetMessage("Completează toate câmpurile.");
    return;
  }

  if (newPassword.length < 8) {
    setResetMessage("Parola trebuie să aibă minimum 8 caractere.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setResetMessage("Parolele nu coincid.");
    return;
  }

  try {
    await resetPassword(resetEmail, newPassword);

    setResetMessage("Parola a fost resetată cu succes.");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setShowResetModal(false);
      setResetMessage("");
      setResetEmail("");
    }, 1500);
  } catch (error) {
    console.log(error);
    setResetMessage("Nu s-a putut reseta parola.");
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
  type="email"
  placeholder="Email cont"
  className="modal-input"
  value={resetEmail}
  onChange={(e) => setResetEmail(e.target.value)}
/>

<input
  type="password"
  placeholder="Noua parolă"
  className="modal-input"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
/>
<input
  type="password"
  placeholder="Confirmă parola"
  className="modal-input"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>
{resetMessage && <div className="login-error">{resetMessage}</div>}

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
  onClick={handleResetPassword}
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