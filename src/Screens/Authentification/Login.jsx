import React, { useState } from "react";
import "./Login.css";
import logo from "../../assets/logo.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>

        <div className="form-line">
            <input
                type="email"
                placeholder="Saisir votre e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>

            <div className="form-line">
            <div className="password-wrapper">
                <input
                type={showPassword ? "text" : "password"}
                placeholder="Saisir votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <button type="submit" className="btn btn-primary">Connexion</button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>Annuler</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
