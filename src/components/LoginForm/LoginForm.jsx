import "./LoginForm.css";
import { useState } from "react";
import useLogin from "../../routes/useLogin.jsx";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, error } = useLogin();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form className={"login-form"} onSubmit={(e) => handleLogin(e, email, password)}>
        {error && <p className="text-red-600">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn self-center">
          Connexion
        </button>
      </form>
    </div>
  );
}
export default LoginForm;
