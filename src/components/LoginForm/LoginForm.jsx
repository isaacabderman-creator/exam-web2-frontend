import "./LoginForm.css";
import { useState } from "react";
import useLogin from "../../utils/useLogin.jsx";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = useLogin();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form className={"login-form"} onSubmit={(e) => handleLogin(e, email, password)}>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn self-center">
          Login
        </button>
      </form>
    </div>
  );
}
export default LoginForm;
