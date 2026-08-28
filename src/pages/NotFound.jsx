import { Link } from "react-router-dom";
import { useAuth } from "../routes/AuthProvider.jsx";

export default function NotFound() {
    const { user } = useAuth();
    const homeLink = !user ? "/login" : user.role === "admin" ? "/admin" : "/student/exams";

    return (
        <div className="page">
            <div className="page-inner text-center">
                <h1 className="page-title">404</h1>
                <p className="page-subtitle mb-6">Cette page n'existe pas.</p>
                <Link to={homeLink} className="btn-primary">
                    Retour en lieu sûr
                </Link>
            </div>
        </div>
    );
}
