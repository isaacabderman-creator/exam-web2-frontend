import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthProvider.jsx";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        try {
            const user = await login(email, password);
            navigate(user.role === "admin" ? "/admin" : "/student/exams");
        } catch (err) {
            setError(err.message || "Login failed");
        }
    }

    return (
        <div className="max-w-5xl mx-auto flex grid grid-cols-2 gap-8">
            <div className="py-8 px-10 flex items-center justify-center">
                <p className="font-semibold text-6xl">examhub</p>
            </div>
            <div className="flex justify-center items-center min-h-screen">
                <form className="login-form" onSubmit={handleLogin}>
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
        </div>
    );
}

export default Login;
