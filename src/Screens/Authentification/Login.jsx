import React, { useEffect, useState } from "react";
import "./Login.css";
import logo from "../../assets/logo.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import authService from "../../Service/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(()=>{
    localStorage.clear();
  },[]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const credentials = { email, motDePasse: password }; // use correct field names
      const token = await authService.login(credentials);
      navigate("/admin_interface");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Email ou mot de passe incorrect.");
    }
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="form-line">
          <input
            type="email"
            placeholder="Saisir votre e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-line">
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Saisir votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            Connexion
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
